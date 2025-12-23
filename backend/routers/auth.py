from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from msal import ConfidentialClientApplication
from datetime import datetime
import requests
import os
from database import users_col

router = APIRouter(prefix="/auth", tags=["Authentication"])

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
AUTHORITY = f"https://login.microsoftonline.com/6c2ea5ee-418c-4e13-8eaa-5163cdb50c67"
REDIRECT_URI = os.getenv("REDIRECT_URI")

msal_app = ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)

@router.get("/login")
async def login():
    auth_url = msal_app.get_authorization_request_url(scopes=["User.Read"], redirect_uri=REDIRECT_URI)
    return RedirectResponse(auth_url)

@router.get("/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")
    # ... (토큰 획득 및 학교 메일 검증 로직 동일)
    # DB 저장 및 쿠키 설정 후 응답 반환