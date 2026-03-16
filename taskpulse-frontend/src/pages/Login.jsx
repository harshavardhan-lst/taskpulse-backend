import React, { useState } from 'react';
import { api } from '../api/client';
import useUserStore from '../store/useUserStore';
import { UserPlus, Sparkles } from 'lucide-react';

const Login = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    
    setLoading(true);
    try {
      const res = await api.createUser(name);
      setUser(res.data.id, res.data.name);
    } catch (error) {
      console.error('Login failed', error);
      alert('Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-2xl shadow-xl text-center">
      <div className="mb-6 flex justify-center">
        <div className="bg-blue-100 p-4 rounded-full">
          <Sparkles className="text-blue-600 w-10 h-10" />
        </div>
      </div>
      <h1 className="text-3xl font-black text-gray-800 mb-2">Welcome to TaskPulse</h1>
      <p className="text-gray-500 mb-8 font-medium">Gamify your habits and verify with AI</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
        />
        <button
          type="submit"
          disabled={loading || !name}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl disabled:bg-gray-300 transition flex items-center justify-center gap-2"
        >
          {loading ? "Joining..." : <>Join Now <UserPlus size={18} /></>}
        </button>
      </form>
    </div>
  );
};

export default Login;
