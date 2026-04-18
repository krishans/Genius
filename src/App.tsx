import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MathEngine, Challenge, GradeLevel, Difficulty } from './logic/MathEngine';

interface Profile {
  id: string;
  name: string;
  grade: GradeLevel;
  difficulty: Difficulty;
  totalScore: number;
  highScore: number;
  avatar: string;
}

const AVATARS = ['🚀', '🦄', '🦖', '🎨', '⚽', '🐯'];

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingKid, setIsAddingKid] = useState(false);
  const [isSwitchingGrade, setIsSwitchingGrade] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState<GradeLevel>('K');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTimeMode, setIsTimeMode] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [sessionScore, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showTimesUp, setShowTimesUp] = useState(false);
  const [showDiffUp, setShowDiffUp] = useState<Difficulty | null>(null);
  const timerRef = useRef<any>(null);

  const activeProfile = profiles.find(p => p.id === activeId);

  useEffect(() => {
    const saved = localStorage.getItem('genius_profiles_v3');
    if (saved) setProfiles(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (profiles.length > 0) localStorage.setItem('genius_profiles_v3', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (isPlaying && isTimeMode && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isTimeMode) {
      setShowTimesUp(true);
      setIsPlaying(false);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, isTimeMode, timeLeft]);

  const addProfile = () => {
    if (!newName.trim()) return;
    const newProf: Profile = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      grade: newGrade,
      difficulty: 'Easy',
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
    setProfiles(prev => prev.map(p => p.id === activeId ? { ...p, ...updates } : p));
  };

  const startChallenge = (timeMode: boolean) => {
    if (!activeProfile) return;
    setIsTimeMode(timeMode);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setIsPlaying(true);
    setShowTimesUp(false);
    setChallenge(MathEngine.generate(activeProfile.grade, activeProfile.difficulty));
  };

  const handleAnswer = (correct: boolean) => {
    if (!challenge || !activeProfile) return;
    if (correct) {
      const newScore = sessionScore + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      
      let newDiff = activeProfile.difficulty;
      if (newStreak >= 5) {
        if (newDiff === 'Easy') newDiff = 'Medium';
        else if (newDiff === 'Medium') newDiff = 'Hard';
        if (newDiff !== activeProfile.difficulty) {
           setShowDiffUp(newDiff);
           setStreak(0);
           setTimeout(() => setShowDiffUp(null), 2000);
        }
      }

      const updatedTotal = activeProfile.totalScore + 1;
      updateActiveProfile({
        totalScore: updatedTotal,
        difficulty: newDiff,
        highScore: isTimeMode && newScore > activeProfile.highScore ? newScore : activeProfile.highScore
      });

      setFeedback('correct');
      if (!isTimeMode && updatedTotal % 10 === 0) {
        setShowReward(true);
      }
      setTimeout(() => {
        setChallenge(MathEngine.generate(activeProfile.grade, newDiff));
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback('incorrect');
      setStreak(0);
      if (activeProfile.difficulty !== 'Easy') {
         updateActiveProfile({ difficulty: activeProfile.difficulty === 'Hard' ? 'Medium' : 'Easy' });
      }
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const resetGame = () => { setIsPlaying(false); setIsTimeMode(false); setShowTimesUp(false); setChallenge(null); };

  const selectGrade = (g: GradeLevel) => {
    updateActiveProfile({ grade: g, difficulty: 'Easy' });
    setIsSwitchingGrade(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      {!activeId ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200">
          <h1 className="text-3xl font-black text-gray-900 mb-8">Who is playing?</h1>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {profiles.map(p => (
              <button key={p.id} onClick={() => setActiveId(p.id)} className="flex flex-col items-center p-4 rounded-2xl hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-200">
                <span className="text-5xl mb-2">{p.avatar}</span>
                <span className="font-black text-gray-700">{p.name}</span>
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Grade {p.grade}</span>
              </button>
            ))}
            <button onClick={() => setIsAddingKid(true)} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-400 hover:text-blue-500">
              <span className="text-4xl mb-2">➕</span><span className="font-bold text-sm">Add Kid</span>
            </button>
          </div>
        </motion.div>
      ) : !isPlaying && !showTimesUp ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
             <span className="text-white font-black text-4xl">{activeProfile?.avatar}</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">Hi, {activeProfile?.name}!</h1>
          <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-[10px]">Grade {activeProfile?.grade} | {activeProfile?.difficulty}</p>
          
          <AnimatePresence mode="wait">
            {isSwitchingGrade ? (
              <motion.div key="grade-picker" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                <p className="text-[10px] font-black text-gray-400 mb-3 uppercase">Choose New Grade:</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['K', '1', '2', '3', '4', '5'] as GradeLevel[]).map(g => (
                    <button key={g} onClick={() => selectGrade(g)} className={`py-2 rounded-xl font-black text-lg transition-all ${activeProfile?.grade === g ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-600'}`}>{g}</button>
                  ))}
                </div>
                <button onClick={() => setIsSwitchingGrade(false)} className="mt-4 text-[10px] font-bold text-gray-400 uppercase">Cancel</button>
              </motion.div>
            ) : (
              <motion.div key="main-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col space-y-3">
                <button onClick={() => startChallenge(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-lg border-b-4 border-blue-800">Practice Mode</button>
                <button onClick={() => startChallenge(true)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-lg border-b-4 border-orange-800">⚡ Speed Round</button>
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <button onClick={() => setIsSwitchingGrade(true)} className="bg-green-50 text-green-600 font-black text-[10px] uppercase border-b-4 border-green-200 py-3 rounded-xl hover:bg-green-100 transition-all active:scale-95">🎓 Switch Grade</button>
                  <button onClick={() => setActiveId(null)} className="bg-blue-50 text-blue-600 font-black text-[10px] uppercase border-b-4 border-blue-100 py-3 rounded-xl hover:bg-blue-100 transition-all active:scale-95">🔄 Switch Kid</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-8 flex justify-between text-gray-400 font-black uppercase tracking-widest text-[10px]">
            <span>Total: {activeProfile?.totalScore}</span><span>Best: {activeProfile?.highScore}</span>
          </div>
        </motion.div>
      ) : isPlaying ? (
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white px-4 py-2 rounded-full shadow-md border-b-4 border-gray-100 font-black text-blue-600 flex items-center space-x-2 text-sm">
              <span className="text-lg">{activeProfile?.avatar}</span>
              <span>G{activeProfile?.grade} | {activeProfile?.difficulty}</span>
            </div>
            <div className="flex items-center space-x-2">
              {streak >= 3 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-orange-500 text-white px-3 py-1 rounded-full font-black text-xs">🔥 {streak}</motion.div>}
              {isTimeMode && <div className={`px-4 py-1 rounded-full shadow-md border-b-4 font-black text-sm ${timeLeft <= 10 ? 'bg-red-500 text-white border-red-800 animate-pulse' : 'bg-white text-orange-600'}`}>⏱ {timeLeft}s</div>}
            </div>
            <button onClick={resetGame} className="bg-white w-10 h-10 rounded-full shadow-md text-gray-400 font-black hover:text-red-500 transition-colors">✕</button>
          </div>
          <AnimatePresence mode="wait">
            {challenge && (
              <div className="relative">
                <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-gray-200">
                  <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-12 text-center leading-tight">{challenge.question}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {challenge.options.map((opt) => (
                      <button key={opt} disabled={!!feedback} onClick={() => handleAnswer(opt === challenge.answer)} className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-800 font-black py-8 rounded-2xl text-2xl md:text-4xl transition-all active:scale-95 shadow-md border-b-4 border-blue-100 hover:border-blue-800 disabled:opacity-50">{opt}</button>
                    ))}
                  </div>
                </motion.div>
                <AnimatePresence>
                  {feedback === 'correct' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-green-500 text-white font-black py-8 px-12 rounded-full shadow-2xl text-4xl rotate-12">⭐ Correct!</div></motion.div>}
                  {feedback === 'incorrect' && <motion.div animate={{ x: [10, -10, 10, -10, 0] }} className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-red-500 text-white font-black py-8 px-12 rounded-full shadow-2xl text-4xl -rotate-6">Oops!</div></motion.div>}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
      <AnimatePresence>
        {isAddingKid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-blue-600/95 z-50 flex flex-col items-center justify-center p-6">
            <motion.div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm border-b-8 border-blue-200">
              <h2 className="text-3xl font-black text-gray-900 mb-6">New Genius</h2>
              <div className="space-y-4">
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 font-bold" placeholder="Kid Name" />
                <div className="grid grid-cols-3 gap-2">{(['K','1','2','3','4','5'] as GradeLevel[]).map(g => (
                  <button key={g} onClick={() => setNewGrade(g)} className={`py-2 rounded-lg font-black ${newGrade === g ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{g}</button>
                ))}</div>
                <div className="flex pt-4 space-x-3"><button onClick={() => setIsAddingKid(false)} className="flex-1 font-black text-gray-400">Cancel</button><button onClick={addProfile} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black shadow-lg">GO!</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showDiffUp && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1.1 }} exit={{ scale: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
             <div className="bg-yellow-400 text-white font-black p-8 rounded-full shadow-2xl text-2xl border-b-8 border-yellow-600 animate-bounce text-center">🔥 RANK UP! 🔥<br/>{showDiffUp} Level</div>
          </motion.div>
        )}
        {showReward && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-blue-600/90 z-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-3xl shadow-2xl border-b-8 border-blue-200">
              <div className="text-8xl mb-6">🏅</div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">10 Points!</h2>
              <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-sm">Great job, {activeProfile?.name}!</p>
              <button onClick={() => setShowReward(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-xl border-b-4 border-blue-800">Keep Going</button>
            </motion.div>
          </motion.div>
        )}
        {showTimesUp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-orange-500/95 z-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-3xl shadow-2xl border-b-8 border-orange-200 w-full max-w-sm">
              <div className="text-7xl mb-4">⏰</div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Time's Up!</h2>
              <div className="bg-orange-100 p-6 rounded-2xl mb-6"><p className="text-gray-600 font-bold text-xs mb-1">Scored</p><p className="text-5xl font-black text-orange-600">{sessionScore}</p>
                {activeProfile && sessionScore >= activeProfile.highScore && sessionScore > 0 && <p className="text-green-600 font-black mt-2 text-sm">🏆 NEW HIGH SCORE!</p>}
              </div>
              <div className="flex flex-col space-y-3">
                <button onClick={() => startChallenge(true)} className="w-full bg-orange-500 text-white font-black py-4 px-8 rounded-2xl shadow-xl border-b-4 border-orange-800">Try Again</button>
                <button onClick={resetGame} className="w-full bg-white text-gray-500 font-black py-4 px-8 rounded-2xl shadow-lg border-b-4 border-gray-200">Go Home</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default App;
