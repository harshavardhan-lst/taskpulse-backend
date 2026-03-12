from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
import models
import schemas
import joblib
import os

# ==============================
# Load AI Models
# ==============================

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskPulse Backend")

model_path = os.path.join("ml", "fraud_model.pkl")

if not os.path.exists(model_path):
    raise RuntimeError("fraud_model.pkl not found inside ml folder.")

fraud_model = joblib.load(model_path)

# ==============================
# Database Dependency
# ==============================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==============================
# Quiz Generator
# ==============================

def generate_quiz(summary: str):
    questions = [
        "What was the main task completed?",
        "What was the result of the task?",
        "What did you learn from this task?"
    ]

    correct_answers = [
        summary,
        "The task was completed successfully.",
        "The task helped improve skills."
    ]

    return questions, correct_answers

# ==============================
# Create User
# ==============================

@app.post("/users")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    new_user = models.User(name=user.name, total_rewards=0)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ==============================
# Submit Task
# ==============================

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

# ==============================
# Generate Quiz
# ==============================

@app.get("/quiz/{task_id}")
def get_quiz(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    questions, _ = generate_quiz(task.summary)
    return {"quiz_questions": questions}

# ==============================
# Submit Quiz
# ==============================

@app.post("/quiz/submit")
def submit_quiz(data: schemas.QuizSubmit, db: Session = Depends(get_db)):

    task = db.query(models.Task).filter(models.Task.id == data.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    _, correct_answers = generate_quiz(task.summary)

    # --------------------------
    # AI Semantic Scoring
    # --------------------------
    score = 0

    for user_ans, correct_ans in zip(data.answers, correct_answers):
        emb1 = embedding_model.encode([user_ans])
        emb2 = embedding_model.encode([correct_ans])
        similarity = cosine_similarity(emb1, emb2)[0][0]

        # Weighted scoring (more intelligent)
        score += similarity * 10

    score = int(score)

    # --------------------------
    # Fraud Detection
    # --------------------------
    features = [[
        score,
        data.time_taken,
        data.attempts,
        data.avg_user_score,
        data.tasks_completed_today,
        data.account_age_days,
        data.previous_rewards,
        data.time_of_day
    ]]

    fraud_probability = fraud_model.predict_proba(features)[0][1]

    passed = score >= 15
    reward_granted = passed and fraud_probability < 0.6

    new_quiz = models.Quiz(
        task_id=task.id,
        score=score,
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
        "score": score,
        "fraud_probability": float(fraud_probability),
        "passed": passed,
        "reward_granted": reward_granted
    }

# ==============================
# Reward History
# ==============================

@app.get("/rewards/{user_id}")
def get_rewards(user_id: int, db: Session = Depends(get_db)):
    rewards = db.query(models.RewardHistory).filter(
        models.RewardHistory.user_id == user_id
    ).all()
    return rewards

# ==============================
# Full Task History
# ==============================

@app.get("/history/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db)):

    tasks = db.query(models.Task).filter(
        models.Task.user_id == user_id
    ).all()

    history = []

    for task in tasks:
        quiz = db.query(models.Quiz).filter(
            models.Quiz.task_id == task.id
        ).first()

        if quiz:
            # Convert fraud probability to readable risk
            if quiz.fraud_probability < 0.3:
                risk = "Low"
            elif quiz.fraud_probability < 0.7:
                risk = "Medium"
            else:
                risk = "High"

            history.append({
                "task_summary": task.summary,
                "score": quiz.score,
                "fraud_risk": risk,
                "reward_granted": quiz.reward_granted,
                "status": task.status
            })
        else:
            history.append({
                "task_summary": task.summary,
                "score": None,
                "fraud_risk": None,
                "reward_granted": False,
                "status": task.status
            })

    return history

# ==============================
# Delete User (Safe Delete)
# ==============================

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete related quizzes
    tasks = db.query(models.Task).filter(models.Task.user_id == user_id).all()

    for task in tasks:
        db.query(models.Quiz).filter(models.Quiz.task_id == task.id).delete()

    # Delete related reward history
    db.query(models.RewardHistory).filter(
        models.RewardHistory.user_id == user_id
    ).delete()

    # Delete tasks
    db.query(models.Task).filter(
        models.Task.user_id == user_id
    ).delete()

    # Delete user
    db.delete(user)

    db.commit()

    return {"message": "User and related data deleted successfully"}