import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
import models
import schemas

load_dotenv()
_gemini_client = None

def get_gemini_client():
    global _gemini_client
    if _gemini_client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                from google import genai as genai_client
                _gemini_client = genai_client.Client(api_key=api_key)
                print("Gemini client initialized successfully.")
            except Exception as e:
                print(f"Error initializing Gemini client: {e}")
        else:
            print("Warning: GEMINI_API_KEY not found in environment variables.")
    return _gemini_client

# ==============================
# Load AI Models
# ==============================

_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
            print("Embedding model loaded successfully.")
        except Exception as e:
            print(f"Error loading embedding model: {e}")
    return _embedding_model

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskPulse Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_path = os.path.join("ml", "fraud_model.pkl")
fraud_model = None

try:
    if not os.path.exists(model_path):
        print(f"Warning: {model_path} not found. Fraud detection will be disabled.")
    else:
        import joblib
        fraud_model = joblib.load(model_path)
        print("ML model loaded successfully.")
except Exception as e:
    print(f"Error loading ML model: {e}")

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
    """
    Uses Google Gemini to generate 1 theory question and 2 MCQs based on the user's task summary.
    """
    
    fallback = [
        {"id": 0, "type": "theory", "question": "What was the main task completed?", "expected_answer": summary},
        {"id": 1, "type": "mcq", "question": "Was it completed successfully?", "options": ["Yes", "No", "Maybe", "I don't know"], "expected_answer": "Yes"},
        {"id": 2, "type": "mcq", "question": "How did you feel?", "options": ["Good", "Bad", "Okay", "Tired"], "expected_answer": "Good"}
    ]
    
    if not os.getenv("GEMINI_API_KEY"):
        return fallback, [] # Second element unused now
        
    prompt = f"""
    The user completed a habit/task with this summary: "{summary}"
    
    Generate exactly 3 specific questions about this task to verify they actually did it.
    Question 1 MUST be a "theory" question requiring a text answer.
    Questions 2 and 3 MUST be "mcq" (Multiple Choice) with exactly 4 "options".
    
    Return ONLY a JSON object in this exact format, with no markdown formatting or extra text:
    {{
      "questions": [
        {{
          "id": 0,
          "type": "theory",
          "question": "What algorithm did you use?",
          "expected_answer": "Explanation of algorithm..."
        }},
        {{
          "id": 1,
          "type": "mcq",
          "question": "Which of these is the correct logic?",
          "options": ["A", "B", "C", "D"],
          "expected_answer": "B"
        }}
      ]
    }}
    """
    
    try:
        client = get_gemini_client()
        if not client:
            raise Exception("No Gemini client available")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        text = response.text.strip()
        
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        result = json.loads(text)
        
        if len(result.get("questions", [])) == 3:
            return result["questions"], []
        else:
            print(f"Gemini returned {len(result.get('questions',[]))} questions, expected 3. Using fallback.")
            return fallback, []
            
    except Exception as e:
        print(f"Gemini Quiz Generation Error: {e}")
        return fallback, []


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

    # --------------------------
    # AI Gemini Scoring
    # --------------------------
    prompt = f"""
    The user completed this task summary: "{task.summary}"
    
    They were asked the following verification questions:
    {json.dumps(data.questions)}
    
    They provided the following answers respectively:
    {json.dumps(data.answers)}
    
    Act as a strict teacher. Evaluate the answers for correctness.
    If the answers do not make sense in response to the question, score them 0.
    Provide a score between 0 and 30 (30 is perfect, 10 points per question).
    Provide a short, educational explanation describing what they got right or wrong.
    
    Return ONLY a JSON object exactly like this:
    {{
      "score": 25,
      "explanation": "Great job, but your first answer was too short..."
    }}
    """

    try:
        client = get_gemini_client()
        if not client:
            raise Exception("No Gemini client available")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        text = response.text.strip()
        if text.startswith("```json"): text = text[7:-3].strip()
        elif text.startswith("```"): text = text[3:-3].strip()
        result = json.loads(text)
        score = int(result.get("score", 0))
        explanation = result.get("explanation", "Verification complete.")
    except Exception as e:
        print(f"Gemini Evaluation Error: {e}")
        score = 15  # Default pass
        explanation = "AI evaluation unavailable. Default score provided."

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

    if fraud_model:
        try:
            fraud_probability = fraud_model.predict_proba(features)[0][1]
        except Exception as e:
            print(f"Fraud prediction error: {e}")
            fraud_probability = 0.5 # Neutral fallback
    else:
        fraud_probability = 0.2 # Default safe probability

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
        "score": int(score),
        "fraud_probability": float(fraud_probability),
        "passed": bool(passed),
        "reward_granted": bool(reward_granted),
        "explanation": str(explanation)
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