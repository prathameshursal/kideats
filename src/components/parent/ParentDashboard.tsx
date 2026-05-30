import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wallet, Calendar, Shield, ShoppingBag, History, Plus, Check, X, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { DAYS, MEAL_SLOTS } from '../../types';
import type { KidProfile } from '../../types';

const TABS = [
  { id: 'profiles', label: 'Kids', icon: Users },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'safety', label: 'Safety', icon: Shield },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'history', label: 'History', icon: History },
];

function KidProfileCard({ kid }: { kid: KidProfile }) {
  const updateKid = useAppStore(s => s.updateKid);
  const addFunds = useAppStore(s => s.addFunds);
  const toggleAllergy = useAppStore(s => s.toggleAllergy);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [dailyInput, setDailyInput] = useState(kid.dailyBudget.toString());
  const [weeklyInput] = useState(kid.weeklyBudget.toString());

  const spentToday = 0; // Would calculate from orders

  const handleAddFunds = () => {
    const amount = parseFloat(fundAmount);
    if (amount > 0) {
      addFunds(kid.id, amount);
      setFundAmount('');
      setShowAddFunds(false);
    }
  };

  const handleSaveBudget = () => {
    updateKid(kid.id, { dailyBudget: parseFloat(dailyInput) || kid.dailyBudget, weeklyBudget: parseFloat(weeklyInput) || kid.weeklyBudget });
    setEditingBudget(false);
  };

  const budgetPct = Math.min((spentToday / kid.dailyBudget) * 100, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-2xl shadow-sm">{kid.avatar}</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{kid.name}</h3>
          <p className="text-xs text-gray-500">Age {kid.age}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-amber-600">Rs {kid.walletBalance}</p>
          <p className="text-xs text-gray-400">wallet</p>
        </div>
      </div>

      {/* Budget */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1 text-gray-500">
            <TrendingUp size={11} className="text-emerald-500" />
            Daily Budget
          </span>
          {editingBudget ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={dailyInput}
                onChange={e => setDailyInput(e.target.value)}
                className="w-16 text-right text-xs border border-gray-200 rounded px-1 py-0.5"
              />
              <button onClick={handleSaveBudget} className="text-emerald-500"><Check size={12} /></button>
            </div>
          ) : (
            <button onClick={() => setEditingBudget(true)} className="font-bold text-gray-700 hover:text-amber-600">
              Rs {kid.dailyBudget}
            </button>
          )}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${budgetPct > 80 ? 'bg-red-400' : budgetPct > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${budgetPct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Allergies */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {['Nuts', 'Gluten', 'Dairy', 'Eggs'].map(allergy => {
          const active = kid.allergies.includes(allergy);
          return (
            <motion.button
              key={allergy}
              onClick={() => toggleAllergy(kid.id, allergy)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium transition-all ${
                active ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-100'
              }`}
            >
              {active && <AlertTriangle size={9} className="text-red-500" />}
              {allergy}
            </motion.button>
          );
        })}
      </div>

      {/* Add Funds */}
      {showAddFunds ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={fundAmount}
            onChange={e => setFundAmount(e.target.value)}
            placeholder="Amount"
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2"
          />
          <motion.button onClick={handleAddFunds} whileTap={{ scale: 0.95 }} className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold min-h-[44px]">
            <Check size={14} />
          </motion.button>
          <button onClick={() => setShowAddFunds(false)} className="px-2 py-2 text-gray-400 min-h-[44px]">
            <X size={14} />
          </button>
        </div>
      ) : (
        <motion.button
          onClick={() => setShowAddFunds(true)}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-amber-300 text-amber-600 text-sm font-semibold hover:bg-amber-50 min-h-[44px]"
        >
          <Plus size={14} />
          Add Funds
        </motion.button>
      )}
    </motion.div>
  );
}

function WalletSection() {
  const kids = useAppStore(s => s.kids);
  const orders = useAppStore(s => s.orders);
  const setAllowance = useAppStore(s => s.setAllowance);
  const [editingKid, setEditingKid] = useState<string | null>(null);
  const [daily, setDaily] = useState('');
  const [weekly, setWeekly] = useState('');

  const getSpentToday = (kidId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return orders
      .filter(o => o.kidId === kidId && o.status !== 'Rejected' && new Date(o.timestamp).toISOString().split('T')[0] === today)
      .reduce((sum, o) => sum + o.price, 0);
  };

  const handleSetAllowance = (kidId: string) => {
    setAllowance(kidId, parseFloat(daily) || 0, parseFloat(weekly) || 0);
    setEditingKid(null);
  };

  return (
    <div className="space-y-3">
      {kids.map(kid => {
        const spent = getSpentToday(kid.id);
        const remaining = kid.walletBalance - spent;
        return (
          <motion.div
            key={kid.id}
            layout
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{kid.avatar}</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{kid.name}</p>
                  <p className="text-xs text-gray-500">Age {kid.age}</p>
                </div>
              </div>
              <motion.button
                onClick={() => { setEditingKid(kid.id); setDaily(kid.dailyBudget.toString()); setWeekly(kid.weeklyBudget.toString()); }}
                whileTap={{ scale: 0.95 }}
                className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg min-h-[44px] flex items-center"
              >
                Set Allowance
              </motion.button>
            </div>

            {editingKid === kid.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="flex items-center gap-2 mb-3 bg-amber-50 p-3 rounded-xl"
              >
                <input type="number" value={daily} onChange={e => setDaily(e.target.value)} placeholder="Daily" className="w-20 text-sm border border-amber-200 rounded-lg px-2 py-1.5" />
                <input type="number" value={weekly} onChange={e => setWeekly(e.target.value)} placeholder="Weekly" className="w-20 text-sm border border-amber-200 rounded-lg px-2 py-1.5" />
                <button onClick={() => handleSetAllowance(kid.id)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-bold min-h-[44px]">Save</button>
                <button onClick={() => setEditingKid(null)} className="text-gray-400 min-h-[44px] px-2"><X size={14} /></button>
              </motion.div>
            )}

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-sm font-bold text-gray-800">Rs {kid.walletBalance}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-xs text-gray-500">Daily Limit</p>
                <p className="text-sm font-bold text-gray-800">Rs {kid.dailyBudget}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-xs text-gray-500">Spent Today</p>
                <p className="text-sm font-bold text-amber-600">Rs {spent}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-xs text-gray-500">Remaining</p>
                <p className={`text-sm font-bold ${remaining < 50 ? 'text-red-500' : 'text-emerald-600'}`}>Rs {Math.max(0, remaining).toFixed(0)}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function WeeklyScheduler() {
  const weeklyPlan = useAppStore(s => s.weeklyPlan);
  const meals = useAppStore(s => s.meals);
  const kids = useAppStore(s => s.kids);
  const currentKidId = useAppStore(s => s.currentKidId);
  const addScheduleSlot = useAppStore(s => s.addScheduleSlot);
  const removeScheduleSlot = useAppStore(s => s.removeScheduleSlot);
  const togglePreApproved = useAppStore(s => s.togglePreApproved);
  const [addingSlot, setAddingSlot] = useState<{ day: string; mealType: string } | null>(null);

  const kid = kids.find(k => k.id === currentKidId);
  const kidAllergies = kid?.allergies ?? [];

  const getSlot = (day: string, mealType: string) => weeklyPlan.find(s => s.day === day && s.mealType === mealType);
  const getMeal = (mealId: string) => meals.find(m => m.id === mealId);

  const filteredMeals = addingSlot
    ? meals.filter(m => {
        const slotType = addingSlot.mealType;
        if (slotType === 'Breakfast' && m.category !== 'Breakfast') return false;
        if (slotType === 'Lunch' && m.category !== 'Lunch') return false;
        if (slotType === 'Snack' && m.category !== 'Snack') return false;
        return true;
      })
    : meals;

  const handleAdd = (mealId: string) => {
    if (!addingSlot) return;
    addScheduleSlot({ day: addingSlot.day, mealType: addingSlot.mealType as 'Breakfast' | 'Lunch' | 'Snack', mealId, isPreApproved: false });
    setAddingSlot(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">Weekly Meal Plan</h3>
        {kid && <span className="text-xs text-gray-500">For {kid.name}</span>}
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="text-xs font-bold text-gray-400 p-1">Slot</div>
            {DAYS.map(d => (
              <div key={d} className="text-xs font-bold text-gray-500 text-center p-1">{d.slice(0, 3)}</div>
            ))}
          </div>

          {MEAL_SLOTS.map(slot => (
            <div key={slot} className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-xs font-semibold text-gray-500 p-2 flex items-center">{slot}</div>
              {DAYS.map(day => {
                const entry = getSlot(day, slot);
                const meal = entry ? getMeal(entry.mealId) : null;
                const hasAllergen = meal && meal.allergens.some(a => kidAllergies.includes(a));

                return (
                  <motion.div
                    key={`${day}-${slot}`}
                    onClick={() => {
                      if (entry) return;
                      setAddingSlot({ day, mealType: slot });
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`p-1.5 rounded-xl text-center cursor-pointer transition-all min-h-[48px] flex flex-col items-center justify-center ${
                      entry
                        ? entry.isPreApproved
                          ? 'bg-emerald-50 border-2 border-emerald-300'
                          : 'bg-amber-50 border-2 border-amber-200'
                        : 'bg-gray-50 border-2 border-dashed border-gray-200 hover:border-amber-300'
                    } ${hasAllergen ? 'opacity-50' : ''}`}
                  >
                    {meal && entry ? (
                      <>
                        <span className="text-xs font-bold text-gray-700 truncate w-full">{meal.name.split(' ')[0]}</span>
                        {entry.isPreApproved && <span className="text-xs text-emerald-600 font-bold">Pre-Approved</span>}
                        <div className="flex gap-0.5 mt-1">
                          <button
                            onClick={e => { e.stopPropagation(); togglePreApproved(day, slot); }}
                            className="text-xs text-amber-500 hover:text-amber-700 p-0.5"
                          >
                            {entry.isPreApproved ? '🔓' : '🔒'}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); removeScheduleSlot(day, slot); }}
                            className="text-xs text-red-400 hover:text-red-600 p-0.5"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <Plus size={14} className="text-gray-300" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add meal modal */}
      <AnimatePresence>
        {addingSlot && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddingSlot(null)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-gray-800 mb-1">Add Meal</h3>
              <p className="text-xs text-gray-500 mb-4">{addingSlot.day} - {addingSlot.mealType}</p>

              <div className="space-y-2">
                {filteredMeals.map(meal => {
                  const blocked = meal.allergens.some(a => kidAllergies.includes(a));
                  return (
                    <motion.button
                      key={meal.id}
                      onClick={() => !blocked && handleAdd(meal.id)}
                      whileTap={{ scale: 0.97 }}
                      disabled={blocked}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        blocked ? 'bg-red-50 opacity-50 cursor-not-allowed' : 'bg-gray-50 hover:bg-amber-50'
                      }`}
                    >
                      <img src={meal.image} alt={meal.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-gray-800">{meal.name}</p>
                        <p className="text-xs text-gray-500">Rs {meal.price}</p>
                      </div>
                      {blocked && <AlertTriangle size={14} className="text-red-500" />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DietaryControls() {
  const kids = useAppStore(s => s.kids);
  const toggleDietaryBlock = useAppStore(s => s.toggleDietaryBlock);
  const setVegMode = useAppStore(s => s.setVegMode);
  const blocks = ['High Sugar', 'Deep Fried', 'Nuts', 'Gluten'];
  const vegModes: Array<{ value: 'veg' | 'nonveg' | 'both'; label: string; color: string }> = [
    { value: 'both', label: 'All Food', color: 'bg-gray-200' },
    { value: 'veg', label: 'Veg Only', color: 'bg-emerald-500' },
    { value: 'nonveg', label: 'Non-Veg Only', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-3">
      {kids.map(kid => (
        <div key={kid.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{kid.avatar}</span>
            <h3 className="font-bold text-gray-800">{kid.name}</h3>
          </div>

          {/* Veg Mode Selector */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">Food Preference</p>
            <div className="flex gap-2">
              {vegModes.map(mode => (
                <motion.button
                  key={mode.value}
                  onClick={() => setVegMode(kid.id, mode.value)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                    kid.vegMode === mode.value
                      ? `${mode.color} text-white shadow-sm`
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${kid.vegMode === mode.value ? 'bg-white' : 'bg-gray-300'}`} />
                  {mode.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {blocks.map(block => {
              const active = kid.dietaryBlocks.includes(block);
              return (
                <div key={block} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{block}</span>
                  <motion.button
                    onClick={() => toggleDietaryBlock(kid.id, block)}
                    whileTap={{ scale: 0.9 }}
                    className={`w-12 h-7 rounded-full transition-all flex items-center px-0.5 ${
                      active ? 'bg-red-500 justify-end' : 'bg-gray-200 justify-start'
                    }`}
                    aria-label={`Toggle ${block} block`}
                  >
                    <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ApprovalQueue() {
  const orders = useAppStore(s => s.orders);
  const meals = useAppStore(s => s.meals);
  const kids = useAppStore(s => s.kids);
  const approveOrder = useAppStore(s => s.approveOrder);
  const rejectOrder = useAppStore(s => s.rejectOrder);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const pending = orders.filter(o => o.status === 'Pending Approval');

  const handleApprove = (id: string) => {
    approveOrder(id);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleReject = (id: string) => {
    if (rejectingId === id && rejectReason) {
      rejectOrder(id, rejectReason);
      setRejectingId(null);
      setRejectReason('');
    } else {
      setRejectingId(id);
    }
  };

  return (
    <div className="space-y-3">
      {showConfetti && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-6xl">🎉</div>
        </motion.div>
      )}

      {pending.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No pending orders</p>
          <p className="text-xs mt-1">New orders from your kids will appear here</p>
        </div>
      ) : (
        <AnimatePresence>
          {pending.map(order => {
            const meal = meals.find(m => m.id === order.mealId);
            const kid = kids.find(k => k.id === order.kidId);
            if (!meal || !kid) return null;

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <img src={meal.image} alt={meal.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{kid.avatar}</span>
                      <span className="text-sm font-bold text-gray-800">{kid.name}</span>
                    </div>
                    <p className="font-bold text-gray-800">{meal.name}</p>
                    <p className="text-xs text-gray-500">Rs {order.price} - {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {rejectingId === order.id ? (
                  <div className="space-y-2 mb-3">
                    <select
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2"
                    >
                      <option value="">Select reason...</option>
                      <option value="Over Budget">Over Budget</option>
                      <option value="Not Healthy">Not Healthy</option>
                      <option value="Schedule Conflict">Schedule Conflict</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleReject(order.id)}
                        whileTap={{ scale: 0.95 }}
                        disabled={!rejectReason}
                        className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 min-h-[44px]"
                      >
                        Confirm Reject
                      </motion.button>
                      <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="px-3 text-gray-400 min-h-[44px]">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleApprove(order.id)}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold min-h-[48px]"
                    >
                      <Check size={14} />
                      Approve
                    </motion.button>
                    <motion.button
                      onClick={() => setRejectingId(order.id)}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold min-h-[48px]"
                    >
                      <X size={14} />
                      Reject
                    </motion.button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}

function OrderHistory() {
  const orders = useAppStore(s => s.orders);
  const meals = useAppStore(s => s.meals);
  const kids = useAppStore(s => s.kids);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
  const [kidFilter, setKidFilter] = useState<string>('all');

  const now = Date.now();
  const dayMs = 86400000;

  const filtered = orders.filter(o => {
    if (o.status === 'Pending Approval') return false;
    if (filter === 'today' && (now - o.timestamp) > dayMs) return false;
    if (filter === 'week' && (now - o.timestamp) > 7 * dayMs) return false;
    if (kidFilter !== 'all' && o.kidId !== kidFilter) return false;
    return true;
  });

  const statusColor = (s: string) => {
    switch (s) {
      case 'Cooking': return 'bg-orange-100 text-orange-700';
      case 'In Transit': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {(['all', 'today', 'week'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[44px] ${filter === f ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {f === 'all' ? 'All' : f === 'today' ? 'Today' : 'This Week'}
          </button>
        ))}
        <select
          value={kidFilter}
          onChange={e => setKidFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 min-h-[44px]"
        >
          <option value="all">All Kids</option>
          {kids.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <History size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No order history</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => {
            const meal = meals.find(m => m.id === order.mealId);
            const kid = kids.find(k => k.id === order.kidId);
            return (
              <motion.div
                key={order.id}
                layout
                className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3"
              >
                {meal && <img src={meal.image} alt={meal.name} className="w-10 h-10 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{meal?.name}</p>
                  <p className="text-xs text-gray-500">{kid?.name} - Rs {order.price}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor(order.status)}`}>
                  {order.status}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ParentDashboard() {
  const [tab, setTab] = useState('profiles');
  const kids = useAppStore(s => s.kids);
  const orders = useAppStore(s => s.orders);
  const pendingCount = orders.filter(o => o.status === 'Pending Approval').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-5 mx-4 mt-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Parent Command Center</h2>
              <p className="text-white/70 text-xs">Manage meals, budgets & approvals</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <motion.button
              onClick={() => setTab('orders')}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-1 bg-white/20 px-2.5 py-1.5 rounded-full min-h-[44px]"
            >
              <ShoppingBag size={13} className="text-white" />
              <span className="text-white text-xs font-bold">{pendingCount} pending</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 overflow-x-auto scrollbar-hide">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => setTab(t.id)}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap min-h-[48px] ${
                isActive ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon size={14} />
              {t.label}
              {t.id === 'orders' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{pendingCount}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          {tab === 'profiles' && (
            <motion.div key="profiles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {kids.map(k => <KidProfileCard key={k.id} kid={k} />)}
            </motion.div>
          )}
          {tab === 'wallet' && (
            <motion.div key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <WalletSection />
            </motion.div>
          )}
          {tab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <WeeklyScheduler />
            </motion.div>
          )}
          {tab === 'safety' && (
            <motion.div key="safety" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <DietaryControls />
            </motion.div>
          )}
          {tab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ApprovalQueue />
            </motion.div>
          )}
          {tab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <OrderHistory />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
