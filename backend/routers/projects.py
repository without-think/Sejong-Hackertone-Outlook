from fastapi import APIRouter, Request
from database import projects_col, get_uid, oid
from models import ProjectCreate, SessionCreate
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("")
async def create_project(request: Request, body: ProjectCreate):
    uid = get_uid(request)
    doc = {
        "userId": uid, 
        "name": body.name, 
        "language": body.language,
        "description": body.description,
        "problemCount": 0, 
        "createdAt": datetime.utcnow()
    }
    r = await projects_col.insert_one(doc)
    return {"status": "success", "id": str(r.inserted_id)}

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
    } async for p in cursor]

@router.get("/{project_id}")
async def get_project(request: Request, project_id: str):
    uid = get_uid(request)
    pid = ObjectId(project_id)
    p = await projects_col.find_one({"_id": pid, "userId": uid})
    return {
        "id": oid(p["_id"]),
        "name": p["name"],
        "description": p.get("description"),
        "language": p["language"],
        "problemCount": p["problemCount"]
    }