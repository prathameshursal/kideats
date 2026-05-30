import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Utensils, Package, Star, Bell, Wallet, Sparkles, Zap, AlertTriangle, Lock, Trophy, Clock, Flame, Plus, CheckCircle, XCircle, Truck, ChefHat, Gift, ChevronDown, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { TAG_META, BADGE_DEFS, DAYS } from '../../types';
import type { KidProfile, Meal, Order } from '../../types';
import CheckoutModal from '../shared/CheckoutModal';
import BadgeUnlockModal from '../shared/BadgeUnlockModal';

const KID_TABS = [
  { id: 'discover', label: 'Explore', icon: Utensils },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'badges', label: 'Badges', icon: Star },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

function AnimatedCounter({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v: number) => Math.round(v));
  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [value, motionVal]);
  return <motion.span>{display}</motion.span>;
}

function MealCard({ meal, onOrder, isPreApproved, isBlocked }: {
  meal: Meal; onOrder: (m: Meal) => void; isPreApproved: boolean; isBlocked: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const tagMeta = TAG_META[meal.tags[0]];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col relative ${
        isBlocked ? 'opacity-60' : 'cursor-pointer'
      }`}
      onClick={() => !isBlocked && onOrder(meal)}
      role="button"
      tabIndex={0}
      aria-label={`${meal.name}, Rs ${meal.price}`}
    >
      {/* Blocked overlay */}
      {isBlocked && (
        <div className="absolute inset-0 z-10 bg-red-500/10 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
            <AlertTriangle size={10} />
            Blocked by Parent
          </div>
        </div>
      )}

      {/* Pre-approved badge */}
      {isPreApproved && !isBlocked && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
          <Zap size={9} className="fill-white" />
          Quick Order
        </div>
      )}

      {/* Veg/Non-Veg indicator */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${
          meal.isVeg ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          {meal.isVeg ? 'Veg' : 'Non-Veg'}
        </div>
      </div>

      <div className="relative h-36 overflow-hidden">
        <motion.img
          src={meal.image}
          alt={meal.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full">
          <Sparkles size={9} className="text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-emerald-700">+{meal.veggiePoints} pts</span>
        </div>
        <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-0.5 rounded-full">
          <span className="text-sm font-black text-gray-800">Rs {meal.price}</span>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1.5">{meal.name}</h3>
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={10} /> {meal.prepTime} min</span>
          <span className="flex items-center gap-1 text-xs text-gray-500"><Flame size={10} /> {meal.calories} cal</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {meal.tags.slice(0, 2).map(tag => (
            <span key={tag} className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${TAG_META[tag]?.bg ?? 'from-gray-400 to-gray-500'} text-white`}>
              {TAG_META[tag]?.emoji} {TAG_META[tag]?.label ?? tag}
            </span>
          ))}
        </div>
        <motion.div className="mt-auto" animate={{ y: isHovered ? 0 : 8, opacity: isHovered ? 1 : 0.7 }}>
          <motion.button
            onClick={e => { e.stopPropagation(); onOrder(meal); }}
            whileTap={{ scale: 0.95 }}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold min-h-[44px] ${
              isPreApproved && !isBlocked
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : `bg-gradient-to-r ${tagMeta?.bg ?? 'from-amber-400 to-orange-400'} text-white`
            }`}
          >
            {isPreApproved && !isBlocked ? <><Zap size={12} /> Quick Order</> : <><Plus size={12} /> Add to Order</>}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function OrderTrackingCard({ order }: { order: Order }) {
  const meals = useAppStore(s => s.meals);
  const advanceDelivery = useAppStore(s => s.advanceDelivery);
  const markDelivered = useAppStore(s => s.markDelivered);
  const meal = meals.find(m => m.id === order.mealId);
  const isRejected = order.status === 'Rejected';
  const isDelivered = order.status === 'Delivered';

  const completedStages = order.deliveryStages.filter(s => s.completed).length;

  const STAGES = [
    { label: 'Chef is cooking', emoji: '👨‍🍳', icon: ChefHat, color: 'text-orange-500', bg: 'bg-orange-100', gradient: 'from-orange-400 to-amber-400' },
    { label: 'Packed with love', emoji: '📦', icon: Package, color: 'text-blue-500', bg: 'bg-blue-100', gradient: 'from-blue-400 to-cyan-400' },
    { label: 'Rider is zooming nearby', emoji: '🚚', icon: Truck, color: 'text-emerald-500', bg: 'bg-emerald-100', gradient: 'from-emerald-400 to-teal-400' },
    { label: 'Delivered! Enjoy!', emoji: '🎁', icon: Gift, color: 'text-green-600', bg: 'bg-green-100', gradient: 'from-emerald-500 to-green-500' },
  ];

  const currentStage = isRejected ? null : STAGES[completedStages - 1] ?? STAGES[0];

  // Auto-advance delivery simulation
  useEffect(() => {
    if (isRejected || isDelivered || order.status === 'Pending Approval') return;
    const interval = setInterval(() => {
      const nextStage = order.deliveryStages.findIndex(s => !s.completed);
      if (nextStage === -1) {
        markDelivered(order.id);
        clearInterval(interval);
      } else if (nextStage === 3) {
        markDelivered(order.id);
        clearInterval(interval);
      } else {
        advanceDelivery(order.id);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [order.id, order.status, order.deliveryStages, isRejected, isDelivered, advanceDelivery, markDelivered]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {meal && <img src={meal.image} alt={meal.name} className="w-14 h-14 rounded-xl object-cover shadow-sm" />}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm truncate">{meal?.name}</p>
            <p className="text-xs text-gray-500">Rs {order.price}</p>
          </div>
          {isRejected ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-full">
              <XCircle size={13} className="text-red-500" />
              <span className="text-xs font-semibold text-red-600">Rejected</span>
            </div>
          ) : isDelivered ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full">
              <CheckCircle size={13} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">Delivered!</span>
            </div>
          ) : null}
        </div>

        {isRejected && (
          <p className="text-xs text-gray-400 italic mb-2">
            {order.parentNote ? `Reason: ${order.parentNote}` : "Your parent didn't approve this one."}
          </p>
        )}

        {!isRejected && !isDelivered && currentStage && (
          <div className="space-y-3">
            <motion.div
              className={`flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r ${currentStage.gradient} text-white`}
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-lg">{currentStage.emoji}</span>
              <span className="text-xs font-bold">{currentStage.label}</span>
            </motion.div>

            {/* Map visualization */}
            <div className="relative h-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200">
              <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-gray-200 -translate-y-1/2" />
              <motion.div
                className="absolute top-1/2 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 -translate-y-1/2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedStages / 4) * 100}%` }}
                transition={{ duration: 1 }}
                style={{ maxWidth: 'calc(100% - 1.5rem)' }}
              />
              {STAGES.map((s, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${3 + (i / 3) * 94}%` }}
                  animate={i < completedStages ? { scale: [1, 1.2, 1] } : {}}
                >
                  <span className="text-sm">{i < completedStages ? s.emoji : '⚪'}</span>
                </motion.div>
              ))}
              {completedStages > 0 && completedStages < 4 && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 text-sm"
                  animate={{ left: [`${3 + ((completedStages - 1) / 3) * 94}%`, `${3 + (completedStages / 3) * 94}%`] }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                >
                  🏍️
                </motion.div>
              )}
            </div>

            {/* Stage progress dots */}
            <div className="flex items-center gap-1">
              {STAGES.map((step, i) => {
                const done = i < completedStages;
                const active = i === completedStages - 1;
                const StepIcon = step.icon;
                return (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <motion.div
                      animate={active ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${done ? step.bg : 'bg-gray-100'}`}
                    >
                      <StepIcon size={12} className={done ? step.color : 'text-gray-300'} />
                    </motion.div>
                    {i < STAGES.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1">
                        <motion.div
                          className={`h-full rounded-full ${done && i < completedStages - 1 ? 'bg-emerald-400' : 'bg-gray-100'}`}
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.5, delay: i * 0.2 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isDelivered && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white"
          >
            <span className="text-lg">🎁</span>
            <span className="text-xs font-bold">Delivered! Enjoy your meal!</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function BadgesSection({ kid }: { kid: KidProfile }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          <h3 className="font-bold text-gray-800 text-base">Your Badges</h3>
        </div>
        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          {kid.badges.length}/{BADGE_DEFS.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {BADGE_DEFS.map((badge, i) => {
          const earned = kid.badges.includes(badge.id);
          return (
            <motion.div
              key={badge.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 15 }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl min-w-[100px] shrink-0 transition-all ${
                earned ? `bg-gradient-to-b ${badge.color} shadow-sm border-2 border-white/50` : 'bg-gray-50 border-2 border-gray-100'
              }`}
            >
              <div className="relative">
                <motion.div
                  className={`text-3xl ${earned ? '' : 'grayscale opacity-30'}`}
                  animate={earned ? { scale: [1, 1.15, 1] } : {}}
                  transition={earned ? { duration: 2, repeat: Infinity, repeatDelay: 3 } : {}}
                >
                  {earned ? badge.icon : <Lock size={24} className="text-gray-300" />}
                </motion.div>
                {earned && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
                  >
                    <Sparkles size={10} className="text-amber-400" />
                  </motion.div>
                )}
              </div>
              <p className={`text-xs font-bold text-center leading-tight ${earned ? 'text-white' : 'text-gray-400'}`}>{badge.name}</p>
              {!earned && <p className="text-xs text-gray-400">{BADGE_DEFS.find(b => b.id === badge.id)?.description}</p>}
              {earned && <span className="text-xs text-white/80 font-semibold">Unlocked!</span>}
            </motion.div>
          );
        })}
      </div>

      {/* Progress to next badge */}
      {(() => {
        const nextBadge = BADGE_DEFS.find(b => !kid.badges.includes(b.id));
        if (!nextBadge) return (
          <motion.div
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200 text-center"
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-2xl mb-1">🏆</p>
            <p className="text-sm font-bold text-amber-700">All badges unlocked! You're a champion!</p>
          </motion.div>
        );
        return (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{nextBadge.icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">Next: {nextBadge.name}</p>
                  <p className="text-xs text-gray-500">{nextBadge.description}</p>
                </div>
              </div>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((kid.veggiePoints / 100) * 100, 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function NotificationPanel({ kidId }: { kidId: string }) {
  const notifications = useAppStore(s => s.notifications);
  const markNotificationRead = useAppStore(s => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore(s => s.markAllNotificationsRead);
  const clearNotifications = useAppStore(s => s.clearNotifications);

  const kidNotifs = notifications.filter(n => !n.kidId || n.kidId === kidId);
  const unreadCount = kidNotifs.filter(n => !n.read).length;

  const typeIcon = (type: string) => {
    switch (type) {
      case 'approval': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'rejection': return <XCircle size={16} className="text-red-500" />;
      case 'delivery': return <Truck size={16} className="text-blue-500" />;
      case 'points': return <Sparkles size={16} className="text-amber-500" />;
      case 'badge': return <Trophy size={16} className="text-orange-500" />;
      default: return <Bell size={16} className="text-gray-400" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-gray-600" />
          <h3 className="font-bold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{unreadCount}</span>
          )}
        </div>
        <div className="flex gap-1">
          {unreadCount > 0 && (
            <button onClick={markAllNotificationsRead} className="text-xs text-amber-600 font-semibold px-2 py-1 min-h-[44px]">Mark All Read</button>
          )}
          {kidNotifs.length > 0 && (
            <button onClick={clearNotifications} className="text-xs text-gray-400 font-medium px-2 py-1 min-h-[44px]">Clear</button>
          )}
        </div>
      </div>

      {kidNotifs.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Bell size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {kidNotifs.slice(0, 10).map(n => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => markNotificationRead(n.id)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  n.read ? 'bg-white' : 'bg-amber-50 border border-amber-100'
                }`}
              >
                <div className="shrink-0 mt-0.5">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-800 font-semibold'}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-2" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function KidDashboard() {
  const [tab, setTab] = useState('discover');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [checkoutMeal, setCheckoutMeal] = useState<Meal | null>(null);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  const kids = useAppStore(s => s.kids);
  const currentKidId = useAppStore(s => s.currentKidId);
  const switchKid = useAppStore(s => s.switchKid);
  const meals = useAppStore(s => s.meals);
  const orders = useAppStore(s => s.orders);
  const weeklyPlan = useAppStore(s => s.weeklyPlan);
  const notifications = useAppStore(s => s.notifications);
  const placeOrder = useAppStore(s => s.placeOrder);
  const setVegMode = useAppStore(s => s.setVegMode);

  const kid = kids.find(k => k.id === currentKidId) ?? kids[0];
  const kidOrders = orders.filter(o => o.kidId === kid.id);
  const kidNotifs = notifications.filter(n => !n.kidId || n.kidId === kid.id);
  const unreadCount = kidNotifs.filter(n => !n.read).length;

  const showToast = useCallback((message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // Get today's scheduled meals
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todayScheduled = weeklyPlan.filter(s => s.day === today);
  const scheduledMealIds = new Set(todayScheduled.map(s => s.mealId));
  const preApprovedMealIds = new Set(todayScheduled.filter(s => s.isPreApproved).map(s => s.mealId));

  // Filter meals
  const filteredMeals = meals.filter(m => {
    if (!m.isKidSafe) return false;
    if (kid.vegMode === 'veg' && !m.isVeg) return false;
    if (kid.vegMode === 'nonveg' && m.isVeg) return false;
    if (activeFilters.length > 0 && !m.tags.some(t => activeFilters.includes(t))) return false;
    return true;
  });

  const isMealBlocked = (meal: Meal) => {
    const hasAllergen = meal.allergens.some(a => kid.allergies.includes(a));
    const hasDietaryBlock = kid.dietaryBlocks.some(block => {
      if (block === 'High Sugar') return meal.tags.includes('Sweet but Healthy');
      if (block === 'Deep Fried') return meal.name.toLowerCase().includes('fried');
      if (block === 'Nuts') return meal.allergens.includes('Nuts');
      if (block === 'Gluten') return meal.allergens.includes('Gluten');
      return false;
    });
    return hasAllergen || hasDietaryBlock;
  };

  const handleOrderClick = (meal: Meal) => {
    setCheckoutMeal(meal);
  };

  const handleCheckoutConfirm = () => {
    if (!checkoutMeal) return;
    const isPreApproved = preApprovedMealIds.has(checkoutMeal.id);
    const isOverBudget = checkoutMeal.price > kid.walletBalance;
    const autoApproved = isPreApproved && !isOverBudget && !isMealBlocked(checkoutMeal);

    placeOrder(kid.id, checkoutMeal.id, autoApproved);
    showToast(autoApproved ? 'Order placed! Chef is cooking!' : 'Sent for approval!');
    setCheckoutMeal(null);
  };

  const handleRequestApproval = () => {
    if (!checkoutMeal) return;
    placeOrder(kid.id, checkoutMeal.id, false);
    showToast('Sent to Mom/Dad for approval!');
    setCheckoutMeal(null);
  };

  const toggleFilter = (tag: string) => {
    setActiveFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const isLowBudget = kid.walletBalance < 50;

  // Check for new badge unlocks
  const prevBadgesRef = useRef(kid.badges.length);
  useEffect(() => {
    if (kid.badges.length > prevBadgesRef.current) {
      setTimeout(() => setShowBadgeUnlock(true), 600);
    }
    prevBadgesRef.current = kid.badges.length;
  }, [kid.badges.length]);

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Hero */}
      <div className="relative z-10 px-4 pt-4 pb-3">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <motion.button
              onClick={() => setShowProfilePicker(true)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 min-h-[48px]"
            >
              <span className="text-lg">{kid.avatar}</span>
              <ChevronDown size={14} className="text-white/80" />
            </motion.button>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setTab('alerts')}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                <Bell size={18} className="text-white/80" />
                {unreadCount > 0 && (
                  <motion.span
                    className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>
              <motion.div
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 min-h-[48px] ${
                  isLowBudget ? 'bg-orange-400/80' : 'bg-white/20'
                }`}
                animate={isLowBudget ? { scale: [1, 1.03, 1] } : {}}
                transition={isLowBudget ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                <Wallet size={13} className="text-white" />
                <span className="text-xs font-bold text-white">Rs {kid.walletBalance}</span>
                {isLowBudget && <AlertTriangle size={11} className="text-white animate-pulse" />}
              </motion.div>
              {/* Veg/Non-Veg Toggle */}
              <motion.button
                onClick={() => {
                  const next = kid.vegMode === 'both' ? 'veg' : kid.vegMode === 'veg' ? 'nonveg' : 'both';
                  setVegMode(kid.id, next);
                }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 min-h-[48px] bg-white/20 hover:bg-white/30 transition-colors"
                aria-label={`Diet mode: ${kid.vegMode}`}
              >
                <span className={`w-2.5 h-2.5 rounded-sm border ${kid.vegMode === 'veg' ? 'bg-emerald-500 border-emerald-400' : kid.vegMode === 'nonveg' ? 'bg-red-500 border-red-400' : 'bg-white/40 border-white/30'}`} />
                <span className="text-xs font-bold text-white">
                  {kid.vegMode === 'veg' ? 'Veg' : kid.vegMode === 'nonveg' ? 'Non-Veg' : 'All'}
                </span>
              </motion.button>
            </div>
          </div>

          <h1 className="text-white font-black text-xl leading-tight mb-2">
            Hey {kid.name}! What are we eating today?
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-sm font-bold text-white">
                <AnimatedCounter value={kid.veggiePoints} /> Veggie Points
              </span>
            </div>
            {kid.currentStreak > 0 && (
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1.5">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-bold text-white">{kid.currentStreak}-day streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="relative z-10 px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
          {Object.entries(TAG_META).map(([key, meta]) => {
            const isActive = activeFilters.includes(key);
            return (
              <motion.button
                key={key}
                onClick={() => toggleFilter(key)}
                animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap shrink-0 transition-all min-h-[48px] ${
                  isActive
                    ? `${meta.bg} text-white shadow-lg`
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span>{meta.emoji}</span>
                {meta.label}
              </motion.button>
            );
          })}
          {activeFilters.length > 0 && (
            <motion.button
              onClick={() => setActiveFilters([])}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-3 py-2.5 rounded-full text-sm font-bold bg-gray-100 text-gray-500 min-h-[48px]"
            >
              <RotateCcw size={12} />
              Clear
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 flex gap-1 px-4 pb-2">
        {KID_TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => setTab(t.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold min-h-[48px] ${
                isActive ? 'bg-teal-500 text-white shadow-sm' : 'text-gray-500 hover:bg-white/70'
              }`}
            >
              <Icon size={14} />
              {t.label}
              {t.id === 'alerts' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          {tab === 'discover' && (
            <motion.div key="discover" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredMeals.map((meal, i) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="relative"
                  >
                    {scheduledMealIds.has(meal.id) && (
                      <motion.div
                        className="absolute -top-1 -right-1 z-20 flex items-center gap-0.5 bg-gradient-to-r from-rose-400 to-pink-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Star size={9} className="fill-white" />
                        Mom's Pick
                      </motion.div>
                    )}
                    <MealCard
                      meal={meal}
                      onOrder={handleOrderClick}
                      isPreApproved={preApprovedMealIds.has(meal.id)}
                      isBlocked={isMealBlocked(meal)}
                    />
                  </motion.div>
                ))}
              </div>
              {filteredMeals.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Utensils size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No meals match your filters</p>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              {kidOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Package size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No orders yet!</p>
                  <p className="text-xs">Pick a meal and order it!</p>
                </div>
              ) : (
                kidOrders.slice(0, 5).map(o => <OrderTrackingCard key={o.id} order={o} />)
              )}
            </motion.div>
          )}

          {tab === 'badges' && (
            <motion.div key="badges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <BadgesSection kid={kid} />
            </motion.div>
          )}

          {tab === 'alerts' && (
            <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <NotificationPanel kidId={kid.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile picker */}
      <AnimatePresence>
        {showProfilePicker && kids.length > 1 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfilePicker(false)}
          >
            <motion.div
              className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-gray-800 text-lg mb-4">Choose Profile</h3>
              <div className="space-y-2">
                {kids.map(k => (
                  <motion.button
                    key={k.id}
                    onClick={() => { switchKid(k.id); setShowProfilePicker(false); }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all min-h-[48px] ${
                      kid.id === k.id ? 'bg-teal-50 border-2 border-teal-400' : 'bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-2xl">{k.avatar}</span>
                    <div className="text-left flex-1">
                      <p className="font-bold text-gray-800">{k.name} <span className="text-xs text-gray-400">Age {k.age}</span></p>
                      <p className="text-xs text-teal-600">{k.veggiePoints} veggie points</p>
                    </div>
                    <p className="text-xs font-bold text-amber-600">Rs {k.walletBalance}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout modal */}
      <AnimatePresence>
        {checkoutMeal && (
          <CheckoutModal
            meal={checkoutMeal}
            kid={kid}
            isPreApproved={preApprovedMealIds.has(checkoutMeal.id)}
            isOverBudget={checkoutMeal.price > kid.walletBalance}
            isBlocked={isMealBlocked(checkoutMeal)}
            onConfirm={handleCheckoutConfirm}
            onRequestApproval={handleRequestApproval}
            onClose={() => setCheckoutMeal(null)}
          />
        )}
      </AnimatePresence>

      {/* Badge unlock modal */}
      <AnimatePresence>
        {showBadgeUnlock && (
          <BadgeUnlockModal kid={kid} onClose={() => setShowBadgeUnlock(false)} />
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 flex flex-col items-center gap-2 pointer-events-none" aria-live="polite">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="bg-gray-800 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 pointer-events-auto"
            >
              <Sparkles size={14} className="text-amber-400" />
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
