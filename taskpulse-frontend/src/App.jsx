import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import useUserStore from './store/useUserStore';

const App = () => {
  const { userId } = useUserStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b py-4 px-8 flex justify-between items-center shadow-sm">
          <div className="text-2xl font-black text-blue-600 tracking-tight">TaskPulse</div>
          {userId && (
            <button 
              onClick={() => useUserStore.getState().logout()}
              className="text-sm font-medium text-gray-500 hover:text-red-600 transition"
            >
              Sign Out
            </button>
          )}
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
          <Routes>
            <Route path="/login" element={!userId ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={userId ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/quiz/:taskId" element={userId ? <QuizPage /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={userId ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
