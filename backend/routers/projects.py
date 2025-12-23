from fastapi import APIRouter, Request, HTTPException
from database import projects_col, sessions_col, get_uid, oid
from models import ProjectCreate, SessionCreate
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("")
async def create_project(request: Request, body: ProjectCreate):
    uid = get_uid(request)
    doc = {"userId": uid, "name": body.name, "language": body.language, "problemCount": 0, "createdAt": datetime.utcnow()}
    r = await projects_col.insert_one(doc)
    return {"status": "success", "id": str(r.inserted_id)}

@router.get("")
async def list_projects(request: Request):
    uid = get_uid(request)
    cursor = projects_col.find({"userId": uid}).sort("createdAt", -1)
    return [{"id": oid(p["_id"]), "name": p["name"], "problemCount": p["problemCount"]} async for p in cursor]

@router.post("/{project_id}/sessions")
async def create_session(request: Request, project_id: str, body: SessionCreate):
    uid = get_uid(request)
    pid = ObjectId(project_id)
    session_doc = {**body.dict(), "userId": uid, "projectId": pid, "createdAt": datetime.utcnow()}
    await sessions_col.insert_one(session_doc)
    await projects_col.update_one({"_id": pid}, {"$inc": {"problemCount": 1}})
    return {"status": "success"}