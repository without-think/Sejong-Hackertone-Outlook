import os
import requests
from fastapi import APIRouter, Request, JSONResponse
from fastapi.responses import RedirectResponse
from msal import ConfidentialClientApplication
from datetime import datetime
from database import users_col
from exceptions import InvalidUniversityEmailError

router = APIRouter(prefix="/auth", tags=["Authentication"])

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
TENANT_ID = "6c2ea5ee-418c-4e13-8eaa-5163cdb50c67"
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
REDIRECT_URI = os.getenv("REDIRECT_URI")

msal_app = ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)

@router.get("/login")
async def login():
    auth_url = msal_app.get_authorization_request_url(scopes=["User.Read"], redirect_uri=REDIRECT_URI)
    return RedirectResponse(auth_url)

@router.get("/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")
    result = msal_app.acquire_token_by_authorization_code(code, scopes=["User.Read"], redirect_uri=REDIRECT_URI)
    
    user_data = requests.get("https://graph.microsoft.com/v1.0/me", 
                             headers={"Authorization": f"Bearer {result['access_token']}"}).json()
    
    email = user_data.get("mail") or user_data.get("userPrincipalName")
    if not email or not email.endswith(".ac.kr"):
        raise InvalidUniversityEmailError()

    ms_uid = user_data.get("id")
    user_doc = {"uid": ms_uid, "email": email, "name": user_data.get("displayName"), "last_login": datetime.utcnow()}
    
    await users_col.update_one({"uid": ms_uid}, {"$set": user_doc, "$setOnInsert": {"createdAt": datetime.utcnow()}}, upsert=True)

    resp = JSONResponse({"status": "success", "user": {"uid": ms_uid, "name": user_doc["name"]}})
    resp.set_cookie(key="sam_uid", value=ms_uid, httponly=True)
    return resp