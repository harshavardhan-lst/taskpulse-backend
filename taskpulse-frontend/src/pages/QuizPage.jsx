import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { Loader, CheckCircle, AlertTriangle, ShieldCheck, BrainCircuit, Maximize, Video, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const QuizPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { questions, answers, loading, result, handleAnswerChange, submitQuiz } = useQuiz(taskId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Anti-Cheating State
  const [hasStarted, setHasStarted] = useState(false);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [cheatingReason, setCheatingReason] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null); // Store stream separately to prevent it from being garbage collected

  // Tab Switching Detection
  useEffect(() => {
    if (!hasStarted || result || cheatingDetected) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerCheat("Tab switching or minimizing the window is prohibited during verification.");
      }
    };

    const handleBlur = () => {
        triggerCheat("Leaving the quiz window is prohibited during verification.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [hasStarted, result, cheatingDetected]);

  // Handle Fullscreen Exit Detection
  useEffect(() => {
      if (!hasStarted || result || cheatingDetected) return;
      
      const handleFullscreenChange = () => {
          if (!document.fullscreenElement) {
              triggerCheat("Exiting full screen mode is prohibited during verification.");
          }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [hasStarted, result, cheatingDetected]);

  const triggerCheat = (reason) => {
    setCheatingDetected(true);
    setCheatingReason(reason);
    stopCamera();
    
    // Auto-fail the test by kicking them out fullscreen
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
    }
  };

  const startQuizFlow = async () => {
    try {
        // Request Camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream; // Save stream in a ref to keep it alive
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        // Request Fullscreen on the entire document (Works regardless of React render state)
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
            await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
            await document.documentElement.msRequestFullscreen();
        }

        setHasStarted(true);
    } catch (err) {
        alert("Camera and Fullscreen permissions are strictly required for verification. Please allow them to proceed.");
        console.error("Anti-Cheat Initialization Error:", err);
    }
  };

  const stopCamera = () => {
      // Stop all tracks from the saved stream ref
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
      }
      if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
  };

  // Stop camera when unmounting
  useEffect(() => {
      return () => stopCamera();
  }, []);

  if (loading && !hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <BrainCircuit className="w-16 h-16 text-blue-500 animate-pulse mb-4" />
        <h2 className="text-xl font-bold text-gray-700">AI is generating your quiz...</h2>
        <p className="text-gray-500">Analyzing your proof of work</p>
      </div>
    );
  }

  // Cleanup camera if result comes back
  if (result && hasStarted) {
      stopCamera();
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto p-10 bg-white shadow-2xl rounded-3xl mt-12 text-center border overflow-hidden relative"
      >
        {result.reward_granted ? (
          <>
            <div className="absolute top-0 inset-x-0 h-4 bg-green-500" />
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-5 rounded-full">
                <ShieldCheck className="text-green-600 w-16 h-16" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">Verified! 🎉</h1>
            <p className="text-green-600 font-bold bg-green-50 py-2 rounded-xl mb-4">AI Security Check Passed</p>
          </>
        ) : (
          <>
            <div className="absolute top-0 inset-x-0 h-4 bg-red-500" />
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-5 rounded-full">
                <AlertTriangle className="text-red-600 w-16 h-16" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">Verification Failed</h1>
            <p className="text-red-600 font-bold bg-red-50 py-2 rounded-xl mb-4">
              {result.fraud_probability > 0.6 ? "High Fraud Risk Detected" : "AI Score Too Low"}
            </p>
          </>
        )}

        {/* Score Card */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-5 text-left space-y-3">
          <div className="flex justify-between font-medium">
            <span className="text-gray-500">Score:</span>
            <span className={`font-black text-lg ${result.score >= 15 ? 'text-green-600' : 'text-red-600'}`}>{result.score}/30</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-gray-500">Fraud Risk:</span>
            <span className={result.fraud_probability < 0.4 ? 'text-green-600' : 'text-red-600'}>{(result.fraud_probability * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Gemini Explanation */}
        {result.explanation && (
          <div className={`rounded-2xl p-5 mb-6 text-left border-l-4 ${result.reward_granted ? 'bg-blue-50 border-blue-400' : 'bg-red-50 border-red-400'}`}>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">✨ AI Feedback</p>
            <p className="text-gray-700 font-medium leading-relaxed">{result.explanation}</p>
          </div>
        )}

        <button 
          onClick={() => navigate('/dashboard')}
          className={`w-full font-bold py-4 rounded-xl shadow-lg transition text-white mt-2 ${result.reward_granted ? 'bg-gray-900 hover:bg-black' : 'bg-red-600 hover:bg-red-700'}`}
        >
          Return to Quests
        </button>
      </motion.div>
      </div>
    );
  }

  if (cheatingDetected) {
    return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md bg-white p-10 rounded-3xl shadow-2xl border-2 border-red-500 relative overflow-hidden"
            >
                <div className="absolute top-0 inset-x-0 h-4 bg-red-600" />
                <EyeOff className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
                <h1 className="text-3xl font-black text-gray-900 mb-4">Security Violation</h1>
                <p className="text-red-600 font-bold bg-red-100 py-3 rounded-xl mb-6">
                    {cheatingReason}
                </p>
                <p className="text-gray-600 mb-8 font-medium text-lg leading-relaxed">
                    Your verification session has been terminated due to suspicious activity. Zero XP will be awarded for this task.
                </p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition"
                >
                    Return to Dashboard
                </button>
            </motion.div>
        </div>
    );
  }

  if (!hasStarted) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md bg-white p-10 rounded-3xl shadow-xl text-center"
              >
                  <ShieldCheck className="w-20 h-20 text-blue-600 mx-auto mb-6" />
                  <h1 className="text-2xl font-black text-gray-900 mb-4">Secure Verification Required</h1>
                  <p className="text-gray-500 mb-8 font-medium">
                      To ensure honesty, this quiz uses a secure proctoring environment. 
                      You will be required to:
                  </p>
                  <div className="text-left space-y-4 mb-8">
                      <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl text-blue-800 font-medium">
                          <Maximize className="w-6 h-6" /> Complete in Full Screen
                      </div>
                      <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl text-blue-800 font-medium">
                          <EyeOff className="w-6 h-6" /> Do not switch tabs
                      </div>
                      <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl text-blue-800 font-medium">
                          <Video className="w-6 h-6" /> Enable your webcam
                      </div>
                  </div>
                  <button 
                      onClick={startQuizFlow}
                      disabled={loading || questions.length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50"
                  >
                      {loading ? "Generating Quiz..." : "I Accept, Begin Verification"}
                  </button>
              </motion.div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto w-full h-full pb-20">
      
      {/* Absolute Header for Anti-Cheat warnings */}
      <div className="w-full bg-red-600 text-white font-bold text-center py-2 text-sm drop-shadow-md z-50 sticky top-0">
          SECURE PROCTORING ACTIVE • DO NOT LEAVE FULLSCREEN OR SWITCH TABS
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto p-10 bg-white shadow-xl rounded-3xl mt-12 border border-gray-100 relative"
      >
        {/* Floating Camera Viewfinder */}
        <div className="absolute top-8 right-8 w-32 h-32 rounded-2xl overflow-hidden border-4 border-blue-100 shadow-xl bg-gray-900">
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform -scale-x-100" // scale-x-100 mirrors the camera
            />
            <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">Live</span>
            </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <BrainCircuit className="text-blue-600 w-8 h-8" />
          </div>
          <div className="pr-32">
            <h1 className="text-2xl font-black text-gray-800">AI Verification Quiz</h1>
            <p className="text-gray-500 font-medium">Answer these questions to prove you did the work.</p>
          </div>
        </div>
        
        <div className="space-y-8">
          {questions.map((q, idx) => {
            const questionObj = typeof q === 'object' ? q : { type: 'theory', question: q };
            return (
              <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-black px-2 py-1 rounded-full uppercase tracking-widest ${questionObj.type === 'mcq' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {questionObj.type === 'mcq' ? 'Multiple Choice' : 'Theory'}
                  </span>
                </div>
                <label className="block text-lg font-bold text-gray-800 mb-4">{questionObj.question}</label>
                
                {questionObj.type === 'mcq' && questionObj.options ? (
                  <div className="space-y-3">
                    {questionObj.options.map((option, optIdx) => (
                      <label key={optIdx} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer font-medium transition ${
                        answers[idx] === option 
                          ? 'bg-blue-50 border-blue-400 text-blue-800' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={option}
                          checked={answers[idx] === option}
                          onChange={() => handleAnswerChange(idx, option)}
                          className="accent-blue-600"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="w-full border-2 border-gray-200 bg-white rounded-xl p-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium text-gray-700"
                    rows={3}
                    placeholder="Your answer..."
                    value={answers[idx]}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl mt-6 text-red-700 font-medium flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p>Analysis failed: {error}. Please try submitting again.</p>
          </div>
        )}

        <button
          onClick={async () => {
            setSubmitting(true);
            setError(null);
            try {
              await submitQuiz();
            } catch (err) {
              setError(err.message || "Something went wrong during AI analysis.");
            } finally {
              setSubmitting(false);
            }
          }}
          disabled={submitting || answers.some(a => !a.trim())}
          className="w-full mt-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:shadow-none transition-all flex justify-center items-center gap-2"
        >
          {submitting ? <><Loader className="animate-spin" /> Analyzing...</> : "Submit for Evaluation"}
        </button>
      </motion.div>
    </div>
  );
};

export default QuizPage;
