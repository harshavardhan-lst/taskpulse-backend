from sqlalchemy.orm import Session
from models import User, Habit, TaskCompletion
from schemas import UserCreate, HabitCreate, TaskCompletionCreate
from datetime import date, timedelta

def create_user(db: Session, user: UserCreate):
    db_user = User(name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_habit(db: Session, habit: HabitCreate, user_id: int):
    db_habit = Habit(**habit.dict(), user_id=user_id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

def get_habits_by_user(db: Session, user_id: int):
    return db.query(Habit).filter(Habit.user_id == user_id).all()

def complete_habit(db: Session, completion: TaskCompletionCreate):
    # Check if already completed today
    existing = db.query(TaskCompletion).filter(
        TaskCompletion.habit_id == completion.habit_id,
        TaskCompletion.completion_date == completion.completion_date
    ).first()
    if existing:
        return None  # Already completed

    # Create completion
    db_completion = TaskCompletion(**completion.dict())
    db.add(db_completion)

    # Update user XP and streak
    habit = db.query(Habit).filter(Habit.id == completion.habit_id).first()
    user = habit.user
    user.xp += 10

    # Calculate streak
    yesterday = completion.completion_date - timedelta(days=1)
    yesterday_completion = db.query(TaskCompletion).filter(
        TaskCompletion.habit_id == completion.habit_id,
        TaskCompletion.completion_date == yesterday
    ).first()
    if yesterday_completion:
        user.streak += 1
    else:
        user.streak = 1

    db.commit()
    db.refresh(user)
    return db_completion

def get_leaderboard(db: Session):
    return db.query(User).order_by(User.xp.desc(), User.streak.desc()).all()
