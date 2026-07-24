import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Users, Wallet, Calendar, Shield, ShoppingBag, History, Plus, Check, X, TrendingUp, AlertTriangle, Zap, BarChart3, MessageSquare, CheckSquare, Square, Gift, Target, Trash2, PieChart, Trophy } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { DAYS, MEAL_SLOTS } from '../../types';
import type { KidProfile, Order } from '../../types';
import InsightsDashboard from './InsightsDashboard';

const TABS = [
  { id: 'orders', label: 'Approvals', icon: ShoppingBag },
  { id: 'health', label: 'Health', icon: BarChart3 },
  { id: 'insights', label: 'Insights', icon: PieChart },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'profiles', label: 'Kids', icon: Users },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'challenges', label: 'Challenges', icon: Target },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'safety', label: 'Safety', icon: Shield },
  { id: 'rules', label: 'Auto Rules', icon: Zap },
  { id: 'history', label: 'History', icon: History },
];

function SwipeableOrderCard({ order, onApprove, onReject, isSelected, onToggleSelect }: {
  order: Order;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const meals = useAppStore(s => s.meals);
  const kids = useAppStore(s => s.kids);
  const meal = meals.find(m => m.id === order.mealId);
  const kid = kids.find(k => k.id === order.kidId);
  const [rejectingId, setRejectingId] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-120, -60, 0, 60, 120], [1, 0.5, 0, 0.5, 1]);
  const bgColor = useTransform(x, [-120, 0, 120], ['#EF4444', '#FFFFFF', '#10B981']);
  const iconScale = useTransform(x, [-120, -60, 0, 60, 120], [1, 0.5, 0, 0.5, 1]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) {
      onApprove(order.id);
    } else if (info.offset.x < -100) {
      setRejectingId(true);
    }
  };

  const handleReject = () => {
    if (rejectReason) {
      onReject(order.id);
      setRejectingId(false);
      setRejectReason('');
    }
  };

  if (!meal || !kid) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background indicators */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-6 rounded-2xl"
        style={{ backgroundColor: bgColor, opacity: bgOpacity }}
      >
        <motion.div style={{ scale: iconScale }} className="flex items-center gap-2 text-white font-bold">
          <X size={20} />
          <span className="text-sm">Reject</span>
        </motion.div>
        <motion.div style={{ scale: iconScale }} className="flex items-center gap-2 text-white font-bold">
          <span className="text-sm">Approve</span>
          <Check size={20} />
        </motion.div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 relative z-10 touch-pan-y"
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggleSelect(order.id)}
            className="mt-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            {isSelected ? (
              <CheckSquare size={20} className="text-emerald-500" />
            ) : (
              <Square size={20} className="text-gray-300" />
            )}
          </button>

          {/* Kid Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-lg shrink-0 shadow-sm">
            {kid.avatar}
          </div>

          {/* Meal Image */}
          <img src={meal.image} alt={meal.name} className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm" />

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-bold text-gray-800">{kid.name}</span>
              <span className="text-xs text-gray-400">
                {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="font-bold text-gray-800 text-sm truncate">{meal.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${meal.isVeg ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {meal.isVeg ? 'Veg' : 'Non-Veg'}
              </span>
              <span className="text-sm font-bold text-amber-600">Rs {order.price}</span>
              <span className="text-xs text-gray-400">{meal.calories} cal</span>
            </div>
            {order.kidNote && (
              <div className="flex items-start gap-1 mt-2 bg-blue-50 rounded-lg px-2 py-1.5">
                <MessageSquare size={11} className="text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 italic">"{order.kidNote}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Reject reason UI */}
        {rejectingId && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-3 space-y-2"
          >
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
                onClick={handleReject}
                whileTap={{ scale: 0.95 }}
                disabled={!rejectReason}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 min-h-[44px]"
              >
                Confirm Reject
              </motion.button>
              <button onClick={() => { setRejectingId(false); setRejectReason(''); }} className="px-3 text-gray-400 min-h-[44px]">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        {!rejectingId && (
          <div className="flex gap-2 mt-3">
            <motion.button
              onClick={() => onApprove(order.id)}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold min-h-[48px] active:bg-emerald-600"
            >
              <Check size={14} />
              Approve
            </motion.button>
            <motion.button
              onClick={() => setRejectingId(true)}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold min-h-[48px] active:bg-red-100"
            >
              <X size={14} />
              Reject
            </motion.button>
          </div>
        )}

        {/* Swipe hint */}
        <p className="text-center text-xs text-gray-300 mt-2 hidden sm:hidden md:hidden lg:block">Swipe right to approve, left to reject</p>
      </motion.div>
    </div>
  );
}

function ApprovalQueue() {
  const orders = useAppStore(s => s.orders);
  const approveOrder = useAppStore(s => s.approveOrder);
  const rejectOrder = useAppStore(s => s.rejectOrder);
  const bulkApproveOrders = useAppStore(s => s.bulkApproveOrders);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const rejectRef = useRef<string | null>(null);

  const pending = orders.filter(o => o.status === 'Pending Approval');

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === pending.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pending.map(o => o.id)));
    }
  };

  const handleApprove = (id: string) => {
    approveOrder(id);
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  };

  const handleReject = (id: string) => {
    rejectRef.current = id;
  };

  const confirmReject = () => {
    if (rejectRef.current && rejectReason) {
      rejectOrder(rejectRef.current, rejectReason);
      setSelectedIds(prev => { const next = new Set(prev); next.delete(rejectRef.current!); return next; });
      rejectRef.current = null;
      setRejectReason('');
    }
  };

  const handleBulkApprove = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    bulkApproveOrders(ids);
    setSelectedIds(new Set());
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  };

  return (
    <div className="space-y-3">
      {showConfetti && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          <span className="text-6xl">🎉</span>
        </motion.div>
      )}

      {pending.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No pending orders</p>
          <p className="text-xs mt-1">New orders from your kids will appear here</p>
        </div>
      ) : (
        <>
          {/* Bulk actions bar */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm p-3">
            <button
              onClick={selectAll}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 min-h-[44px]"
            >
              {selectedIds.size === pending.length ? (
                <CheckSquare size={18} className="text-emerald-500" />
              ) : (
                <Square size={18} className="text-gray-300" />
              )}
              {selectedIds.size === pending.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <span className="text-xs text-gray-500 font-medium">{selectedIds.size} selected</span>
              )}
              <motion.button
                onClick={handleBulkApprove}
                whileTap={{ scale: 0.95 }}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
              >
                <Check size={14} />
                Approve All ({selectedIds.size})
              </motion.button>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center px-4">Swipe cards right to approve or left to reject on mobile</p>

          <AnimatePresence>
            {pending.map(order => (
              <SwipeableOrderCard
                key={order.id}
                order={order}
                onApprove={handleApprove}
                onReject={handleReject}
                isSelected={selectedIds.has(order.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </AnimatePresence>
        </>
      )}

      {/* Global reject modal */}
      <AnimatePresence>
        {rejectRef.current && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { rejectRef.current = null; setRejectReason(''); }}
          >
            <motion.div
              className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-gray-800 mb-3">Reject Order</h3>
              <select
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 mb-3"
              >
                <option value="">Select reason...</option>
                <option value="Over Budget">Over Budget</option>
                <option value="Not Healthy">Not Healthy</option>
                <option value="Schedule Conflict">Schedule Conflict</option>
                <option value="Other">Other</option>
              </select>
              <div className="flex gap-2">
                <motion.button
                  onClick={confirmReject}
                  whileTap={{ scale: 0.95 }}
                  disabled={!rejectReason}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 min-h-[44px]"
                >
                  Reject
                </motion.button>
                <button onClick={() => { rejectRef.current = null; setRejectReason(''); }} className="px-4 text-gray-400 min-h-[44px]">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WeeklyHealthReport() {
  const kids = useAppStore(s => s.kids);
  const orders = useAppStore(s => s.orders);
  const meals = useAppStore(s => s.meals);

  const weekMs = 7 * 86400000;
  const now = Date.now();

  const getKidWeeklyStats = (kidId: string) => {
    const weekOrders = orders.filter(o =>
      o.kidId === kidId &&
      o.status === 'Delivered' &&
      (now - o.timestamp) < weekMs
    );

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let vegCount = 0;
    let totalSpent = 0;

    weekOrders.forEach(o => {
      const meal = meals.find(m => m.id === o.mealId);
      if (!meal) return;
      totalCalories += meal.calories;
      totalProtein += parseInt(meal.nutrition.protein) || 0;
      totalCarbs += parseInt(meal.nutrition.carbs) || 0;
      totalFats += parseInt(meal.nutrition.fats) || 0;
      if (meal.isVeg) vegCount++;
      totalSpent += o.price;
    });

    const avgCalories = weekOrders.length > 0 ? Math.round(totalCalories / weekOrders.length) : 0;

    return {
      totalOrders: weekOrders.length,
      avgCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      vegPercent: weekOrders.length > 0 ? Math.round((vegCount / weekOrders.length) * 100) : 0,
      totalSpent,
      veggiePtsEarned: weekOrders.reduce((sum, o) => {
        const meal = meals.find(m => m.id === o.mealId);
        return sum + (meal?.veggiePoints ?? 0);
      }, 0),
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 size={18} className="text-teal-600" />
        <h3 className="font-bold text-gray-800">Weekly Health Report</h3>
      </div>

      {kids.map(kid => {
        const stats = getKidWeeklyStats(kid.id);
        return (
          <motion.div
            key={kid.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Kid header */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                {kid.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{kid.name}</h4>
                <p className="text-xs text-gray-500">Last 7 days - {stats.totalOrders} meals delivered</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-teal-600">+{stats.veggiePtsEarned}</p>
                <p className="text-xs text-gray-400">veggie pts</p>
              </div>
            </div>

            <div className="p-4">
              {stats.totalOrders === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No delivered orders this week</p>
              ) : (
                <>
                  {/* Macro stats */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-orange-50 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-orange-600 font-medium">Avg Cal</p>
                      <p className="text-sm font-bold text-orange-700">{stats.avgCalories}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-blue-600 font-medium">Protein</p>
                      <p className="text-sm font-bold text-blue-700">{stats.totalProtein}g</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-amber-600 font-medium">Carbs</p>
                      <p className="text-sm font-bold text-amber-700">{stats.totalCarbs}g</p>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-rose-600 font-medium">Fats</p>
                      <p className="text-sm font-bold text-rose-700">{stats.totalFats}g</p>
                    </div>
                  </div>

                  {/* Veg percentage bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-500 font-medium">Veg vs Non-Veg Balance</span>
                      <span className="font-bold text-emerald-600">{stats.vegPercent}% Veg</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.vegPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>

                  {/* Spending */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                    <span className="text-xs text-gray-500 font-medium">Total Spent This Week</span>
                    <span className="text-sm font-bold text-gray-800">Rs {stats.totalSpent}</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function AutoApproveRules() {
  const kids = useAppStore(s => s.kids);
  const meals = useAppStore(s => s.meals);
  const autoApproveRules = useAppStore(s => s.autoApproveRules);
  const addAutoApproveRule = useAppStore(s => s.addAutoApproveRule);
  const updateAutoApproveRule = useAppStore(s => s.updateAutoApproveRule);
  const removeAutoApproveRule = useAppStore(s => s.removeAutoApproveRule);
  const [addingForKid, setAddingForKid] = useState<string | null>(null);
  const [ruleType, setRuleType] = useState<'budget_threshold' | 'meal_whitelist'>('budget_threshold');
  const [threshold, setThreshold] = useState('');
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);

  const handleAddRule = () => {
    if (!addingForKid) return;
    if (ruleType === 'budget_threshold' && threshold) {
      addAutoApproveRule({
        kidId: addingForKid,
        type: 'budget_threshold',
        budgetThreshold: parseFloat(threshold),
        enabled: true,
      });
    } else if (ruleType === 'meal_whitelist' && selectedMeals.length > 0) {
      addAutoApproveRule({
        kidId: addingForKid,
        type: 'meal_whitelist',
        whitelistedMealIds: selectedMeals,
        enabled: true,
      });
    }
    setAddingForKid(null);
    setThreshold('');
    setSelectedMeals([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Zap size={18} className="text-amber-500" />
        <h3 className="font-bold text-gray-800">Auto-Approve Rules</h3>
      </div>
      <p className="text-xs text-gray-500 -mt-2">Orders matching these rules will be approved automatically without your intervention.</p>

      {/* Existing rules */}
      {autoApproveRules.length === 0 && !addingForKid && (
        <div className="text-center py-8 bg-gray-50 rounded-2xl">
          <Zap size={28} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400 font-medium">No auto-approve rules yet</p>
          <p className="text-xs text-gray-400 mt-1">Add rules to speed up approvals</p>
        </div>
      )}

      {autoApproveRules.map(rule => {
        const kid = kids.find(k => k.id === rule.kidId);
        return (
          <motion.div
            key={rule.id}
            layout
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{kid?.avatar}</span>
                <span className="text-sm font-bold text-gray-800">{kid?.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rule.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {rule.enabled ? 'Active' : 'Paused'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  onClick={() => updateAutoApproveRule(rule.id, { enabled: !rule.enabled })}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${
                    rule.enabled ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                </motion.button>
                <button onClick={() => removeAutoApproveRule(rule.id)} className="p-1 text-gray-300 hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              {rule.type === 'budget_threshold' ? (
                <p className="text-xs text-gray-600">
                  Auto-approve orders under <span className="font-bold text-amber-600">Rs {rule.budgetThreshold}</span>
                </p>
              ) : (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Auto-approve these meals:</p>
                  <div className="flex flex-wrap gap-1">
                    {rule.whitelistedMealIds?.map(mId => {
                      const meal = meals.find(m => m.id === mId);
                      return meal ? (
                        <span key={mId} className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 font-medium text-gray-700">
                          {meal.name.split(' ').slice(0, 2).join(' ')}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Add rule */}
      {!addingForKid ? (
        <motion.button
          onClick={() => setAddingForKid(kids[0]?.id ?? null)}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-amber-300 text-amber-600 font-semibold text-sm hover:bg-amber-50 min-h-[48px]"
        >
          <Plus size={16} />
          Add Auto-Approve Rule
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-800 text-sm">New Rule</h4>
            <button onClick={() => setAddingForKid(null)} className="text-gray-400"><X size={16} /></button>
          </div>

          {/* Kid selector */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">For which kid?</label>
            <select
              value={addingForKid}
              onChange={e => setAddingForKid(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2"
            >
              {kids.map(k => <option key={k.id} value={k.id}>{k.avatar} {k.name}</option>)}
            </select>
          </div>

          {/* Rule type */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Rule type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setRuleType('budget_threshold')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold min-h-[44px] ${ruleType === 'budget_threshold' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                Budget Threshold
              </button>
              <button
                onClick={() => setRuleType('meal_whitelist')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold min-h-[44px] ${ruleType === 'meal_whitelist' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                Meal Whitelist
              </button>
            </div>
          </div>

          {ruleType === 'budget_threshold' && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Auto-approve orders under (Rs)</label>
              <input
                type="number"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                placeholder="e.g. 150"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2"
              />
            </div>
          )}

          {ruleType === 'meal_whitelist' && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Select meals to whitelist</label>
              <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2">
                {meals.map(meal => (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMeals(prev => prev.includes(meal.id) ? prev.filter(id => id !== meal.id) : [...prev, meal.id])}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all ${
                      selectedMeals.includes(meal.id) ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    {selectedMeals.includes(meal.id) ? (
                      <CheckSquare size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Square size={14} className="text-gray-300 shrink-0" />
                    )}
                    <span className="font-medium text-gray-700 truncate">{meal.name}</span>
                    <span className="text-gray-400 ml-auto shrink-0">Rs {meal.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <motion.button
            onClick={handleAddRule}
            whileTap={{ scale: 0.95 }}
            disabled={(ruleType === 'budget_threshold' && !threshold) || (ruleType === 'meal_whitelist' && selectedMeals.length === 0)}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 min-h-[44px]"
          >
            Save Rule
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

function KidProfileCard({ kid }: { kid: KidProfile }) {
  const updateKid = useAppStore(s => s.updateKid);
  const addFunds = useAppStore(s => s.addFunds);
  const toggleAllergy = useAppStore(s => s.toggleAllergy);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [dailyInput, setDailyInput] = useState(kid.dailyBudget.toString());
  const [weeklyInput] = useState(kid.weeklyBudget.toString());

  const spentToday = 0;

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
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">{kid?.name} - Rs {order.price}</span>
                    {order.kidNote && (
                      <span className="text-xs text-blue-400 italic truncate max-w-[100px]" title={order.kidNote}>
                        "{order.kidNote}"
                      </span>
                    )}
                  </div>
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

function FamilyLeaderboard() {
  const kids = useAppStore(s => s.kids);
  const orders = useAppStore(s => s.orders);
  const weeklyPointChallenge = useAppStore(s => s.weeklyPointChallenge);
  const leaderboardHistory = useAppStore(s => s.leaderboardHistory);
  const setWeeklyPointChallenge = useAppStore(s => s.setWeeklyPointChallenge);
  const resolveWeeklyChallenge = useAppStore(s => s.resolveWeeklyChallenge);
  const clearWeeklyChallenge = useAppStore(s => s.clearWeeklyChallenge);
  const [targetPoints, setTargetPoints] = useState('500');
  const [bonusCredit, setBonusCredit] = useState('50');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const weekMs = 7 * 86400000;
  const now = Date.now();

  // Calculate this week's points for each kid
  const getWeeklyPoints = (kidId: string) => {
    const meals = useAppStore.getState().meals;
    return orders
      .filter(o =>
        o.kidId === kidId &&
        o.status === 'Delivered' &&
        (now - o.timestamp) < weekMs
      )
      .reduce((sum, o) => {
        const meal = meals.find(m => m.id === o.mealId);
        return sum + (meal?.veggiePoints ?? 0);
      }, 0);
  };

  const leaderboard = kids
    .map(k => ({ ...k, weeklyPoints: getWeeklyPoints(k.id) }))
    .sort((a, b) => b.weeklyPoints - a.weeklyPoints);

  const leader = leaderboard[0];
  const runnerUp = leaderboard[1];
  const pointDiff = leader && runnerUp ? leader.weeklyPoints - runnerUp.weeklyPoints : 0;

  const handleCreateChallenge = () => {
    const tp = parseInt(targetPoints) || 500;
    const bc = parseInt(bonusCredit) || 50;
    setWeeklyPointChallenge(tp, bc);
    setShowCreateForm(false);
  };

  const handleDeclareWinner = () => {
    if (leader) resolveWeeklyChallenge(leader.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy size={18} className="text-amber-500" />
        <h3 className="font-bold text-gray-800">Family Leaderboard</h3>
      </div>
      <p className="text-xs text-gray-500 -mt-2">See who's earning the most Veggie Points this week!</p>

      {/* Current standings */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-3">This Week's Standings</p>

        <div className="space-y-3">
          {leaderboard.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-white shadow-sm border border-amber-200' : 'bg-white/60'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-400 text-white' :
                i === 1 ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {i === 0 ? '🏆' : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-lg">
                {k.avatar}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm">{k.name}</p>
                <p className="text-xs text-gray-500">Age {k.age}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black ${i === 0 ? 'text-amber-600' : 'text-gray-600'}`}>
                  {k.weeklyPoints}
                </p>
                <p className="text-xs text-gray-400">pts this week</p>
              </div>
            </motion.div>
          ))}
        </div>

        {leader && runnerUp && pointDiff > 0 && (
          <motion.div
            className="mt-3 flex items-center gap-2 bg-white rounded-xl p-3 border border-amber-100"
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xl"
            >
              🏆
            </motion.div>
            <p className="text-xs font-semibold text-amber-800">
              {leader.name} is leading by {pointDiff} points!
            </p>
          </motion.div>
        )}
      </div>

      {/* Weekly Point Challenge */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Family Point Challenge</p>

        {weeklyPointChallenge && weeklyPointChallenge.active ? (
          <div className="space-y-3">
            <div className="bg-teal-50 rounded-xl p-3 border border-teal-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-teal-800">
                  First to {weeklyPointChallenge.targetPoints} pts wins Rs {weeklyPointChallenge.bonusCredit}!
                </p>
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>

              {/* Progress bars for each kid */}
              <div className="space-y-2 mt-3">
                {leaderboard.map(k => {
                  const pct = Math.min((k.weeklyPoints / weeklyPointChallenge.targetPoints) * 100, 100);
                  return (
                    <div key={k.id}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="font-medium text-gray-600">{k.avatar} {k.name}</span>
                        <span className="font-bold text-teal-600">{k.weeklyPoints}/{weeklyPointChallenge.targetPoints}</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              {leader && leader.weeklyPoints >= weeklyPointChallenge.targetPoints && (
                <motion.button
                  onClick={handleDeclareWinner}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold min-h-[44px]"
                >
                  Declare {leader.name} Winner!
                </motion.button>
              )}
              <motion.button
                onClick={clearWeeklyChallenge}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold min-h-[44px]"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        ) : weeklyPointChallenge && !weeklyPointChallenge.active ? (
          <div className="space-y-3">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
              <span className="text-2xl">🎉</span>
              <p className="text-sm font-bold text-emerald-800 mt-1">
                Challenge completed! {kids.find(k => k.id === weeklyPointChallenge.winnerId)?.name} won!
              </p>
              <p className="text-xs text-emerald-600">+Rs {weeklyPointChallenge.bonusCredit} added to wallet</p>
            </div>
            <motion.button
              onClick={() => { clearWeeklyChallenge(); setShowCreateForm(true); }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold min-h-[44px]"
            >
              Start New Challenge
            </motion.button>
          </div>
        ) : showCreateForm ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-gray-600">Set a target and reward for the family race:</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Target (pts)</label>
                <input
                  type="number"
                  value={targetPoints}
                  onChange={e => setTargetPoints(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Bonus (Rs)</label>
                <input
                  type="number"
                  value={bonusCredit}
                  onChange={e => setBonusCredit(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-300"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 italic">
              "First to {targetPoints} points this week gets Rs {bonusCredit} bonus wallet credit"
            </p>
            <div className="flex gap-2">
              <motion.button
                onClick={handleCreateChallenge}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold min-h-[44px]"
              >
                Start Challenge
              </motion.button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setShowCreateForm(true)}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-amber-300 text-amber-600 font-semibold text-sm hover:bg-amber-50 min-h-[48px]"
          >
            <Plus size={16} />
            Set Family Challenge
          </motion.button>
        )}
      </div>

      {/* History */}
      {leaderboardHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Past Winners</p>
          <div className="space-y-2">
            {leaderboardHistory.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
              >
                <span className="text-lg">🏆</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{entry.winnerName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} week
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-600">{entry.winnerPoints} pts</p>
                  <p className="text-xs text-gray-400">vs {entry.runnerUpPoints}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const REWARD_EMOJIS = ['🎮', '🍦', '📚', '🎬', '⚽', '🎨', '🧸', '🎁', '🏊', '🚲', '🎵', '🌟'];

function RewardsManager() {
  const rewards = useAppStore(s => s.rewards);
  const rewardRedemptions = useAppStore(s => s.rewardRedemptions);
  const addReward = useAppStore(s => s.addReward);
  const removeReward = useAppStore(s => s.removeReward);
  const kids = useAppStore(s => s.kids);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pointCost, setPointCost] = useState('');
  const [emoji, setEmoji] = useState('🎁');

  const handleAdd = () => {
    if (!name.trim() || !pointCost) return;
    addReward({
      name: name.trim(),
      description: description.trim(),
      pointCost: parseInt(pointCost),
      emoji,
      createdBy: 'parent',
    });
    setName('');
    setDescription('');
    setPointCost('');
    setEmoji('🎁');
    setAdding(false);
  };

  const getRedemptionCount = (rewardId: string) =>
    rewardRedemptions.filter(r => r.rewardId === rewardId).length;

  const getRecentRedemptions = (rewardId: string) => {
    return rewardRedemptions
      .filter(r => r.rewardId === rewardId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3)
      .map(r => {
        const kid = kids.find(k => k.id === r.kidId);
        return { ...r, kidName: kid?.name ?? 'Unknown', kidAvatar: kid?.avatar ?? '?' };
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-amber-500" />
          <h3 className="font-bold text-gray-800">Rewards Shop</h3>
        </div>
        <span className="text-xs text-gray-400">{rewards.length} reward{rewards.length !== 1 ? 's' : ''}</span>
      </div>
      <p className="text-xs text-gray-500 -mt-2">Create real-world rewards your kids can redeem with their Veggie Points.</p>

      {rewards.length === 0 && !adding && (
        <div className="text-center py-10 bg-gray-50 rounded-2xl">
          <Gift size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400 font-medium">No rewards created yet</p>
          <p className="text-xs text-gray-400 mt-1">Add rewards to motivate healthy eating</p>
        </div>
      )}

      {rewards.map(reward => {
        const count = getRedemptionCount(reward.id);
        const recent = getRecentRedemptions(reward.id);
        return (
          <motion.div
            key={reward.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {reward.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-800">{reward.name}</h4>
                  <button
                    onClick={() => removeReward(reward.id)}
                    className="text-gray-300 hover:text-red-400 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {reward.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{reward.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-bold text-amber-600">{reward.pointCost} pts</span>
                  <span className="text-xs text-gray-400">Redeemed {count} time{count !== 1 ? 's' : ''}</span>
                </div>
                {recent.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-gray-400">Recent:</span>
                    {recent.map((r, i) => (
                      <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                        {r.kidAvatar} {r.kidName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {adding ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-800 text-sm">New Reward</h4>
            <button onClick={() => setAdding(false)} className="text-gray-400"><X size={16} /></button>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Pick an emoji</label>
            <div className="flex flex-wrap gap-1.5">
              {REWARD_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                    emoji === e ? 'bg-amber-100 ring-2 ring-amber-400 scale-110' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Reward name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 30 min extra screen time"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-300"
              maxLength={50}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Can be used on weekends"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-300"
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Point cost</label>
            <input
              type="number"
              value={pointCost}
              onChange={e => setPointCost(e.target.value)}
              placeholder="e.g. 50"
              min="1"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-300"
            />
          </div>

          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.95 }}
            disabled={!name.trim() || !pointCost}
            className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 min-h-[44px]"
          >
            Create Reward
          </motion.button>
        </motion.div>
      ) : (
        <motion.button
          onClick={() => setAdding(true)}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-amber-300 text-amber-600 font-semibold text-sm hover:bg-amber-50 min-h-[48px]"
        >
          <Plus size={16} />
          Add Reward
        </motion.button>
      )}
    </div>
  );
}

const CHALLENGE_TYPES: Array<{ value: 'new_veggies' | 'streak' | 'budget' | 'variety'; label: string; desc: string }> = [
  { value: 'new_veggies', label: 'New Veggies', desc: 'Try new vegetable dishes' },
  { value: 'streak', label: 'Streak', desc: 'Maintain a healthy eating streak' },
  { value: 'budget', label: 'Budget', desc: 'Order within budget for X days' },
  { value: 'variety', label: 'Variety', desc: 'Try different meal categories' },
];

function ChallengesManager() {
  const familyChallenges = useAppStore(s => s.familyChallenges);
  const addFamilyChallenge = useAppStore(s => s.addFamilyChallenge);
  const removeFamilyChallenge = useAppStore(s => s.removeFamilyChallenge);
  const kids = useAppStore(s => s.kids);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCount, setTargetCount] = useState('');
  const [rewardPoints, setRewardPoints] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('7');
  const [type, setType] = useState<'new_veggies' | 'streak' | 'budget' | 'variety'>('new_veggies');

  const handleAdd = () => {
    if (!title.trim() || !targetCount || !rewardPoints) return;
    addFamilyChallenge({
      title: title.trim(),
      description: description.trim(),
      targetCount: parseInt(targetCount),
      rewardPoints: parseInt(rewardPoints),
      deadline: Date.now() + parseInt(deadlineDays) * 86400000,
      type,
    });
    setTitle('');
    setDescription('');
    setTargetCount('');
    setRewardPoints('');
    setDeadlineDays('7');
    setType('new_veggies');
    setAdding(false);
  };

  const activeChallenges = familyChallenges.filter(c => !c.completed && c.deadline > Date.now());
  const completedChallenges = familyChallenges.filter(c => c.completed);
  const expiredChallenges = familyChallenges.filter(c => !c.completed && c.deadline <= Date.now());

  const getDaysLeft = (deadline: number) => {
    const days = Math.ceil((deadline - Date.now()) / 86400000);
    return days > 0 ? days : 0;
  };

  const getTotalProgress = (progress: Record<string, number>) =>
    Object.values(progress).reduce((sum, v) => sum + v, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-teal-600" />
          <h3 className="font-bold text-gray-800">Family Challenges</h3>
        </div>
        <span className="text-xs text-gray-400">{activeChallenges.length} active</span>
      </div>
      <p className="text-xs text-gray-500 -mt-2">Set goals for the whole family and reward healthy habits together.</p>

      {/* Active challenges */}
      {activeChallenges.length === 0 && !adding && completedChallenges.length === 0 && expiredChallenges.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-2xl">
          <Target size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400 font-medium">No active challenges</p>
          <p className="text-xs text-gray-400 mt-1">Create challenges to motivate the family</p>
        </div>
      )}

      {activeChallenges.map(challenge => {
        const progress = getTotalProgress(challenge.currentProgress);
        const pct = Math.min((progress / challenge.targetCount) * 100, 100);
        const daysLeft = getDaysLeft(challenge.deadline);

        return (
          <motion.div
            key={challenge.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    challenge.type === 'new_veggies' ? 'bg-emerald-100 text-emerald-700' :
                    challenge.type === 'streak' ? 'bg-orange-100 text-orange-700' :
                    challenge.type === 'budget' ? 'bg-blue-100 text-blue-700' :
                    'bg-teal-100 text-teal-700'
                  }`}>
                    {CHALLENGE_TYPES.find(t => t.value === challenge.type)?.label}
                  </span>
                  <span className="text-xs text-gray-400">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                </div>
                <h4 className="font-bold text-gray-800 mt-1">{challenge.title}</h4>
                {challenge.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{challenge.description}</p>
                )}
              </div>
              <button
                onClick={() => removeFamilyChallenge(challenge.id)}
                className="text-gray-300 hover:text-red-400 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Progress: {progress}/{challenge.targetCount}</span>
                <span className="font-bold text-amber-600">+{challenge.rewardPoints} pts reward</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>

            {/* Per-kid progress */}
            <div className="flex flex-wrap gap-2 mt-2">
              {kids.map(kid => {
                const kidProgress = challenge.currentProgress[kid.id] ?? 0;
                return (
                  <div key={kid.id} className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                    <span className="text-sm">{kid.avatar}</span>
                    <span className="text-xs font-medium text-gray-600">{kidProgress}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {/* Completed */}
      {completedChallenges.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Completed</p>
          {completedChallenges.map(c => (
            <div key={c.id} className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" />
                <span className="text-sm font-medium text-emerald-800">{c.title}</span>
              </div>
              <button onClick={() => removeFamilyChallenge(c.id)} className="text-gray-300 hover:text-red-400 p-1">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Expired */}
      {expiredChallenges.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Expired</p>
          {expiredChallenges.map(c => (
            <div key={c.id} className="bg-red-50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <X size={14} className="text-red-400" />
                <span className="text-sm font-medium text-red-700">{c.title}</span>
              </div>
              <button onClick={() => removeFamilyChallenge(c.id)} className="text-gray-300 hover:text-red-400 p-1">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add challenge form */}
      {adding ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-teal-200 shadow-sm p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-800 text-sm">New Challenge</h4>
            <button onClick={() => setAdding(false)} className="text-gray-400"><X size={16} /></button>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Challenge type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {CHALLENGE_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`p-2 rounded-xl text-left transition-all ${
                    type === t.value ? 'bg-teal-50 border-2 border-teal-400' : 'bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <p className="text-xs font-bold text-gray-700">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Challenge title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Try 3 new veggies this week"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-300"
              maxLength={60}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Each kid must try at least one new veggie"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-300"
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Target</label>
              <input
                type="number"
                value={targetCount}
                onChange={e => setTargetCount(e.target.value)}
                placeholder="3"
                min="1"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Reward pts</label>
              <input
                type="number"
                value={rewardPoints}
                onChange={e => setRewardPoints(e.target.value)}
                placeholder="25"
                min="1"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Days</label>
              <select
                value={deadlineDays}
                onChange={e => setDeadlineDays(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-300"
              >
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="7">7</option>
                <option value="14">14</option>
                <option value="30">30</option>
              </select>
            </div>
          </div>

          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.95 }}
            disabled={!title.trim() || !targetCount || !rewardPoints}
            className="w-full py-2.5 bg-teal-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 min-h-[44px]"
          >
            Create Challenge
          </motion.button>
        </motion.div>
      ) : (
        <motion.button
          onClick={() => setAdding(true)}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-teal-300 text-teal-600 font-semibold text-sm hover:bg-teal-50 min-h-[48px]"
        >
          <Plus size={16} />
          Add Family Challenge
        </motion.button>
      )}
    </div>
  );
}

export default function ParentDashboard() {
  const [tab, setTab] = useState('orders');
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
          {tab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ApprovalQueue />
            </motion.div>
          )}
          {tab === 'health' && (
            <motion.div key="health" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <WeeklyHealthReport />
            </motion.div>
          )}
          {tab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <InsightsDashboard />
            </motion.div>
          )}
          {tab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <FamilyLeaderboard />
            </motion.div>
          )}
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
          {tab === 'rewards' && (
            <motion.div key="rewards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <RewardsManager />
            </motion.div>
          )}
          {tab === 'challenges' && (
            <motion.div key="challenges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ChallengesManager />
            </motion.div>
          )}
          {tab === 'rules' && (
            <motion.div key="rules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AutoApproveRules />
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
