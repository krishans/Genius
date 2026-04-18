import React from 'react';
import { motion } from 'framer-motion';
import { Challenge } from '../logic/MathEngine';

interface Props {
  challenge: Challenge;
  onAnswer: (correct: boolean) => void;
}

export const ChallengeCard: React.FC<Props> = ({ challenge, onAnswer }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg border-b-8 border-gray-200"
    >
      <h2 className="text-3xl font-black text-gray-800 mb-8 text-center">{challenge.question}</h2>
      <div className="grid grid-cols-2 gap-4">
        {challenge.options.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt === challenge.answer)}
            className="bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-800 font-black py-6 rounded-2xl text-2xl transition-all active:scale-95 shadow-md hover:shadow-lg border-b-4 border-blue-200 hover:border-blue-800"
          >
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
