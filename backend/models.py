from pydantic import BaseModel
from typing import List, Optional

class ProjectCreate(BaseModel):
    name: str
    language: str
    description: Optional[str] = None #

class SessionCreate(BaseModel):
    problemId: int
    title: str
    tags: List[str] = []
    timeSpent: int
    submittedCode: str
    aiFeedback: Optional[str] = None
    isSuccess: bool #