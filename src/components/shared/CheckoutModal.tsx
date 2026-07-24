import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Sparkles, PartyPopper, AlertTriangle, ShoppingCart, MessageSquare } from 'lucide-react';
import type { Meal, KidProfile } from '../../types';
import { TAG_META } from '../../types';

function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
      isVeg ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
    }`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      {isVeg ? 'Veg' : 'Non-Veg'}
    </span>
  );
}

interface Props {
  meal: Meal;
  kid: KidProfile;
  isPreApproved: boolean;
  isOverBudget: boolean;
  isBlocked: boolean;
  onConfirm: (note?: string) => void;
  onRequestApproval: (note?: string) => void;
  onClose: () => void;
}

function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#F59E0B', '#14B8A6', '#3B82F6', '#EF4444', '#EC4899'];
  const color = colors[index % colors.length];
  const x = Math.random() * 300 - 150;
  const rotation = Math.random() * 720 - 360;

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color, left: '50%', top: '50%' }}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
      animate={{
        x: [0, x * 0.5, x],
        y: [0, -80, 120],
        rotate: [0, rotation * 0.5, rotation],
        opacity: [1, 1, 0],
        scale: [1, 1.2, 0.5],
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
  );
}

export default function CheckoutModal({ meal, kid, isPreApproved, isOverBudget, isBlocked, onConfirm, onRequestApproval, onClose }: Props) {
  const withinBudget = !isOverBudget;
  const autoApproved = isPreApproved && withinBudget && !isBlocked;
  const [kidNote, setKidNote] = useState('');

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Auto-approved success */}
        {autoApproved && (
          <div className="p-6 text-center">
            {Array.from({ length: 16 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              <PartyPopper size={48} className="mx-auto text-emerald-500 mb-3" />
            </motion.div>
            <h3 className="text-xl font-black text-gray-800 mb-1">Order Placed!</h3>
            <p className="text-sm text-gray-500 mb-4">Your meal is being prepared</p>

            <div className="bg-gray-50 rounded-2xl p-3 mb-4">
              <div className="flex items-center gap-3">
                <img src={meal.image} alt={meal.name} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800 text-sm">{meal.name}</p>
                  <VegBadge isVeg={meal.isVeg} />
                  <p className="text-xs text-gray-500">Rs {meal.price}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                  <Sparkles size={11} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">+{meal.veggiePoints} pts</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-semibold mb-4">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Chef is cooking your magic meal
            </div>

            <motion.button
              onClick={() => onConfirm(kidNote || undefined)}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl min-h-[48px]"
            >
              Track My Order
            </motion.button>
          </div>
        )}

        {/* Over budget */}
        {isOverBudget && !autoApproved && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Order {meal.name}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-orange-500" />
                <p className="text-sm font-bold text-orange-700">Oops! This needs Mom/Dad's magic</p>
              </div>
              <p className="text-xs text-orange-600">
                This meal costs Rs {meal.price} but you only have Rs {Math.max(0, kid.walletBalance).toFixed(0)} left.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 mb-4">
              <div className="flex items-center gap-3">
                <img src={meal.image} alt={meal.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">{meal.name}</p>
                  <VegBadge isVeg={meal.isVeg} />
                  <p className="text-xs text-gray-500">Rs {meal.price} - {meal.calories} cal</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageSquare size={12} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500">Add a note for Mom/Dad</span>
              </div>
              <input
                type="text"
                value={kidNote}
                onChange={e => setKidNote(e.target.value)}
                placeholder="e.g. Please! I'll eat veggies tomorrow..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-300"
                maxLength={100}
              />
            </div>

            <motion.button
              onClick={() => onRequestApproval(kidNote || undefined)}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold rounded-2xl min-h-[48px]"
            >
              <Send size={16} />
              Send for Approval
            </motion.button>
            <button onClick={onClose} className="w-full py-2.5 text-sm text-gray-500 font-medium mt-2 min-h-[44px]">Maybe Later</button>
          </div>
        )}

        {/* Needs review / blocked */}
        {!autoApproved && !isOverBudget && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Order {meal.name}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {isBlocked && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <p className="text-sm font-bold text-red-700">This has {meal.allergens.filter(a => kid.allergies.includes(a) || kid.dietaryBlocks.some(b => meal.tags.some(t => t.includes(b)))).join(', ')}</p>
                </div>
                <p className="text-xs text-red-600">Ask your parents first before ordering this meal.</p>
              </div>
            )}

            {!isBlocked && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart size={16} className="text-blue-500" />
                  <p className="text-sm font-bold text-blue-700">Ask Parents First</p>
                </div>
                <p className="text-xs text-blue-600">This meal needs your parent's approval before ordering.</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-3 mb-4">
              <div className="flex items-center gap-3">
                <img src={meal.image} alt={meal.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">{meal.name}</p>
                  <VegBadge isVeg={meal.isVeg} />
                  <p className="text-xs text-gray-500">Rs {meal.price} - {meal.calories} cal</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                  <Sparkles size={11} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">+{meal.veggiePoints}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageSquare size={12} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500">Add a note for Mom/Dad</span>
              </div>
              <input
                type="text"
                value={kidNote}
                onChange={e => setKidNote(e.target.value)}
                placeholder="e.g. For my sports practice today!"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-300"
                maxLength={100}
              />
            </div>

            <motion.button
              onClick={() => onRequestApproval(kidNote || undefined)}
              whileTap={{ scale: 0.95 }}
              className={`w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r ${TAG_META[meal.tags[0]]?.bg ?? 'from-blue-400 to-cyan-400'} text-white font-bold rounded-2xl min-h-[48px]`}
            >
              <Send size={16} />
              Send for Approval
            </motion.button>
            <button onClick={onClose} className="w-full py-2.5 text-sm text-gray-500 font-medium mt-2 min-h-[44px]">Maybe Later</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
