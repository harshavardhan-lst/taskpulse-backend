from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    total_rewards = Column(Integer, default=0)

    tasks = relationship("Task", back_populates="user")
    rewards = relationship("RewardHistory", back_populates="user")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    summary = Column(Text, nullable=False)
    status = Column(String, default="submitted")  # submitted / passed / rewarded

    user = relationship("User", back_populates="tasks")
    quiz = relationship("Quiz", back_populates="task", uselist=False)


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    score = Column(Integer)
    fraud_probability = Column(Float)
    reward_granted = Column(Boolean, default=False)

    task = relationship("Task", back_populates="quiz")


class RewardHistory(Base):
    __tablename__ = "reward_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    reward_name = Column(String)
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="rewards")