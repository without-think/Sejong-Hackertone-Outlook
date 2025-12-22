import os
import requests
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from msal import ConfidentialClientApplication
from dotenv import load_dotenv

# .env 파일 로드 시도
load_dotenv()

app = FastAPI()

# 1. 환경 변수 안전하게 가져오기
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
# 포털을 수정하셨으니 'common' 혹은 실제 테넌트 ID 둘 다 가능합니다.
TENANT_ID = "6c2ea5ee-418c-4e13-8eaa-5163cdb50c67" 
REDIRECT_URI = os.getenv("REDIRECT_URI")

# [디버깅용 로그] 터미널에서 이 값이 제대로 찍히는지 확인하세요!
print(f"\n--- 설정값 체크 ---")
print(f"CLIENT_ID: {CLIENT_ID}")
print(f"REDIRECT_URI: {REDIRECT_URI}")
print(f"------------------\n")

if not CLIENT_ID or not REDIRECT_URI:
    print("❌ 에러: .env 파일을 읽지 못했거나 값이 비어있습니다!")

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPE = ["User.Read"]

# MSAL 클라이언트 초기화
msal_app = ConfidentialClientApplication(
    CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET
)

@app.get("/")
def home():
    return {"message": "서버 가동 중 - /login 으로 접속하세요."}

@app.get("/login")
def login():
    # 여기서 Redirect URI가 포털 설정과 다르면 에러가 납니다.
    auth_url = msal_app.get_authorization_request_url(SCOPE, redirect_uri=REDIRECT_URI)
    return RedirectResponse(auth_url)

@app.get("/auth/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")
    error = request.query_params.get("error")
    
    if error:
        return {"status": "error", "message": error, "desc": request.query_params.get("error_description")}
    
    if not code:
        return {"status": "error", "message": "No code provided"}

    # 토큰 교환
    result = msal_app.acquire_token_by_authorization_code(
        code, scopes=SCOPE, redirect_uri=REDIRECT_URI
    )

    if "error" in result:
        return {"status": "error", "message": result.get("error_description")}

    # 사용자 정보 요청
    access_token = result.get("access_token")
    user_data = requests.get(
        "https://graph.microsoft.com/v1.0/me",
        headers={'Authorization': f'Bearer {access_token}'}
    ).json()

    user_email = user_data.get("mail") or user_data.get("userPrincipalName")

    # 이메일 도메인 체크
    is_univ = user_email.endswith(".ac.kr") if user_email else False

    return {
        "status": "success" if is_univ else "fail",
        "email": user_email,
        "name": user_data.get("displayName"),
        "is_university_student": is_univ
    }