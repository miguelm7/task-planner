from pydantic import BaseModel

class TaskBase(BaseModel):
    title: str
    description: str | None = None
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int

    class Config:
        from_attributes = True

class TaskUpdate(BaseModel):
    title: str
    completed: bool
