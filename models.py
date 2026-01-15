from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)

    habits = relationship("Habit", back_populates="user")

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    habit_name = Column(String, index=True)
    frequency = Column(String, default="daily")

    user = relationship("User", back_populates="habits")
    completions = relationship("TaskCompletion", back_populates="habit")

class TaskCompletion(Base):
    __tablename__ = "task_completions"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    completion_date = Column(Date, index=True)

    habit = relationship("Habit", back_populates="completions")
