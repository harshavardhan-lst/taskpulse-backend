import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const HabitCard = ({ title, streak, xpReward, isCompleted, onClick }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer border-2 transition-all duration-300 ${
        isCompleted 
          ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' 
          : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl shadow-md'
      }`}
    >
      {/* Background decoration */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className={`text-xl font-bold ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isCompleted ? 'bg-green-200 text-green-800' : 'bg-orange-100 text-orange-700'}`}>
              🔥 {streak} Day Streak
            </span>
          </div>
        </div>
        
        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-400'}`}>
          <CheckCircle size={24} className={isCompleted ? '' : 'opacity-50'} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 relative z-10">
        <div className="flex items-center text-sm font-medium text-gray-500 gap-1.5">
          <Clock size={16} />
          <span>Daily</span>
        </div>
        <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
          +{xpReward} XP
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard;
