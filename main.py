import os
import requests
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, FileResponse, JSONResponse
from msal import ConfidentialClientApplication
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId

load_dotenv()

app = FastAPI(title="SAM - 세종대 알고리즘 학습 플랫폼 (MongoDB)")

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
projects_collection = db["projects"]
sessions_collection = db["sessions"]

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
# Schemas
# =====================
class ProjectCreate(BaseModel):
    name: str
    language: str
class SessionCreate(BaseModel):
    problemId: int
    title: str
    tags: list[str] = []
    timeSpent: int
    submittedCode: str
    aiFeedback: str | None = None
    isSuccess: bool

def oid(x):
    return str(x) if isinstance(x, ObjectId) else x

def get_uid(request: Request) -> str:
    uid = request.cookies.get("sam_uid")
    if not uid:
        uid = request.headers.get("x-user-id")
    if not uid:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다. (/login 먼저)")
    return uid

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

    result = msal_app.acquire_token_by_authorization_code(
        code,
        scopes=SCOPE,
        redirect_uri=REDIRECT_URI
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result.get("error_description"))

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

    if not user_email.endswith(".ac.kr"):
        return {"status": "fail", "message": "대학교 계정이 아닙니다."}

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
        {"$set": user_doc, "$setOnInsert": {"createdAt": datetime.utcnow()}},
        upsert=True
    )

    resp = JSONResponse({
        "status": "success",
        "message": "회원 인증 완료",
        "user": {"uid": ms_uid, "name": display_name, "email": user_email}
    })
    resp.set_cookie(
        key="sam_uid",
        value=ms_uid,
        httponly=True,
        samesite="lax"
    )
    return resp

@app.get("/solved/user/{handle}")
async def solved_user(handle: str):
    r = requests.get(
        "https://solved.ac/api/v3/user/show",
        params={"handle": handle}
    )

    if r.status_code != 200:
        raise HTTPException(status_code=404, detail="BOJ 유저 없음")

    data = r.json()

    return {
        "handle": handle,
        "tier": data["tier"],
        "rating": data["rating"],
        "solvedCount": data["solvedCount"]
    }
@app.post("/users/boj")
async def register_boj_handle(request: Request, handle: str):
    uid = get_uid(request)

    r = requests.get(
        "https://solved.ac/api/v3/user/show",
        params={"handle": handle}
    )

    if r.status_code != 200:
        raise HTTPException(404, "BOJ 핸들 없음")

    data = r.json()

    await users_collection.update_one(
        {"uid": uid},
        {"$set": {
            "bojHandle": handle,
            "tier": data["tier"],
            "rating": data["rating"],
            "solvedCount": data["solvedCount"],
            "bojUpdatedAt": datetime.utcnow()
        }}
    )

    return {
        "status": "success",
        "bojHandle": handle,
        "tier": data["tier"]
    }
@app.get("/solved/recommend")
async def recommend_problem(tag: str, tier: int):
    query = f"tag:{tag} tier:{tier-1}..{tier+1}"

    r = requests.get(
        "https://solved.ac/api/v3/search/problem",
        params={
            "query": query,
            "sort": "level",
            "direction": "asc",
            "limit": 5
        }
    )

    items = r.json().get("items", [])

    return [
        {
            "problemId": p["problemId"],
            "title": p["titleKo"],
            "level": p["level"],
            "tags": [t["key"] for t in p["tags"]]
        }
        for p in items
    ]
# =====================
# Projects (프로젝트 스키마 실사용)
# =====================
@app.post("/projects")
async def create_project(request: Request, body: ProjectCreate):
    uid = get_uid(request)

    doc = {
        "userId": uid,
        "name": body.name,
        "language": body.language,
        "problemCount": 0,
        "createdAt": datetime.utcnow()
    }

    r = await projects_collection.insert_one(doc)

    return {
        "status": "success",
        "project": {
            "id": str(r.inserted_id),
            "userId": uid,
            "name": body.name,
            "language": body.language,
            "problemCount": 0,
            "createdAt": doc["createdAt"]
        }
    }


@app.get("/projects")
async def list_projects(request: Request):
    uid = get_uid(request)

    out = []
    cursor = projects_collection.find({"userId": uid}).sort("createdAt", -1)
    async for p in cursor:
        out.append({
            "id": oid(p.get("_id")),
            "userId": p.get("userId"),
            "name": p.get("name"),
            "language": p.get("language"),
            "problemCount": p.get("problemCount", 0),
            "createdAt": p.get("createdAt")
        })
    return out


@app.get("/projects/{project_id}")
async def get_project(request: Request, project_id: str):
    uid = get_uid(request)

    try:
        pid = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="project_id 형식이 올바르지 않습니다.")

    p = await projects_collection.find_one({"_id": pid, "userId": uid})
    if not p:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")

    return {
        "id": oid(p.get("_id")),
        "userId": p.get("userId"),
        "name": p.get("name"),
        "language": p.get("language"),
        "problemCount": p.get("problemCount", 0),
        "createdAt": p.get("createdAt")
    }

@app.post("/projects/{project_id}/sessions")
async def create_session(
    request: Request,
    project_id: str,
    body: SessionCreate
):
    uid = get_uid(request)

    try:
        pid = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="project_id 형식 오류")

    project = await projects_collection.find_one({"_id": pid, "userId": uid})
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트 없음")

    session_doc = {
        "userId": uid,
        "projectId": pid,
        "problemId": body.problemId,
        "title": body.title,
        "tags": body.tags,
        "timeSpent": body.timeSpent,
        "submittedCode": body.submittedCode,
        "aiFeedback": body.aiFeedback,
        "isSuccess": body.isSuccess,
        "createdAt": datetime.utcnow()
    }

    await sessions_collection.insert_one(session_doc)

    await projects_collection.update_one(
        {"_id": pid},
        {"$inc": {"problemCount": 1}}
    )

    return {"status": "success", "message": "세션 저장 완료"}
@app.get("/projects/{project_id}/sessions")
async def list_sessions(request: Request, project_id: str):
    uid = get_uid(request)

    try:
        pid = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="project_id 형식 오류")

    sessions = []
    cursor = sessions_collection.find(
        {"projectId": pid, "userId": uid}
    ).sort("createdAt", -1)

    async for s in cursor:
        sessions.append({
            "id": str(s["_id"]),
            "problemId": s["problemId"],
            "title": s["title"],
            "tags": s["tags"],
            "timeSpent": s["timeSpent"],
            "isSuccess": s["isSuccess"],
            "createdAt": s["createdAt"]
        })

    return sessions
@app.get("/health")
async def health_check():
    return {"status": "ok"}