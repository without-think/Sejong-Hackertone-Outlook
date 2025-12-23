from fastapi import APIRouter, Request, HTTPException
from backend.database import projects_col, get_uid, oid
from backend.models import ProjectCreate
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone

router = APIRouter(prefix="/projects", tags=["Projects"]) #

@router.post("")
async def create_project(request: Request, body: ProjectCreate):
    uid = get_uid(request)
    doc = {
        "userId": uid, 
        "name": body.name, 
        "language": body.language,
        "description": body.description,
        "problemCount": 0, 
        "createdAt": datetime.now(timezone.utc)
    }
    r = await projects_col.insert_one(doc)
    return {"status": "success", "id": str(r.inserted_id)} #

@router.get("")
async def list_projects(request: Request):
    uid = get_uid(request)
    cursor = projects_col.find({"userId": uid}).sort("createdAt", -1)
    
    return [{
        "id": oid(p["_id"]), 
        "name": p["name"], 
        "language": p.get("language"),
        "description": p.get("description"),
        "problemCount": p["problemCount"]
    } async for p in cursor] #

@router.get("/{project_id}")
async def get_project(request: Request, project_id: str):
    uid = get_uid(request)
    try:
        pid = ObjectId(project_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="유효하지 않은 ID 형식입니다.")
        
    p = await projects_col.find_one({"_id": pid, "userId": uid})
    if not p:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
        
    return {
        "id": oid(p["_id"]),
        "name": p["name"],
        "description": p.get("description"),
        "language": p["language"],
        "problemCount": p["problemCount"]
    } #