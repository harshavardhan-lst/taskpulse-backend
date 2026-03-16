import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  createUser: (name) => client.post('/users', { name }),
  submitTask: (user_id, summary) => client.post('/tasks', { user_id, summary }),
  getQuiz: (task_id) => client.get(`/quiz/${task_id}`),
  submitQuiz: (data) => client.post('/quiz/submit', data),
  getRewards: (user_id) => client.get(`/rewards/${user_id}`),
  getHistory: (user_id) => client.get(`/history/${user_id}`),
};

export default client;
