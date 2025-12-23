import os
import requests
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, FileResponse
from msal import ConfidentialClientApplication
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# .env 로드
load_dotenv()

app = FastAPI(title="세종대 대학생 인증 API (MongoDB)")

# =====================
# 환경 변수
# =====================
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
TENANT_ID = "6c2ea5ee-418c-4e13-8eaa-5163cdb50c67"
REDIRECT_URI = os.getenv("REDIRECT_URI")
MONGO_URI = os.getenv("MONGO_URI")

if not CLIENT_ID or not CLIENT_SECRET or not REDIRECT_URI:
    raise RuntimeError("CLIENT_ID / CLIENT_SECRET / REDIRECT_URI 누락")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI 누락 (docker-compose 확인)")

# =====================
# MongoDB
# =====================
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client["hackathon_db"]
users_collection = db["users"]

# =====================
# MSAL 설정
# =====================
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPE = ["User.Read"]

msal_app = ConfidentialClientApplication(
    CLIENT_ID,
    authority=AUTHORITY,
    client_credential=CLIENT_SECRET
)

# =====================
# Routes
# =====================
@app.get("/")
async def home():
    return FileResponse("index.html")


@app.get("/login")
async def login():
    auth_url = msal_app.get_authorization_request_url(
        scopes=SCOPE,
        redirect_uri=REDIRECT_URI
    )
    return RedirectResponse(auth_url)


@app.get("/auth/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")

    if not code:
        raise HTTPException(status_code=400, detail="인증 코드가 없습니다.")

    # 1. 토큰 교환
    result = msal_app.acquire_token_by_authorization_code(
        code,
        scopes=SCOPE,
        redirect_uri=REDIRECT_URI
    )

    if "error" in result:
        raise HTTPException(
            status_code=400,
            detail=result.get("error_description")
        )

    # 2. 사용자 정보 조회
    access_token = result["access_token"]
    user_data = requests.get(
        "https://graph.microsoft.com/v1.0/me",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()

    user_email = user_data.get("mail") or user_data.get("userPrincipalName")
    display_name = user_data.get("displayName")
    ms_uid = user_data.get("id")

    if not user_email:
        raise HTTPException(status_code=400, detail="이메일 정보를 가져오지 못했습니다.")

    # 3. 대학 메일 검증
    if not user_email.endswith(".ac.kr"):
        return {
            "status": "fail",
            "message": "대학교 계정이 아닙니다."
        }

    # 4. MongoDB 저장 (upsert)
    user_doc = {
        "uid": ms_uid,
        "email": user_email,
        "name": display_name,
        "role": "student",
        "provider": "microsoft",
        "last_login": datetime.utcnow()
    }

    await users_collection.update_one(
        {"uid": ms_uid},
        {"$set": user_doc},
        upsert=True
    )

    return {
        "status": "success",
        "message": "회원 인증 완료",
        "user": {
            "name": display_name,
            "email": user_email
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}