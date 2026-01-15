# TaskPulse Backend Implementation TODO

## Step 1: Update requirements.txt 
- Add FastAPI, Uvicorn, SQLAlchemy, Pydantic dependencies

## Step 2: Implement models.py 
- Define User model (id, name, xp, streak)
- Define Habit model (id, user_id, habit_name, frequency)
- Define TaskCompletion model (id, habit_id, completion_date)

## Step 3: Implement database.py 
- Set up SQLAlchemy engine and session for SQLite
- Create Base class for models

## Step 4: Implement schemas.py 
- Define Pydantic schemas for UserCreate, UserResponse, HabitCreate, HabitResponse, TaskCompletionCreate, LeaderboardEntry

## Step 5: Implement crud.py 
- Create functions for user CRUD
- Create functions for habit CRUD
- Create functions for task completion and streak/XP logic
- Create function for leaderboard retrieval

## Step 6: Implement main.py 
- Set up FastAPI app
- Define endpoints: POST /users, POST /habits, GET /habits/{user_id}, POST /complete-habit, GET /leaderboard
- Implement business logic for habit completion (XP +10, streak update)

## Step 7: Install dependencies and test
- Run pip install -r requirements.txt
- Run uvicorn main:app --reload to test the API
