from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base
from crud import create_user, get_user, create_habit, get_habits_by_user, complete_habit, get_leaderboard
from schemas import UserCreate, UserResponse, HabitCreate, HabitResponse, TaskCompletionCreate, LeaderboardEntry
from datetime import date

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskPulse API")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users", response_model=UserResponse)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db=db, user=user)

@app.post("/habits", response_model=HabitResponse)
def create_new_habit(habit: HabitCreate, user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return create_habit(db=db, habit=habit, user_id=user_id)

@app.get("/habits/{user_id}", response_model=list[HabitResponse])
def get_user_habits(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_habits_by_user(db=db, user_id=user_id)

@app.post("/complete-habit")
def complete_user_habit(completion: TaskCompletionCreate, db: Session = Depends(get_db)):
    result = complete_habit(db=db, completion=completion)
    if not result:
        raise HTTPException(status_code=400, detail="Habit already completed today")
    return {"message": "Habit completed successfully"}

@app.get("/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard_data(db: Session = Depends(get_db)):
    return get_leaderboard(db=db)
