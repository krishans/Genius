import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MathEngine, Challenge, GradeLevel } from './logic/MathEngine';

function App() {
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTimeMode, setIsTimeMode] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showTimesUp, setShowTimesUp] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const savedScore = localStorage.getItem('genius_score');
    const savedHigh = localStorage.getItem('genius_highscore');
    if (savedScore) setScore(parseInt(savedScore));
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  useEffect(() => {
    localStorage.setItem('genius_score', score.toString());
    if (!isTimeMode && score > 0 && score % 10 === 0) {
      setShowReward(true);
    }
    if (isTimeMode && score > highScore) {
      setHighScore(score);
      localStorage.setItem('genius_highscore', score.toString());
    }
  }, [score, isTimeMode, highScore]);

  useEffect(() => {
    if (isPlaying && isTimeMode && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimeMode) {
      setShowTimesUp(true);
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isTimeMode, timeLeft]);

  const startChallenge = (selectedGrade: GradeLevel, timeMode: boolean) => {
    setGrade(selectedGrade);
    setIsTimeMode(timeMode);
    setTimeLeft(60);
    setScore(timeMode ? 0 : score);
    setIsPlaying(true);
    setShowTimesUp(false);
    nextChallenge(selectedGrade);
  };

  const nextChallenge = (currentGrade: GradeLevel) => {
    setChallenge(MathEngine.generate(currentGrade));
    setFeedback(null);
  };

  const handleAnswer = (correct: boolean) => {
    if (!challenge) return;
    if (correct) {
      setScore(s => s + 1);
      setFeedback('correct');
      setTimeout(() => nextChallenge(grade!), 600);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setIsTimeMode(false);
    setShowTimesUp(false);
    setGrade(null);
    setChallenge(null);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      {!isPlaying && !showTimesUp ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-white font-black text-4xl">G</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Genius</h1>
          <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-xs">Math for Kids</p>
          
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

          <div className="flex flex-col space-y-3">
            <button 
              disabled={!grade}
              onClick={() => startChallenge(grade!, false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-lg border-b-4 border-blue-800 disabled:opacity-50"
            >
              Practice Mode
            </button>
            <button 
              disabled={!grade}
              onClick={() => startChallenge(grade!, true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-lg border-b-4 border-orange-800 disabled:opacity-50"
            >
              ⚡ Speed Round
            </button>
          </div>
          
          <div className="mt-8 flex justify-between text-gray-400 font-black uppercase tracking-widest text-[10px]">
            <span>Practice Total: {score}</span>
            <span>Speed Best: {highScore}</span>
          </div>
        </motion.div>
      ) : isPlaying ? (
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white px-4 py-2 rounded-full shadow-md border-b-4 border-gray-100 font-black text-blue-600 flex items-center space-x-2 text-sm">
              <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">G{grade}</span>
              <span>Score: {score}</span>
            </div>
            {isTimeMode && (
              <div className={`px-6 py-2 rounded-full shadow-md border-b-4 font-black text-xl ${
                timeLeft <= 10 ? 'bg-red-500 text-white border-red-800 animate-pulse' : 'bg-white text-orange-600 border-gray-100'
              }`}>
                ⏱ {timeLeft}s
              </div>
            )}
            <button 
              onClick={resetGame}
              className="bg-white w-10 h-10 rounded-full shadow-md text-gray-400 font-black hover:text-red-500 transition-colors"
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
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-gray-200"
                >
                  <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-12 text-center leading-tight">
                    {challenge.question}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {challenge.options.map((opt) => (
                      <button
                        key={opt}
                        disabled={!!feedback}
                        onClick={() => handleAnswer(opt === challenge.answer)}
                        className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-800 font-black py-8 rounded-2xl text-2xl md:text-4xl transition-all active:scale-95 shadow-md border-b-4 border-blue-100 hover:border-blue-800 disabled:opacity-50"
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
      ) : null}

      <AnimatePresence>
        {showTimesUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-orange-500/95 z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-3xl shadow-2xl border-b-8 border-orange-200 w-full max-w-sm"
            >
              <div className="text-7xl mb-4">⏰</div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Time's Up!</h2>
              <div className="bg-orange-100 p-6 rounded-2xl mb-8">
                <p className="text-gray-600 font-bold uppercase tracking-widest text-xs mb-1">You Scored</p>
                <p className="text-5xl font-black text-orange-600">{score}</p>
                {score >= highScore && score > 0 && (
                  <p className="text-green-600 font-black mt-2 text-sm">🏆 NEW HIGH SCORE!</p>
                )}
              </div>
              <button 
                onClick={resetGame}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-xl border-b-4 border-orange-800"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white p-12 rounded-3xl shadow-2xl border-b-8 border-blue-200"
            >
              <div className="text-8xl mb-6">🏅</div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Great Job!</h2>
              <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-sm">10 Practice Points!</p>
              <button 
                onClick={() => setShowReward(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-xl border-b-4 border-blue-800"
              >
                Keep Practicing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
