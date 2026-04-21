import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MathEngine, Challenge, GradeLevel, MathType } from './logic/MathEngine';

interface Profile {
  id: string; name: string; grade: GradeLevel; level: number; totalScore: number; highScore: number; avatar: string; focusModuleId?: number;
  moduleStats: Record<string, boolean[]>; // Tracks last 100 results per moduleId
}

const AVATARS = ['🚀', '🦄', '🦖', '🎨', '⚽', '🐯'];
const TYPE_LABELS: Record<MathType, string> = { 
  ADD: '➕ Addition', SUB: '➖ Subtraction', MUL: '✖️ Multiplication', DIV: '➗ Division', MISSING: '❓ Missing Numbers', SHAPE: '📐 Shapes', DECIMAL: '🔢 Decimals', FRACTION: '🍰 Fractions', MONEY: '💰 Money', VOLUME: '🧊 Volume', TIME: '🕒 Time', MEASURE: '📏 Measure'
};

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingKid, setIsAddingKid] = useState(false);
  const [isSwitchingGrade, setIsSwitchingGrade] = useState(false);
  const [isChoosingModule, setIsModuleMode] = useState(false);
  const [isShowingStats, setIsShowingStats] = useState(false);
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
    const saved = localStorage.getItem('genius_profiles_v7');
    if (saved) setProfiles(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (profiles.length > 0) localStorage.setItem('genius_profiles_v7', JSON.stringify(profiles));
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
      id: Math.random().toString(36).substr(2, 9), name: newName, grade: newGrade, level: 1, totalScore: 0, highScore: 0, avatar: AVATARS[profiles.length % AVATARS.length], moduleStats: {}
    };
    setProfiles([...profiles, newProf]); setActiveId(newProf.id); setIsAddingKid(false); setNewName('');
  };

  const updateActiveProfile = (updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === activeId ? { ...p, ...updates } : p));
  };

  const startChallenge = (timeMode: boolean) => {
    if (!activeProfile) return;
    setIsTimeMode(timeMode);
    setTimeLeft(60); setScore(0); setStreak(0); setFeedback(null);
    const modId = timeMode ? undefined : activeProfile.focusModuleId;
    const allowed = modId ? MathEngine.getModulesForGrade(activeProfile.grade).find(m => m.id === modId)?.types : [];
    setChallenge(MathEngine.generate(activeProfile.grade, activeProfile.level, allowed));
    setIsPlaying(true); setIsModuleMode(false);
  };

  const handleAnswer = (correct: boolean) => {
    if (!challenge || !activeProfile || feedback) return;
    const ns = sessionScore + (correct ? 1 : 0);
    const nstr = correct ? streak + 1 : 0;
    setScore(ns); setStreak(nstr);
    
    // Update Module Stats (last 100)
    const mid = challenge.moduleId.toString();
    const currentHist = activeProfile.moduleStats[mid] || [];
    const nextHist = [...currentHist, correct].slice(-100);
    
    let nl = activeProfile.level;
    if (correct && nstr >= 5 && nl < 10) { nl += 1; setShowLevelUp(nl); setTimeout(() => setShowLevelUp(null), 2000); }
    if (!correct && nl > 1) { nl -= 1; }

    updateActiveProfile({
      totalScore: activeProfile.totalScore + (correct ? 1 : 0),
      level: nl,
      highScore: isTimeMode && ns > activeProfile.highScore ? ns : activeProfile.highScore,
      moduleStats: { ...activeProfile.moduleStats, [mid]: nextHist }
    });

    setFeedback(correct ? 'correct' : 'incorrect');
    setTimeout(() => {
      const allowed = !isTimeMode && activeProfile.focusModuleId ? MathEngine.getModulesForGrade(activeProfile.grade).find(m => m.id === activeProfile.focusModuleId)?.types : [];
      setChallenge(MathEngine.generate(activeProfile.grade, nl, allowed));
      setFeedback(null);
    }, 1000);
  };

  const getModuleProficiency = (mid: number) => {
    const hist = activeProfile?.moduleStats[mid.toString()] || [];
    if (hist.length === 0) return 0;
    return Math.round((hist.filter(x => x).length / hist.length) * 100);
  };

  const getOverallProficiency = () => {
    if (!activeProfile) return 0;
    const mods = MathEngine.getModulesForGrade(activeProfile.grade);
    const scores = mods.map(m => getModuleProficiency(m.id)).filter(s => s > 0);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const resetGame = () => { setIsPlaying(false); setIsTimeMode(false); setShowTimesUp(false); setChallenge(null); setFeedback(null); };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 font-sans overflow-hidden text-center">
      {!activeId ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200">
          <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Who is playing?</h1>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {profiles.map(p => (
              <button key={p.id} onClick={() => setActiveId(p.id)} className="flex flex-col items-center p-4 rounded-2xl hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-200">
                <span className="text-5xl mb-2">{p.avatar}</span>
                <span className="font-black text-gray-700">{p.name}</span>
                <span className="text-[10px] text-blue-500 font-bold uppercase">Grade {p.grade}</span>
              </button>
            ))}
            <button onClick={() => setIsAddingKid(true)} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-400 hover:text-blue-500">
              <span className="text-4xl mb-2">➕</span><span className="font-bold text-sm">Add Kid</span>
            </button>
          </div>
        </motion.div>
      ) : !isPlaying && !showTimesUp && !isShowingStats ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
             <span className="text-white font-black text-4xl">{activeProfile?.avatar}</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight italic">Hi, {activeProfile?.name}!</h1>
          <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-[10px]">Grade {activeProfile?.grade} | Level {activeProfile?.level}</p>
          
          <AnimatePresence mode="wait">
            {isChoosingModule && activeProfile ? (
              <motion.div key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-left">
                <p className="text-[10px] font-black text-gray-400 mb-4 uppercase text-center tracking-widest italic">Practice by Module:</p>
                <div className="grid grid-cols-1 gap-2 mb-6 max-h-60 overflow-y-auto pr-1">
                  <button onClick={() => updateActiveProfile({ focusModuleId: undefined })} className={`w-full p-4 rounded-2xl font-black text-sm flex justify-between items-center transition-all ${!activeProfile.focusModuleId ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-800'}`}>
                    🌟 Mixed Practice {!activeProfile.focusModuleId && '✅'}
                  </button>
                  {MathEngine.getModulesForGrade(activeProfile.grade).map(mod => (
                    <button key={mod.id} onClick={() => updateActiveProfile({ focusModuleId: mod.id })} className={`w-full p-4 rounded-2xl font-black text-xs flex justify-between items-center transition-all ${activeProfile.focusModuleId === mod.id ? 'bg-blue-600 text-white shadow-lg scale-95' : 'bg-blue-50 text-blue-800'}`}>
                      <span>📦 Mod {mod.id}: {mod.name}</span> {activeProfile.focusModuleId === mod.id && '✅'}
                    </button>
                  ))}
                </div>
                <button onClick={() => startChallenge(false)} className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl border-b-8 border-blue-800 shadow-xl active:scale-95 transition-all text-xl uppercase tracking-wider italic">START</button>
                <button onClick={() => setIsModuleMode(false)} className="w-full text-[10px] mt-6 text-gray-400 font-bold text-center uppercase tracking-widest">Back</button>
              </motion.div>
            ) : isSwitchingGrade ? (
              <motion.div key="grade" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Choose Grade:</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['K','1','2','3','4','5'] as GradeLevel[]).map(g => (
                    <button key={g} onClick={() => { updateActiveProfile({ grade: g, level: 1, focusModuleId: undefined }); setIsSwitchingGrade(false); }} className={`py-4 rounded-2xl font-black text-xl transition-all ${activeProfile?.grade === g ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>{g}</button>
                  ))}
                </div>
                <button onClick={() => setIsSwitchingGrade(false)} className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cancel</button>
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col space-y-4">
                <button onClick={() => setIsModuleMode(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl transition-all active:scale-95 text-xl border-b-8 border-blue-800 uppercase italic tracking-wide">Practice Mode</button>
                <button onClick={() => startChallenge(true)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-3xl shadow-xl transition-all active:scale-95 text-xl border-b-8 border-orange-800 uppercase italic tracking-wide">⚡ Speed Round</button>
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <button onClick={() => setIsShowingStats(true)} className="bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase border-b-4 border-indigo-100 py-4 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95">📊 Progress</button>
                  <button onClick={() => setIsSwitchingGrade(true)} className="bg-green-50 text-green-600 font-black text-[10px] uppercase border-b-4 border-green-200 py-4 rounded-2xl hover:bg-green-100 transition-all active:scale-95">🎓 Grade</button>
                  <button onClick={() => setActiveId(null)} className="bg-blue-50 text-blue-600 font-black text-[10px] uppercase border-b-4 border-blue-100 py-4 rounded-2xl hover:bg-blue-100 transition-all active:scale-95">🔄 Switch</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-8 flex justify-between text-gray-400 font-black uppercase tracking-widest text-[10px] w-full">
            <span>Points: {activeProfile?.totalScore}</span><span>Proficiency: {getOverallProficiency()}%</span>
          </div>
        </motion.div>
      ) : isShowingStats ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl text-center max-w-sm w-full border-b-8 border-blue-200">
           <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter uppercase italic">Your Progress</h2>
           <div className="bg-indigo-50 p-6 rounded-3xl mb-6">
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-1">Overall Proficiency</p>
              <p className="text-5xl font-black text-indigo-700">{getOverallProficiency()}%</p>
           </div>
           <div className="space-y-4 text-left mb-8 max-h-60 overflow-y-auto pr-1">
              {MathEngine.getModulesForGrade(activeProfile!.grade).map(m => {
                const score = getModuleProficiency(m.id);
                return (
                  <div key={m.id}>
                    <div className="flex justify-between items-center mb-1 px-1">
                      <span className="text-[10px] font-black text-gray-500 uppercase">Mod {m.id}: {m.name}</span>
                      <span className="text-[10px] font-black text-indigo-600">{score}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className={`h-full ${score > 80 ? 'bg-green-500' : score > 50 ? 'bg-yellow-400' : 'bg-indigo-400'}`} />
                    </div>
                  </div>
                );
              })}
           </div>
           <button onClick={() => setIsShowingStats(false)} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl border-b-4 border-blue-800 uppercase">Back to Menu</button>
        </motion.div>
      ) : isPlaying ? (
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white px-4 py-2 rounded-full shadow-md border-b-4 border-gray-100 font-black text-blue-600 flex items-center space-x-2 text-sm italic">
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
                  {feedback === 'correct' && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.3, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-green-500 text-white font-black py-10 px-16 rounded-full shadow-2xl text-5xl rotate-12 border-b-8 border-green-700">⭐ Correct!</div></motion.div>}
                  {feedback === 'incorrect' && <motion.div initial={{ x: 0 }} animate={{ x: [15, -15, 15, -15, 0] }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-red-500 text-white font-black py-10 px-16 rounded-full shadow-2xl text-5xl -rotate-6 border-b-8 border-red-700">Oops!</div></motion.div>}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
      <AnimatePresence>
        {isAddingKid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-blue-600/95 z-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-sm border-b-8 border-blue-200">
              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter uppercase italic">New Genius</h2>
              <div className="space-y-6">
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-5 bg-gray-50 rounded-2xl border-4 border-gray-100 font-black outline-none focus:border-blue-400 transition-colors text-2xl" placeholder="e.g. Misha" />
                <div className="grid grid-cols-3 gap-2">{(['K','1','2','3','4','5'] as GradeLevel[]).map(g => (
                  <button key={g} onClick={() => setNewGrade(g)} className={`py-4 rounded-2xl font-black text-xl transition-all ${newGrade === g ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>{g}</button>
                ))}</div>
                <div className="flex pt-6 space-x-3"><button onClick={() => setIsAddingKid(false)} className="flex-1 font-black text-gray-400 uppercase tracking-widest text-sm">Cancel</button><button disabled={!newName.trim()} onClick={addProfile} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all text-xl uppercase italic">GO!</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showLevelUp && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} exit={{ scale: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
             <div className="bg-yellow-400 text-white font-black p-12 rounded-full shadow-2xl text-3xl border-b-8 border-yellow-600 animate-bounce text-center italic uppercase">🚀 RANK UP! 🚀<br/>Level {showLevelUp}</div>
          </motion.div>
        )}
        {showTimesUp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-orange-500/95 z-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl border-b-8 border-orange-200 w-full max-w-sm">
              <div className="text-8xl mb-6 text-orange-500 animate-pulse">⏰</div>
              <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Time's Up!</h2>
              <div className="bg-orange-50 p-8 rounded-3xl mb-8 border-b-4 border-orange-100"><p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest mb-1">Total Scored</p><p className="text-7xl font-black text-orange-600">{sessionScore}</p>
                {activeProfile && sessionScore >= activeProfile.highScore && sessionScore > 0 && <p className="text-green-600 font-black mt-3 text-sm tracking-tight animate-bounce">🏆 NEW HIGH SCORE! 🏆</p>}
              </div>
              <div className="flex flex-col space-y-4">
                <button onClick={() => startChallenge(true)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-6 rounded-3xl shadow-xl transition-all active:scale-95 text-2xl border-b-8 border-orange-800 uppercase italic tracking-wider">TRY AGAIN</button>
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
