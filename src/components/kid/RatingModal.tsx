import { motion } from 'framer-motion';
import type { Meal } from '../../types';

interface Props {
  meal: Meal;
  onRate: (rating: 'love' | 'meh' | 'dislike') => void;
  onSkip: () => void;
}

const RATINGS = [
  { value: 'love' as const, emoji: '😍', label: 'Loved it!', color: 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100' },
  { value: 'meh' as const, emoji: '😐', label: 'It was okay', color: 'bg-amber-50 border-amber-300 hover:bg-amber-100' },
  { value: 'dislike' as const, emoji: '🤢', label: 'Not for me', color: 'bg-red-50 border-red-300 hover:bg-red-100' },
];

export default function RatingModal({ meal, onRate, onSkip }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onSkip}
    >
      <motion.div
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
        initial={{ y: 60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={meal.image} alt={meal.name} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
            <div className="text-left">
              <p className="text-xs text-gray-500">How was your</p>
              <p className="font-bold text-gray-800 text-sm">{meal.name}?</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center mb-4">
            {RATINGS.map(r => (
              <motion.button
                key={r.value}
                onClick={() => onRate(r.value)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 min-w-[80px] min-h-[80px] transition-all ${r.color}`}
              >
                <span className="text-3xl">{r.emoji}</span>
                <span className="text-xs font-semibold text-gray-600">{r.label}</span>
              </motion.button>
            ))}
          </div>

          <button
            onClick={onSkip}
            className="text-sm text-gray-400 font-medium min-h-[44px]"
          >
            Skip
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
