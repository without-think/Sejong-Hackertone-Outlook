import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from fastapi import Request, HTTPException
from dotenv import load_dotenv

load_dotenv() #

MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["hackathon_db"] #

users_col = db["users"]
projects_col = db["projects"]
sessions_col = db["sessions"] #

def oid(x):
    return str(x) if isinstance(x, ObjectId) else x

def get_uid(request: Request) -> str:
    uid = request.cookies.get("sam_uid") or request.headers.get("x-user-id")
    if not uid:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    return uid #