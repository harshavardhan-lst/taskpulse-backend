import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import useUserStore from '../store/useUserStore';

export const useQuiz = (taskId) => {
  const { userId } = useUserStore();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [attempts, setAttempts] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  // Track the start time for the fraud detection metric
  useEffect(() => {
    if (taskId) {
      api.getQuiz(taskId).then((res) => {
        const quizData = res.data.quiz_questions;
        setQuestions(quizData);
        setAnswers(new Array(quizData.length).fill(''));
        setStartTime(Date.now());
        setLoading(false);
      }).catch(err => {
        console.error('Failed to load quiz:', err);
        setLoading(false);
      });
    }
  }, [taskId]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds

    // Pass the original question objects and user answers to the backend
    // The backend will use Gemini to evaluate answers against these questions
    const quizData = {
      task_id: parseInt(taskId),
      questions: questions,   // Pass full question objects for Gemini to grade
      answers: answers,
      time_taken: timeTaken,
      attempts: attempts,
      avg_user_score: 80, 
      tasks_completed_today: 3,
      account_age_days: 10,
      previous_rewards: 5,
      time_of_day: new Date().getHours(),
    };

    try {
      const res = await api.submitQuiz(quizData);
      setResult(res.data);
      return res.data;
    } catch (error) {
      console.error('Quiz submission failed', error);
      setAttempts((prev) => prev + 1); // Increment attempts if failed or re-trying
      throw error;
    }
  };

  return {
    questions,
    answers,
    loading,
    result,
    handleAnswerChange,
    submitQuiz,
  };
};
