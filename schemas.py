from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str


class TaskCreate(BaseModel):
    user_id: int
    summary: str


class QuizSubmit(BaseModel):
    task_id: int
    score: int
    time_taken: int
    attempts: int
    avg_user_score: int
    tasks_completed_today: int
    account_age_days: int
    previous_rewards: int
    time_of_day: int


class RewardHistoryResponse(BaseModel):
    reward_name: str

    class Config:
        orm_mode = True