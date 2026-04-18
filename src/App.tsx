import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MathEngine, Challenge, GradeLevel } from './logic/MathEngine';

interface Profile {
  id: string;
  name: string;
  grade: GradeLevel;
  totalScore: number;
  highScore: number;
  avatar: string;
}

const AVATARS = ['🚀', '🦄', '🦖', '🎨', '⚽', '🐯'];

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingKid, setIsAddingKid] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState<GradeLevel>('K');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTimeMode, setIsTimeMode] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [sessionScore, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showTimesUp, setShowTimesUp] = useState(false);
  const timerRef = useRef<any>(null);

  const activeProfile = profiles.find(p => p.id === activeId);

  useEffect(() => {
    const saved = localStorage.getItem('genius_profiles_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfiles(parsed);
    }
  }, []);

  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('genius_profiles_v2', JSON.stringify(profiles));
    }
  }, [profiles]);

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

  const addProfile = () => {
    if (!newName.trim()) return;
    const newProf: Profile = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      grade: newGrade,
      totalScore: 0,
      highScore: 0,
      avatar: AVATARS[profiles.length % AVATARS.length]
    };
    setProfiles([...profiles, newProf]);
    setActiveId(newProf.id);
    setIsAddingKid(false);
    setNewName('');
  };

  const updateActiveProfile = (updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => 
      p.id === activeId ? { ...p, ...updates } : p
    ));
  };

  const startChallenge = (timeMode: boolean) => {
    if (!activeProfile) return;
    setIsTimeMode(timeMode);
    setTimeLeft(60);
    setScore(0);
    setIsPlaying(true);
    setShowTimesUp(false);
    nextChallenge(activeProfile.grade);
  };

  const nextChallenge = (currentGrade: GradeLevel) => {
    setChallenge(MathEngine.generate(currentGrade));
    setFeedback(null);
  };

  const handleAnswer = (correct: boolean) => {
    if (!challenge || !activeProfile) return;
    if (correct) {
      const newScore = sessionScore + 1;
      setScore(newScore);
      
      const updates: Partial<Profile> = { totalScore: activeProfile.totalScore + 1 };
      if (isTimeMode && newScore > activeProfile.highScore) {
        updates.highScore = newScore;
      }
      updateActiveProfile(updates);

      setFeedback('correct');
      if (!isTimeMode && (activeProfile.totalScore + 1) % 10 === 0) {
        setShowReward(true);
      }
      setTimeout(() => nextChallenge(activeProfile.grade), 600);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setIsTimeMode(false);
    setShowTimesUp(false);
    setChallenge(null);
  };

  const handleLevelUp = () => {
    if (!activeProfile) return;
    const next: GradeLevel = activeProfile.grade === '5' ? 'K' : (parseInt(activeProfile.grade === 'K' ? '0' : activeProfile.grade) + 1).toString() as GradeLevel;
    updateActiveProfile({ grade: next });
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      {!activeId ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200"
        >
          <h1 className="text-3xl font-black text-gray-900 mb-8">Who is playing?</h1>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className="flex flex-col items-center p-4 rounded-2xl hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-200"
              >
                <span className="text-5xl mb-2">{p.avatar}</span>
                <span className="font-black text-gray-700">{p.name}</span>
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Grade {p.grade}</span>
              </button>
            ))}
            <button
              onClick={() => setIsAddingKid(true)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-400 hover:text-blue-500"
            >
              <span className="text-4xl mb-2">➕</span>
              <span className="font-bold text-sm">Add Kid</span>
            </button>
          </div>
        </motion.div>
      ) : !isPlaying && !showTimesUp ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
             <span className="text-white font-black text-4xl">{activeProfile?.avatar}</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">Hi, {activeProfile?.name}!</h1>
          <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-[10px]">Grade {activeProfile?.grade} Genius</p>
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => startChallenge(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-lg border-b-4 border-blue-800"
            >
              Practice Mode
            </button>
            <button 
              onClick={() => startChallenge(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-lg border-b-4 border-orange-800"
            >
              ⚡ Speed Round
            </button>
            <div className="grid grid-cols-2 gap-2 pt-4">
              <button 
                onClick={handleLevelUp}
                className="text-gray-400 font-bold text-[10px] uppercase border border-gray-100 py-2 rounded-lg hover:bg-gray-50"
              >
                Level Up
              </button>
              <button 
                onClick={() => setActiveId(null)}
                className="text-blue-400 font-bold text-[10px] uppercase border border-blue-50 py-2 rounded-lg hover:bg-blue-50"
              >
                Switch Kid
              </button>
            </div>
          </div>
          <div className="mt-8 flex justify-between text-gray-400 font-black uppercase tracking-widest text-[10px]">
            <span>Total: {activeProfile?.totalScore}</span>
            <span>Best: {activeProfile?.highScore}</span>
          </div>
        </motion.div>
      ) : isPlaying ? (
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white px-4 py-2 rounded-full shadow-md border-b-4 border-gray-100 font-black text-blue-600 flex items-center space-x-2 text-sm">
              <span className="text-lg">{activeProfile?.avatar}</span>
              <span>{isTimeMode ? sessionScore : activeProfile?.totalScore}</span>
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
        {isAddingKid && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-blue-600/95 z-50 flex flex-col items-center justify-center p-6"
          >
            <motion.div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm border-b-8 border-blue-200">
              <h2 className="text-3xl font-black text-gray-900 mb-6">New Genius</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase">Kid's Name</label>
                  <input 
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none font-bold text-lg"
                    placeholder="e.g. Misha"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase">Grade Level</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(['K', '1', '2', '3', '4', '5'] as GradeLevel[]).map(g => (
                      <button
                        key={g}
                        onClick={() => setNewGrade(g)}
                        className={`py-2 rounded-lg font-black ${newGrade === g ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setIsAddingKid(false)}
                    className="flex-1 py-4 font-black text-gray-400 uppercase"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!newName.trim()}
                    onClick={addProfile}
                    className="flex-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-black shadow-lg disabled:opacity-50"
                  >
                    GO!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTimesUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-orange-500/95 z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div className="bg-white p-10 rounded-3xl shadow-2xl border-b-8 border-orange-200 w-full max-w-sm">
              <div className="text-7xl mb-4">⏰</div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Time's Up!</h2>
              <div className="bg-orange-100 p-6 rounded-2xl mb-6">
                <p className="text-gray-600 font-bold uppercase tracking-widest text-xs mb-1">You Scored</p>
                <p className="text-5xl font-black text-orange-600">{sessionScore}</p>
                {activeProfile && sessionScore >= activeProfile.highScore && sessionScore > 0 && (
                  <p className="text-green-600 font-black mt-2 text-sm">🏆 NEW HIGH SCORE!</p>
                )}
              </div>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => startChallenge(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-xl border-b-4 border-orange-800"
                >
                  Try Again
                </button>
                <button 
                  onClick={resetGame}
                  className="w-full bg-white text-gray-500 font-black py-4 px-8 rounded-2xl shadow-lg transition-all active:scale-95 text-lg border-b-4 border-gray-200"
                >
                  Go Home
                </button>
              </div>
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
              <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-sm text-center">
                10 Points for {activeProfile?.name}!
              </p>
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
