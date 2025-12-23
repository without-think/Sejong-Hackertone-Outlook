from fastapi import FastAPI

from backend.routers import auth, projects, solved

app = FastAPI(
    title="SAM - 세종대 알고리즘 학습 플랫폼 (MongoDB)"
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(solved.router)


@app.get("/health")
async def health():
    return {"status": "ok"}