from fastapi import FastAPI
from fastapi.responses import FileResponse
from routers import auth, projects # 분리한 라우터들

app = FastAPI(title="SAM API")

# 라우터 연결
app.include_router(auth.router)
app.include_router(projects.router)

@app.get("/")
async def home():
    return FileResponse("index.html")

@app.get("/health")
async def health_check():
    return {"status": "ok"}