import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Target } from 'lucide-react';

const AddHabitModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [xpReward, setXpReward] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd({
      id: Date.now().toString(),
      title,
      streak: 0,
      xpReward: parseInt(xpReward),
      isCompleted: false
    });
    
    setTitle('');
    setXpReward(10);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 text-white/70 hover:text-white transition"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black mb-1">New Quest</h2>
              <p className="text-blue-100 font-medium text-sm">Create a new habit to track</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Target size={18} className="text-blue-500" />
                  Habit Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Read 10 pages, Drink Water..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Trophy size={18} className="text-orange-500" />
                  XP Reward
                </label>
                <select
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium appearance-none"
                >
                  <option value="10">Easy (+10 XP)</option>
                  <option value="25">Medium (+25 XP)</option>
                  <option value="50">Hard (+50 XP)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!title.trim()}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black hover:shadow-xl disabled:bg-gray-300 disabled:shadow-none transition mt-4"
              >
                Create Habit
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddHabitModal;
