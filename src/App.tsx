import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MathEngine, Challenge, GradeLevel, MathType } from './logic/MathEngine';

interface Profile {
  id: string; name: string; grade: GradeLevel; level: number; totalScore: number; highScore: number; avatar: string; focusAreas?: MathType[];
}

const AVATARS = ['🚀', '🦄', '🦖', '🎨', '⚽', '🐯'];
const TYPE_LABELS: Record<MathType, string> = { 
  ADD: '➕ Addition', SUB: '➖ Subtraction', MUL: '✖️ Multiplication', DIV: '➗ Division', MISSING: '❓ Missing Numbers', SHAPE: '📐 Shapes', DECIMAL: '🔢 Decimals', FRACTION: '🍰 Fractions', MONEY: '💰 Money', VOLUME: '🧊 Volume'
};

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingKid, setIsAddingKid] = useState(false);
  const [isSwitchingGrade, setIsSwitchingGrade] = useState(false);
  const [isChoosingFocus, setIsFocusMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState<GradeLevel>('K');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTimeMode, setIsTimeMode] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [sessionScore, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showTimesUp, setShowTimesUp] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  const activeProfile = profiles.find(p => p.id === activeId);

  useEffect(() => {
    const saved = localStorage.getItem('genius_profiles_v5');
    if (saved) setProfiles(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (profiles.length > 0) localStorage.setItem('genius_profiles_v5', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (isPlaying && isTimeMode && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isTimeMode) {
      setShowTimesUp(true); setIsPlaying(false);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, isTimeMode, timeLeft]);

  const addProfile = () => {
    if (!newName.trim()) return;
    const newProf: Profile = {
      id: Math.random().toString(36).substr(2, 9), name: newName, grade: newGrade, level: 1, totalScore: 0, highScore: 0, avatar: AVATARS[profiles.length % AVATARS.length], focusAreas: []
    };
    setProfiles([...profiles, newProf]);
    setActiveId(newProf.id);
    setIsAddingKid(false);
    setNewName('');
  };

  const updateActiveProfile = (updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === activeId ? { ...p, ...updates } : p));
  };

  const toggleFocus = (type: MathType) => {
    if (!activeProfile) return;
    const current = activeProfile.focusAreas || [];
    const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
    updateActiveProfile({ focusAreas: next });
  };

  const startChallenge = (timeMode: boolean) => {
    if (!activeProfile) return;
    setIsTimeMode(timeMode);
    setTimeLeft(60); setScore(0); setStreak(0); setFeedback(null);
    setChallenge(MathEngine.generate(activeProfile.grade, activeProfile.level, timeMode ? [] : activeProfile.focusAreas));
    setIsPlaying(true); setIsFocusMode(false);
  };

  const handleAnswer = (correct: boolean) => {
    if (!challenge || !activeProfile || feedback) return;
    if (correct) {
      const ns = sessionScore + 1; const nstr = streak + 1; setScore(ns); setStreak(nstr);
      let nl = activeProfile.level;
      if (nstr >= 5 && nl < 10) { nl += 1; setShowLevelUp(nl); setStreak(0); setTimeout(() => setShowLevelUp(null), 2000); }
      updateActiveProfile({ totalScore: activeProfile.totalScore + 1, level: nl, highScore: isTimeMode && ns > activeProfile.highScore ? ns : activeProfile.highScore });
      setFeedback('correct');
      setTimeout(() => { setChallenge(MathEngine.generate(activeProfile.grade, nl, isTimeMode ? [] : activeProfile.focusAreas)); setFeedback(null); }, 1000);
    } else {
      setFeedback('incorrect'); setStreak(0);
      if (activeProfile.level > 1) updateActiveProfile({ level: activeProfile.level - 1 });
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const resetGame = () => { setIsPlaying(false); setIsTimeMode(false); setShowTimesUp(false); setChallenge(null); setFeedback(null); };

  const selectGrade = (g: GradeLevel) => {
    updateActiveProfile({ grade: g, level: 1, focusAreas: [] });
    setIsSwitchingGrade(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      {!activeId ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200">
          <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Who is playing?</h1>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {profiles.map(p => (
              <button key={p.id} onClick={() => setActiveId(p.id)} className="flex flex-col items-center p-4 rounded-2xl hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-200 text-center">
                <span className="text-5xl mb-2">{p.avatar}</span>
                <span className="font-black text-gray-700">{p.name}</span>
                <span className="text-[10px] text-blue-500 font-bold uppercase">Grade {p.grade}</span>
              </button>
            ))}
            <button onClick={() => setIsAddingKid(true)} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-400 hover:text-blue-500 text-center">
              <span className="text-4xl mb-2">➕</span>
              <span className="font-bold text-sm">Add Kid</span>
            </button>
          </div>
        </motion.div>
      ) : !isPlaying && !showTimesUp ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
             <span className="text-white font-black text-4xl">{activeProfile?.avatar}</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Hi, {activeProfile?.name}!</h1>
          <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-[10px]">Grade {activeProfile?.grade} | Level {activeProfile?.level}</p>
          
          <AnimatePresence mode="wait">
            {isChoosingFocus && activeProfile ? (
              <motion.div key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-left">
                <p className="text-[10px] font-black text-gray-400 mb-4 uppercase text-center tracking-widest">Focus Areas (Optional):</p>
                <div className="grid grid-cols-1 gap-2 mb-6">
                  {MathEngine.getTypesForGrade(activeProfile.grade, activeProfile.level).map(type => (
                    <button key={type} onClick={() => toggleFocus(type)} className={`w-full p-4 rounded-2xl font-black text-sm flex justify-between items-center transition-all ${activeProfile.focusAreas?.includes(type) ? 'bg-blue-600 text-white shadow-lg scale-95' : 'bg-blue-50 text-blue-800'}`}>
                      {TYPE_LABELS[type]} {activeProfile.focusAreas?.includes(type) && '✅'}
                    </button>
                  ))}
                </div>
                <button onClick={() => startChallenge(false)} className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl border-b-8 border-blue-800 shadow-xl active:scale-95 transition-all text-xl uppercase tracking-wider text-center">START</button>
                <button onClick={() => setIsFocusMode(false)} className="w-full text-[10px] mt-6 text-gray-400 font-bold text-center uppercase tracking-widest">Back</button>
              </motion.div>
            ) : isSwitchingGrade ? (
              <motion.div key="grade" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest text-center">Choose Your Grade:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(['K','1','2','3','4','5'] as GradeLevel[]).map(g => (
                    <button key={g} onClick={() => selectGrade(g)} className={`py-4 rounded-2xl font-black text-xl transition-all ${activeProfile?.grade === g ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>{g}</button>
                  ))}
                </div>
                <button onClick={() => setIsSwitchingGrade(false)} className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center block w-full">Cancel</button>
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col space-y-4">
                <button onClick={() => setIsFocusMode(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl transition-all active:scale-95 text-xl border-b-8 border-blue-800 uppercase tracking-wide italic text-center">Practice Mode</button>
                <button onClick={() => startChallenge(true)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-3xl shadow-xl transition-all active:scale-95 text-xl border-b-8 border-orange-800 uppercase tracking-wide italic text-center">⚡ Speed Round</button>
                <div className="grid grid-cols-2 gap-3 pt-4 text-center">
                  <button onClick={() => setIsSwitchingGrade(true)} className="bg-green-50 text-green-600 font-black text-[10px] uppercase border-b-4 border-green-200 py-4 rounded-2xl hover:bg-green-100 transition-all active:scale-95">🎓 Switch Grade</button>
                  <button onClick={() => setActiveId(null)} className="bg-blue-50 text-blue-600 font-black text-[10px] uppercase border-b-4 border-blue-100 py-4 rounded-2xl hover:bg-blue-100 transition-all active:scale-95">🔄 Switch Kid</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-8 flex justify-between text-gray-400 font-black uppercase tracking-widest text-[10px] text-center w-full">
            <span>Points: {activeProfile?.totalScore}</span><span>Best Speed: {activeProfile?.highScore}</span>
          </div>
        </motion.div>
      ) : isPlaying ? (
        <div className="w-full max-w-lg text-center">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white px-4 py-2 rounded-full shadow-md border-b-4 border-gray-100 font-black text-blue-600 flex items-center space-x-2 text-sm italic text-center">
              <span className="text-xl">{activeProfile?.avatar}</span>
              <span className="uppercase">G{activeProfile?.grade} | L{activeProfile?.level}</span>
            </div>
            <div className="flex items-center space-x-2">
              {streak >= 3 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-orange-500 text-white px-4 py-1 rounded-full font-black text-xs shadow-lg animate-bounce">🔥 {streak}</motion.div>}
              {isTimeMode && <div className={`px-5 py-1 rounded-full shadow-md border-b-4 font-black text-sm transition-colors ${timeLeft <= 10 ? 'bg-red-500 text-white border-red-800 animate-pulse' : 'bg-white text-orange-600 border-orange-100'}`}>⏱ {timeLeft}s</div>}
            </div>
            <button onClick={resetGame} className="bg-white w-10 h-10 rounded-full shadow-md text-gray-400 font-black hover:text-red-500 transition-colors flex items-center justify-center">✕</button>
          </div>
          <AnimatePresence mode="wait">
            {challenge && (
              <div className="relative">
                <motion.div key={challenge.id} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border-b-8 border-gray-200">
                  <h2 className="text-4xl md:text-6xl font-black text-gray-800 mb-12 text-center leading-tight tracking-tighter">{challenge.question}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {challenge.options.map((opt) => (
                      <button key={opt} disabled={!!feedback} onClick={() => handleAnswer(opt === challenge.answer)} className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-800 font-black py-10 rounded-3xl text-3xl md:text-5xl transition-all active:scale-95 shadow-md border-b-8 border-blue-100 hover:border-blue-800 disabled:opacity-50">{opt}</button>
                    ))}
                  </div>
                </motion.div>
                <AnimatePresence>
                  {feedback === 'correct' && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.3, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none text-center"><div className="bg-green-500 text-white font-black py-10 px-16 rounded-full shadow-2xl text-5xl rotate-12 border-b-8 border-green-700">⭐ Correct!</div></motion.div>}
                  {feedback === 'incorrect' && <motion.div initial={{ x: 0 }} animate={{ x: [15, -15, 15, -15, 0] }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none text-center"><div className="bg-red-500 text-white font-black py-10 px-16 rounded-full shadow-2xl text-5xl -rotate-6 border-b-8 border-red-700">Oops!</div></motion.div>}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
      <AnimatePresence>
        {isAddingKid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-blue-600/95 z-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm border-b-8 border-blue-200">
              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter uppercase italic text-center">New Genius</h2>
              <div className="space-y-6">
                <div className="text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Genius Name</label>
                  <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-5 bg-gray-50 rounded-2xl border-4 border-gray-100 font-black outline-none focus:border-blue-400 transition-colors text-2xl" placeholder="e.g. Misha" />
                </div>
                <div className="text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Grade Level</label>
                  <div className="grid grid-cols-3 gap-2">{(['K','1','2','3','4','5'] as GradeLevel[]).map(g => (
                    <button key={g} onClick={() => setNewGrade(g)} className={`py-4 rounded-2xl font-black text-xl transition-all ${newGrade === g ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>{g}</button>
                  ))}</div>
                </div>
                <div className="flex pt-6 space-x-3 text-center"><button onClick={() => setIsAddingKid(false)} className="flex-1 font-black text-gray-400 uppercase tracking-widest text-sm text-center">Cancel</button><button disabled={!newName.trim()} onClick={addProfile} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50 text-xl uppercase italic text-center">LET'S GO!</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showLevelUp && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} exit={{ scale: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none text-center">
             <div className="bg-yellow-400 text-white font-black p-12 rounded-full shadow-2xl text-3xl border-b-8 border-yellow-600 animate-bounce text-center italic uppercase">🚀 RANK UP! 🚀<br/>Level {showLevelUp}</div>
          </motion.div>
        )}
        {showTimesUp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-orange-500/95 z-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl border-b-8 border-orange-200 w-full max-w-sm">
              <div className="text-8xl mb-6 text-orange-500 animate-pulse text-center">⏰</div>
              <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter text-center">Time's Up!</h2>
              <div className="bg-orange-50 p-8 rounded-3xl mb-8 border-b-4 border-orange-100 text-center"><p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest mb-1 text-center">Total Scored</p><p className="text-7xl font-black text-orange-600 text-center">{sessionScore}</p>
                {activeProfile && sessionScore >= activeProfile.highScore && sessionScore > 0 && <p className="text-green-600 font-black mt-3 text-sm tracking-tight animate-bounce text-center">🏆 NEW HIGH SCORE! 🏆</p>}
              </div>
              <div className="flex flex-col space-y-4 text-center">
                <button onClick={() => startChallenge(true)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-6 rounded-3xl shadow-xl transition-all active:scale-95 text-2xl border-b-8 border-orange-800 uppercase italic tracking-wider text-center">TRY AGAIN</button>
                <button onClick={resetGame} className="w-full bg-white text-gray-400 font-black py-6 rounded-3xl shadow-lg transition-all active:scale-95 text-xl border-b-8 border-gray-100 uppercase tracking-widest text-center">GO HOME</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default App;
