from fastapi import APIRouter, Request
import httpx
from backend.database import users_col, get_uid
from backend.exceptions import BojApiError
from datetime import datetime, timezone

router = APIRouter(prefix="/solved", tags=["Solved.ac"]) # 

@router.get("/user/{handle}")
async def solved_user(handle: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(f"https://solved.ac/api/v3/user/show?handle={handle}")
    if r.status_code != 200: raise BojApiError()
    data = r.json()
    return {"handle": handle, "tier": data["tier"], "rating": data["rating"]} # 

@router.post("/register")
async def register_boj_handle(request: Request, handle: str):
    uid = get_uid(request)
    async with httpx.AsyncClient() as client:
        r = await client.get(f"https://solved.ac/api/v3/user/show?handle={handle}")
    if r.status_code != 200: raise BojApiError()
    data = r.json()

    await users_col.update_one({"uid": uid}, {"$set": {"bojHandle": handle, "tier": data["tier"], "bojUpdatedAt": datetime.now(timezone.utc)}})
    return {"status": "success", "handle": handle} # 

@router.get("/recommend")
async def recommend_problem(tag: str, tier: int):
    query = f"tag:{tag} tier:{tier-1}..{tier+1}"
    async with httpx.AsyncClient() as client:
        r = await client.get("https://solved.ac/api/v3/search/problem", params={"query": query, "sort": "level", "limit": 5})
    if r.status_code != 200: raise BojApiError()
    items = r.json().get("items", [])
    return [{"problemId": p["problemId"], "title": p["titleKo"], "level": p["level"]} for p in items] #