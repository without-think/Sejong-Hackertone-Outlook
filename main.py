from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware

# backend 패키지 내 모듈 임포트
from backend.exceptions import SAMException
from backend.routers import auth, solved, projects

app = FastAPI(title="SAM - Sejong Algorithm Master") # 

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) # 

# 전역 예외 핸들러
@app.exception_handler(SAMException)
async def sam_exception_handler(request: Request, exc: SAMException):
    return JSONResponse(status_code=exc.status_code, content={"status": "fail", "message": exc.message}) # 

# 라우터 등록
app.include_router(auth.router)
app.include_router(solved.router)
app.include_router(projects.router) # 

@app.get("/")
async def home():
    return FileResponse("index.html") # 

@app.get("/health")
async def health_check():
    return {"status": "ok"} #