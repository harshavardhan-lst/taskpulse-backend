import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Star } from 'lucide-react';

const LevelUpOverlay = ({ isVisible, level, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      // Trigger confetti cannon
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();

      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />

          {/* 3D Badge */}
          <motion.div
            initial={{ scale: 0.5, y: 100, rotateX: 45 }}
            animate={{ 
              scale: 1, 
              y: 0, 
              rotateX: 0,
              transition: { type: "spring", bounce: 0.5, duration: 0.8 }
            }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="relative w-48 h-48 mb-6">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-50 animate-pulse" />
              
              {/* Gold Medal Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full shadow-[0_0_50px_rgba(250,204,21,0.5)] border-4 border-yellow-200 flex items-center justify-center transform preserve-3d">
                <div className="absolute inset-2 border-2 border-dashed border-yellow-600/30 rounded-full" />
                <div className="text-center">
                  <Star className="w-12 h-12 text-white mx-auto mb-1 fill-white shadow-sm" />
                  <div className="text-sm font-black text-yellow-800 uppercase tracking-widest">Level</div>
                  <div className="text-5xl font-black text-white drop-shadow-md">{level}</div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
              className="text-center"
            >
              <h2 className="text-4xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="text-yellow-400" /> 
                Level Up! 
                <Sparkles className="text-yellow-400" />
              </h2>
              <p className="text-blue-200 text-lg font-medium">You unlocked a new rank.</p>
            </motion.div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpOverlay;
