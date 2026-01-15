from pydantic import BaseModel
from typing import List
from datetime import date

class UserCreate(BaseModel):
    name: str

class UserResponse(BaseModel):
    id: int
    name: str
    xp: int
    streak: int

    class Config:
        orm_mode = True

class HabitCreate(BaseModel):
    habit_name: str
    frequency: str = "daily"

class HabitResponse(BaseModel):
    id: int
    user_id: int
    habit_name: str
    frequency: str

    class Config:
        orm_mode = True

class TaskCompletionCreate(BaseModel):
    habit_id: int
    completion_date: date

class LeaderboardEntry(BaseModel):
    id: int
    name: str
    xp: int
    streak: int

    class Config:
        orm_mode = True
