from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
import models
import schemas
import joblib
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskPulse Backend")

# Load fraud model
if not os.path.exists("fraud_model.pkl"):
    raise RuntimeError("fraud_model.pkl not found. Train model first.")

fraud_model = joblib.load("fraud_model.pkl")


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Simple quiz generator
def generate_quiz(summary: str):
    return [
        "What was the main task completed?",
        "What was the result of the task?",
        "What did you learn from this task?"
    ]


# Create User
@app.post("/users")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    new_user = models.User(name=user.name, total_rewards=0)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# Submit Task
@app.post("/tasks")
def submit_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == task.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_task = models.Task(
        user_id=task.user_id,
        summary=task.summary,
        status="pending"
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task submitted successfully",
        "task_id": new_task.id
    }


# Generate Quiz
@app.get("/quiz/{task_id}")
def get_quiz(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    questions = generate_quiz(task.summary)
    return {"quiz_questions": questions}


# Submit Quiz
@app.post("/quiz/submit")
def submit_quiz(data: schemas.QuizSubmit, db: Session = Depends(get_db)):

    task = db.query(models.Task).filter(models.Task.id == data.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    features = [[
        data.score,
        data.time_taken,
        data.attempts,
        data.avg_user_score,
        data.tasks_completed_today,
        data.account_age_days,
        data.previous_rewards,
        data.time_of_day
    ]]

    fraud_probability = fraud_model.predict_proba(features)[0][1]

    passed = data.score >= 15
    reward_granted = passed and fraud_probability < 0.6

    new_quiz = models.Quiz(
        task_id=task.id,
        score=data.score,
        fraud_probability=fraud_probability,
        reward_granted=reward_granted
    )

    db.add(new_quiz)

    if reward_granted:
        task.status = "rewarded"

        reward_entry = models.RewardHistory(
            user_id=task.user_id,
            reward_name="Skill Badge Earned"
        )

        user = db.query(models.User).filter(models.User.id == task.user_id).first()
        user.total_rewards += 1

        db.add(reward_entry)

    db.commit()

    return {
        "score": data.score,
        "fraud_probability": float(fraud_probability),
        "passed": passed,
        "reward_granted": reward_granted
    }


# View Reward History
@app.get("/rewards/{user_id}")
def get_rewards(user_id: int, db: Session = Depends(get_db)):
    rewards = db.query(models.RewardHistory).filter(
        models.RewardHistory.user_id == user_id
    ).all()
    return rewards