import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MathEngine, Challenge, GradeLevel } from './logic/MathEngine';

function App() {
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    const savedScore = localStorage.getItem('misha_score');
    if (savedScore) setScore(parseInt(savedScore));
  }, []);

  useEffect(() => {
    localStorage.setItem('misha_score', score.toString());
    if (score > 0 && score % 10 === 0) {
      setShowReward(true);
    }
  }, [score]);

  const nextChallenge = (currentGrade: GradeLevel) => {
    setChallenge(MathEngine.generate(currentGrade));
    setFeedback(null);
  };

  const handleAnswer = (correct: boolean) => {
    if (!challenge) return;
    if (correct) {
      setScore(s => s + 1);
      setFeedback('correct');
      setTimeout(() => nextChallenge(grade!), 1000);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGrade(null);
    setChallenge(null);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
      {!isPlaying ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200"
        >
          <div className="w-24 h-24 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-white font-black text-5xl">G</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Genius</h1>
          <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-sm">Fun Math Challenges</p>
          
          <p className="text-xs font-bold text-gray-400 mb-4 uppercase">Pick your grade:</p>
          <div className="grid grid-cols-3 gap-2 mb-8">
            {(['K', '1', '2', '3', '4', '5'] as GradeLevel[]).map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`py-3 rounded-xl font-black text-xl transition-all ${
                  grade === g 
                  ? 'bg-blue-600 text-white shadow-inner scale-95' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <button 
            disabled={!grade}
            onClick={() => { setIsPlaying(true); nextChallenge(grade!); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-xl border-b-4 border-blue-800 disabled:opacity-50"
          >
            Let's Play!
          </button>
          
          <div className="mt-8 text-gray-400 font-black uppercase tracking-widest text-xs">
            Total Points: {score}
          </div>
        </motion.div>
      ) : (
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white px-6 py-2 rounded-full shadow-md border-b-4 border-gray-100 font-black text-blue-600 flex items-center space-x-2">
              <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">G{grade}</span>
              <span>Score: {score}</span>
            </div>
            <button 
              onClick={resetGame}
              className="bg-white w-10 h-10 rounded-full shadow-md text-gray-400 font-black hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            {challenge && (
              <div className="relative">
                <motion.div 
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-gray-200"
                >
                  <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-12 text-center break-words">
                    {challenge.question}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {challenge.options.map((opt) => (
                      <button
                        key={opt}
                        disabled={!!feedback}
                        onClick={() => handleAnswer(opt === challenge.answer)}
                        className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-800 font-black py-8 rounded-2xl text-2xl md:text-3xl transition-all active:scale-95 shadow-md border-b-4 border-blue-100 hover:border-blue-800 disabled:opacity-50"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {feedback === 'correct' && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-green-500 text-white font-black py-8 px-12 rounded-full shadow-2xl text-4xl rotate-12">
                        ⭐ Correct!
                      </div>
                    </motion.div>
                  )}
                  {feedback === 'incorrect' && (
                    <motion.div 
                      initial={{ x: -10 }}
                      animate={{ x: [10, -10, 10, -10, 0] }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-red-500 text-white font-black py-8 px-12 rounded-full shadow-2xl text-4xl -rotate-6">
                        Oops!
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Reward Overlay */}
      <AnimatePresence>
        {showReward && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-blue-600/90 z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="bg-white p-12 rounded-3xl shadow-2xl border-b-8 border-blue-200"
            >
              <div className="text-8xl mb-6">🏆</div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">You're a Star!</h2>
              <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest">10 Points Reached!</p>
              <button 
                onClick={() => setShowReward(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-xl border-b-4 border-blue-800"
              >
                Keep Going!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
