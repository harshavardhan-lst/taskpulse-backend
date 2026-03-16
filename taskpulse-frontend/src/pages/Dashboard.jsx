import React, { useState } from 'react';
import useUserStore from '../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trophy, Flame, Target } from 'lucide-react';
import HabitCard from '../components/HabitCard';
import AddHabitModal from '../components/AddHabitModal';
import TaskSummaryModal from '../components/TaskSummaryModal';
import LevelUpOverlay from '../components/LevelUpOverlay';

const Dashboard = () => {
  const { userName } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habits, setHabits] = useState([
    { id: '1', title: 'Drink 8 glasses of water', streak: 3, xpReward: 10, isCompleted: false },
    { id: '2', title: 'Read 20 pages', streak: 12, xpReward: 25, isCompleted: true },
    { id: '3', title: 'Code for 1 hour', streak: 0, xpReward: 50, isCompleted: false },
  ]);

  const [activeHabit, setActiveHabit] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Derived state (Normally this would come from the backend total_rewards query)
  const totalXP = habits.filter(h => h.isCompleted).reduce((sum, h) => sum + h.xpReward, 0) + 120; // base test XP
  const longestStreak = Math.max(...habits.map(h => h.streak), 0);
  
  // Calculate Level (Every 100 XP is 1 level)
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const xpIntoLevel = totalXP % 100;
  
  // Quick test function to trigger the overlay manually (for demo purposes)
  const triggerLevelUp = () => setShowLevelUp(true);

  const handleHabitClick = (habit) => {
    if (habit.isCompleted) return; // Prevent re-doing completed habits for now
    setActiveHabit(habit);
  };

  const addHabit = (newHabit) => {
    setHabits([newHabit, ...habits]);
  };

  return (
    <div className="py-8 max-w-5xl mx-auto space-y-10">
      
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
            {userName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">Welcome back, {userName}!</h1>
            <p className="text-gray-500 font-medium">Ready to conquer your tasks today?</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold font-medium flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
        >
          <Plus size={20} /> New Habit
        </button>
      </motion.div>

      {/* Gamified Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 opacity-10">
            <Trophy size={160} className="text-blue-500 -translate-y-10 translate-x-10" />
          </div>
          <div className="flex items-center gap-3 text-blue-600 font-bold mb-2">
            <div className="bg-blue-200 p-2 rounded-lg cursor-pointer hover:bg-blue-300 transition" onClick={triggerLevelUp} title="Click to test Level Up Modal!">
              <Trophy size={20} />
            </div>
            Total Experience
          </div>
          <div className="text-5xl font-black text-gray-800 tracking-tight">{totalXP} <span className="text-xl text-blue-500 font-bold">XP</span></div>
          <div className="mt-4 w-full bg-blue-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${xpIntoLevel}%` }}></div>
          </div>
          <p className="text-sm text-blue-600 font-medium mt-2">Level {currentLevel} • {xpIntoLevel}% to Level {currentLevel + 1}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-3xl border border-orange-100 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 opacity-10">
            <Flame size={160} className="text-orange-500 -translate-y-10 translate-x-10" />
          </div>
          <div className="flex items-center gap-3 text-orange-600 font-bold mb-2">
            <div className="bg-orange-200 p-2 rounded-lg"><Flame size={20} /></div>
            Current Streak
          </div>
          <div className="text-5xl font-black text-gray-800 tracking-tight">{longestStreak} <span className="text-xl text-orange-500 font-bold">Days</span></div>
          <p className="text-sm text-orange-600 font-medium mt-6">You're on fire! Keep it up! 🔥</p>
        </motion.div>
      </div>
      
      {/* Habits Header & Grid */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-6">
          <Target className="text-gray-400" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Today's Habits</h2>
        </div>
        
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {habits.map((habit) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <HabitCard 
                  {...habit} 
                  onClick={() => handleHabitClick(habit)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {habits.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Target size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500">No habits tracked yet</h3>
            <p className="text-gray-400 mt-2 mb-6 text-sm">Create your first quest to start earning XP!</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold py-3 px-6 rounded-xl transition"
            >
              Setup First Habit
            </button>
          </div>
        )}
      </div>

      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addHabit}
      />

      <TaskSummaryModal
        isOpen={!!activeHabit}
        onClose={() => setActiveHabit(null)}
        habit={activeHabit}
      />

      <LevelUpOverlay 
        isVisible={showLevelUp} 
        level={currentLevel}
        onClose={() => setShowLevelUp(false)}
      />
    </div>
  );
};

export default Dashboard;
