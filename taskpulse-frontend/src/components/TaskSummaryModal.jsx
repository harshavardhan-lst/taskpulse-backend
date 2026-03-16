import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PenTool, Loader } from 'lucide-react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

const TaskSummaryModal = ({ isOpen, onClose, habit }) => {
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { userId } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary.trim()) return;
    
    setSubmitting(true);
    try {
      // Send the summary to the backend, which creates a pending task
      const res = await api.submitTask(userId, summary);
      
      // Navigate to the ML-generated quiz for this specific task
      if (res.data && res.data.task_id) {
        navigate(`/quiz/${res.data.task_id}`);
      }
    } catch (error) {
      console.error("Failed to submit task summary:", error);
      alert("Error submitting task summary. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && habit && (
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
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
              <button 
                onClick={onClose}
                disabled={submitting}
                className="absolute right-4 top-4 text-white/70 hover:text-white transition"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black mb-1">Verify Completion</h2>
              <p className="text-blue-100 font-medium text-sm">Task: {habit.title}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 font-medium">
                To earn your <strong className="text-blue-600">{habit.xpReward} XP</strong>, tell us what you accomplished! Our AI will review your summary to verify your work.
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <PenTool size={18} className="text-blue-500" />
                  Proof of Work Summary
                </label>
                <textarea
                  autoFocus
                  rows={4}
                  placeholder="e.g. I ran 3.5 miles at the park in 30 minutes, it felt great but the hill was tough!"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium resize-none text-gray-700 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!summary.trim() || submitting}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl disabled:bg-gray-300 disabled:shadow-none transition flex justify-center items-center gap-2"
              >
                {submitting ? <><Loader className="animate-spin" size={20} /> Generating Quiz...</> : "Generate Verification Quiz"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskSummaryModal;
