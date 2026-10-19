import { create } from 'zustand';
import type {
  KidProfile, Meal, ScheduleSlot, Order, AutoApproveRule,
  Reward, FamilyChallenge, RewardRedemption, MealRating,
  WeeklyPointChallenge, LeaderboardEntry, AppNotification, DashboardRole,
} from '../types';
import { supabase } from '../lib/supabase';
import { loadFamilyData, ensureFamilySettings, type FamilyData } from '../lib/loaders';

interface AppState {
  // Auth/session
  isHydrated: boolean;
  isParentAuthenticated: boolean;
  familyPin: string;
  pinAttempts: number;
  pinLockoutUntil: number;

  // Data
  kids: KidProfile[];
  meals: Meal[];
  weeklyPlan: ScheduleSlot[];
  orders: Order[];
  autoApproveRules: AutoApproveRule[];
  rewards: Reward[];
  familyChallenges: FamilyChallenge[];
  rewardRedemptions: RewardRedemption[];
  mealRatings: MealRating[];
  weeklyPointChallenge: WeeklyPointChallenge | null;
  leaderboardHistory: LeaderboardEntry[];
  notifications: AppNotification[];

  // UI state
  currentRole: DashboardRole;
  currentKidId: string;

  // Actions
  hydrateFromDb: () => Promise<void>;
  setData: (data: FamilyData) => void;

  authenticateParent: (pin: string) => boolean;
  logoutParent: () => void;
  switchRole: (role: DashboardRole) => void;
  switchKid: (kidId: string) => void;

  addKid: (kid: KidProfile) => Promise<void>;
  updateKid: (kidId: string, updates: Partial<KidProfile>) => Promise<void>;
  deleteKid: (kidId: string) => Promise<void>;
  addFunds: (kidId: string, amount: number) => Promise<void>;
  setAllowance: (kidId: string, daily: number, weekly: number) => Promise<void>;
  toggleAllergy: (kidId: string, allergy: string) => Promise<void>;
  toggleDietaryBlock: (kidId: string, block: string) => Promise<void>;
  setVegMode: (kidId: string, mode: 'veg' | 'nonveg' | 'both') => Promise<void>;

  addScheduleSlot: (slot: ScheduleSlot) => Promise<void>;
  removeScheduleSlot: (day: string, mealType: string) => Promise<void>;
  togglePreApproved: (day: string, mealType: string) => Promise<void>;

  placeOrder: (kidId: string, mealId: string, autoApproved: boolean, kidNote?: string) => Promise<string>;
  approveOrder: (orderId: string) => Promise<void>;
  bulkApproveOrders: (orderIds: string[]) => Promise<void>;
  rejectOrder: (orderId: string, reason: string) => Promise<void>;
  advanceDelivery: (orderId: string) => Promise<void>;
  markDelivered: (orderId: string) => Promise<void>;

  addAutoApproveRule: (rule: Omit<AutoApproveRule, 'id'>) => Promise<void>;
  updateAutoApproveRule: (ruleId: string, updates: Partial<AutoApproveRule>) => Promise<void>;
  removeAutoApproveRule: (ruleId: string) => Promise<void>;

  addReward: (reward: Omit<Reward, 'id'>) => Promise<void>;
  removeReward: (rewardId: string) => Promise<void>;
  redeemReward: (kidId: string, rewardId: string) => Promise<boolean>;

  addFamilyChallenge: (challenge: Omit<FamilyChallenge, 'id' | 'currentProgress' | 'completed'>) => Promise<void>;
  updateChallengeProgress: (challengeId: string, kidId: string, increment: number) => Promise<void>;
  removeFamilyChallenge: (challengeId: string) => Promise<void>;

  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;

  rateMeal: (kidId: string, mealId: string, rating: MealRating['rating']) => Promise<void>;

  setWeeklyPointChallenge: (targetPoints: number, bonusCredit: number) => Promise<void>;
  resolveWeeklyChallenge: (winnerId: string) => Promise<void>;
  clearWeeklyChallenge: () => void;

  resetAllData: () => Promise<void>;
}

const now = () => Date.now();

export const useAppStore = create<AppState>()((set, get) => ({
  isHydrated: false,
  isParentAuthenticated: false,
  familyPin: '1234',
  pinAttempts: 0,
  pinLockoutUntil: 0,

  kids: [],
  meals: [],
  weeklyPlan: [],
  orders: [],
  autoApproveRules: [],
  rewards: [],
  familyChallenges: [],
  rewardRedemptions: [],
  mealRatings: [],
  weeklyPointChallenge: null,
  leaderboardHistory: [],
  notifications: [],

  currentRole: 'kid',
  currentKidId: '',

  hydrateFromDb: async () => {
    await ensureFamilySettings();
    const data = await loadFamilyData();
    set({
      meals: data.meals,
      kids: data.kids,
      weeklyPlan: data.weeklyPlan,
      orders: data.orders,
      autoApproveRules: data.autoApproveRules,
      rewards: data.rewards,
      familyChallenges: data.familyChallenges,
      rewardRedemptions: data.rewardRedemptions,
      mealRatings: data.mealRatings,
      weeklyPointChallenge: data.weeklyPointChallenge,
      leaderboardHistory: data.leaderboardHistory,
      notifications: data.notifications,
      currentKidId: data.kids[0]?.id ?? '',
      familyPin: data.pin,
      isHydrated: true,
    });
  },

  setData: (data) => set({ ...data }),

  authenticateParent: (pin) => {
    const state = get();
    if (state.pinLockoutUntil > now()) return false;
    if (pin === state.familyPin) {
      set({ isParentAuthenticated: true, pinAttempts: 0, pinLockoutUntil: 0 });
      return true;
    }
    const attempts = state.pinAttempts + 1;
    if (attempts >= 3) {
      set({ pinAttempts: 0, pinLockoutUntil: now() + 30000 });
      return false;
    }
    set({ pinAttempts: attempts });
    return false;
  },

  logoutParent: () => set({ isParentAuthenticated: false }),
  switchRole: (role) => set({ currentRole: role }),
  switchKid: (kidId) => set({ currentKidId: kidId }),

  addKid: async (kid) => {
    const { data, error } = await supabase.from('kid_profiles').insert({
      name: kid.name, age: kid.age, avatar: kid.avatar,
      daily_budget: kid.dailyBudget, weekly_spending_limit: kid.weeklyBudget,
      wallet_balance: kid.walletBalance, allergies: kid.allergies,
      dietary_restrictions: kid.dietaryBlocks, veggie_points: kid.veggiePoints,
      badges: kid.badges, current_streak: kid.currentStreak,
      orders_under_budget: kid.ordersUnderBudget, brain_power_orders: kid.brainPowerOrders,
      unique_meals_tried: kid.uniqueMealsTried, last_order_date: kid.lastOrderDate,
      veg_mode: kid.vegMode,
    }).select().single();
    if (error) return;
    set(s => ({
      kids: [...s.kids, { ...kid, id: data.id }],
      currentKidId: s.currentKidId || data.id,
    }));
  },

  updateKid: async (kidId, updates) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.dailyBudget !== undefined) dbUpdates.daily_budget = updates.dailyBudget;
    if (updates.weeklyBudget !== undefined) dbUpdates.weekly_spending_limit = updates.weeklyBudget;
    if (updates.walletBalance !== undefined) dbUpdates.wallet_balance = updates.walletBalance;
    if (updates.allergies !== undefined) dbUpdates.allergies = updates.allergies;
    if (updates.dietaryBlocks !== undefined) dbUpdates.dietary_restrictions = updates.dietaryBlocks;
    if (updates.veggiePoints !== undefined) dbUpdates.veggie_points = updates.veggiePoints;
    if (updates.badges !== undefined) dbUpdates.badges = updates.badges;
    if (updates.currentStreak !== undefined) dbUpdates.current_streak = updates.currentStreak;
    if (updates.ordersUnderBudget !== undefined) dbUpdates.orders_under_budget = updates.ordersUnderBudget;
    if (updates.brainPowerOrders !== undefined) dbUpdates.brain_power_orders = updates.brainPowerOrders;
    if (updates.uniqueMealsTried !== undefined) dbUpdates.unique_meals_tried = updates.uniqueMealsTried;
    if (updates.lastOrderDate !== undefined) dbUpdates.last_order_date = updates.lastOrderDate;
    if (updates.vegMode !== undefined) dbUpdates.veg_mode = updates.vegMode;

    await supabase.from('kid_profiles').update(dbUpdates).eq('id', kidId);
    set(s => ({ kids: s.kids.map(k => k.id === kidId ? { ...k, ...updates } : k) }));
  },

  deleteKid: async (kidId) => {
    await supabase.from('kid_profiles').delete().eq('id', kidId);
    set(s => ({
      kids: s.kids.filter(k => k.id !== kidId),
      currentKidId: s.currentKidId === kidId ? s.kids[0]?.id ?? '' : s.currentKidId,
    }));
  },

  addFunds: async (kidId, amount) => {
    const kid = get().kids.find(k => k.id === kidId);
    if (!kid) return;
    await supabase.from('kid_profiles').update({ wallet_balance: kid.walletBalance + amount }).eq('id', kidId);
    set(s => ({ kids: s.kids.map(k => k.id === kidId ? { ...k, walletBalance: k.walletBalance + amount } : k) }));
  },

  setAllowance: async (kidId, daily, weekly) => {
    await supabase.from('kid_profiles').update({ daily_budget: daily, weekly_spending_limit: weekly }).eq('id', kidId);
    set(s => ({ kids: s.kids.map(k => k.id === kidId ? { ...k, dailyBudget: daily, weeklyBudget: weekly } : k) }));
  },

  toggleAllergy: async (kidId, allergy) => {
    const kid = get().kids.find(k => k.id === kidId);
    if (!kid) return;
    const has = kid.allergies.includes(allergy);
    const allergies = has ? kid.allergies.filter(a => a !== allergy) : [...kid.allergies, allergy];
    await supabase.from('kid_profiles').update({ allergies }).eq('id', kidId);
    set(s => ({ kids: s.kids.map(k => k.id === kidId ? { ...k, allergies } : k) }));
  },

  toggleDietaryBlock: async (kidId, block) => {
    const kid = get().kids.find(k => k.id === kidId);
    if (!kid) return;
    const has = kid.dietaryBlocks.includes(block);
    const dietaryBlocks = has ? kid.dietaryBlocks.filter(b => b !== block) : [...kid.dietaryBlocks, block];
    await supabase.from('kid_profiles').update({ dietary_restrictions: dietaryBlocks }).eq('id', kidId);
    set(s => ({ kids: s.kids.map(k => k.id === kidId ? { ...k, dietaryBlocks } : k) }));
  },

  setVegMode: async (kidId, mode) => {
    await supabase.from('kid_profiles').update({ veg_mode: mode }).eq('id', kidId);
    set(s => ({ kids: s.kids.map(k => k.id === kidId ? { ...k, vegMode: mode } : k) }));
  },

  addScheduleSlot: async (slot) => {
    const existing = get().weeklyPlan.find(p => p.day === slot.day && p.mealType === slot.mealType);
    if (existing) {
      await supabase.from('meal_schedule').update({ meal_id: slot.mealId, is_pre_approved: slot.isPreApproved })
        .eq('day_of_week', slot.day).eq('meal_slot', slot.mealType);
    } else {
      await supabase.from('meal_schedule').insert({
        day_of_week: slot.day, meal_slot: slot.mealType, meal_id: slot.mealId,
        is_pre_approved: slot.isPreApproved, kid_profile_id: null,
      });
    }
    set(s => ({
      weeklyPlan: [
        ...s.weeklyPlan.filter(p => !(p.day === slot.day && p.mealType === slot.mealType)),
        slot,
      ],
    }));
  },

  removeScheduleSlot: async (day, mealType) => {
    await supabase.from('meal_schedule').delete().eq('day_of_week', day).eq('meal_slot', mealType);
    set(s => ({ weeklyPlan: s.weeklyPlan.filter(p => !(p.day === day && p.mealType === mealType)) }));
  },

  togglePreApproved: async (day, mealType) => {
    const slot = get().weeklyPlan.find(p => p.day === day && p.mealType === mealType);
    if (!slot) return;
    await supabase.from('meal_schedule').update({ is_pre_approved: !slot.isPreApproved })
      .eq('day_of_week', day).eq('meal_slot', mealType);
    set(s => ({
      weeklyPlan: s.weeklyPlan.map(p => p.day === day && p.mealType === mealType ? { ...p, isPreApproved: !p.isPreApproved } : p),
    }));
  },

  placeOrder: async (kidId, mealId, autoApproved, kidNote) => {
    const state = get();
    const meal = state.meals.find(m => m.id === mealId);
    const kid = state.kids.find(k => k.id === kidId);
    if (!meal || !kid) return '';

    const status = autoApproved ? 'Cooking' : 'Pending Approval';
    const deliveryStages = autoApproved
      ? [
          { stage: 'Cooking', time: now(), completed: true },
          { stage: 'Packed', time: 0, completed: false },
          { stage: 'In Transit', time: 0, completed: false },
          { stage: 'Delivered', time: 0, completed: false },
        ]
      : [];

    const { data, error } = await supabase.from('orders').insert({
      kid_profile_id: kidId, meal_id: mealId, status,
      timestamp: now(), price: meal.price, kid_note: kidNote ?? null,
      delivery_stages: deliveryStages, auto_approved: autoApproved,
    }).select().single();
    if (error) return '';
    const orderId = data.id;

    if (autoApproved) {
      await get().updateKid(kidId, {
        walletBalance: Math.max(0, kid.walletBalance - meal.price),
        veggiePoints: kid.veggiePoints + meal.veggiePoints,
        uniqueMealsTried: kid.uniqueMealsTried.includes(mealId) ? kid.uniqueMealsTried : [...kid.uniqueMealsTried, mealId],
        ordersUnderBudget: meal.price <= kid.dailyBudget ? kid.ordersUnderBudget + 1 : kid.ordersUnderBudget,
        brainPowerOrders: meal.tags.includes('Brain Power') ? kid.brainPowerOrders + 1 : kid.brainPowerOrders,
        lastOrderDate: new Date().toISOString().split('T')[0],
      });
    }

    const order: Order = {
      id: orderId, kidId, mealId, status, timestamp: now(),
      price: meal.price, kidNote, deliveryStages,
    };
    set(s => ({ orders: [order, ...s.orders] }));

    await get().addNotification({
      type: 'approval',
      message: autoApproved ? `Your ${meal.name} order is being prepared!` : `Order for ${meal.name} sent to parent for approval`,
      kidId,
    });
    if (autoApproved) {
      await get().addNotification({ type: 'points', message: `You earned ${meal.veggiePoints} Veggie Points!`, kidId });
    }
    return orderId;
  },

  approveOrder: async (orderId) => {
    const state = get();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    const meal = state.meals.find(m => m.id === order.mealId);
    const kid = state.kids.find(k => k.id === order.kidId);
    if (!meal || !kid) return;

    const deliveryStages = [
      { stage: 'Cooking', time: now(), completed: true },
      { stage: 'Packed', time: 0, completed: false },
      { stage: 'In Transit', time: 0, completed: false },
      { stage: 'Delivered', time: 0, completed: false },
    ];
    await supabase.from('orders').update({ status: 'Cooking', delivery_stages: deliveryStages }).eq('id', orderId);

    await get().updateKid(order.kidId, {
      walletBalance: Math.max(0, kid.walletBalance - meal.price),
      veggiePoints: kid.veggiePoints + meal.veggiePoints,
      uniqueMealsTried: kid.uniqueMealsTried.includes(order.mealId) ? kid.uniqueMealsTried : [...kid.uniqueMealsTried, order.mealId],
      ordersUnderBudget: meal.price <= kid.dailyBudget ? kid.ordersUnderBudget + 1 : kid.ordersUnderBudget,
      brainPowerOrders: meal.tags.includes('Brain Power') ? kid.brainPowerOrders + 1 : kid.brainPowerOrders,
      lastOrderDate: new Date().toISOString().split('T')[0],
    });

    set(s => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'Cooking', deliveryStages } : o) }));
    await get().addNotification({ type: 'approval', message: `Mom approved your ${meal.name}!`, kidId: order.kidId });
    await get().addNotification({ type: 'points', message: `You earned ${meal.veggiePoints} Veggie Points!`, kidId: order.kidId });
  },

  bulkApproveOrders: async (orderIds) => {
    for (const id of orderIds) await get().approveOrder(id);
  },

  rejectOrder: async (orderId, reason) => {
    await supabase.from('orders').update({ status: 'Rejected', parent_note: reason }).eq('id', orderId);
    const order = get().orders.find(o => o.id === orderId);
    set(s => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'Rejected', parentNote: reason } : o) }));
    if (order) await get().addNotification({ type: 'rejection', message: `Your order was returned. Reason: ${reason}`, kidId: order.kidId });
  },

  advanceDelivery: async (orderId) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;
    const stages = [...order.deliveryStages];
    const nextIdx = stages.findIndex(st => !st.completed);
    if (nextIdx === -1) return;
    stages[nextIdx] = { ...stages[nextIdx], completed: true, time: now() };
    const statusMap: Record<number, Order['status']> = { 1: 'Cooking', 2: 'In Transit', 3: 'Delivered' };
    const newStatus = statusMap[nextIdx] ?? order.status;
    await supabase.from('orders').update({ status: newStatus, delivery_stages: stages }).eq('id', orderId);
    set(s => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, deliveryStages: stages, status: newStatus } : o) }));
  },

  markDelivered: async (orderId) => {
    const state = get();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    const meal = state.meals.find(m => m.id === order.mealId);
    const stages = order.deliveryStages.map(st => ({ ...st, completed: true, time: st.time || now() }));
    await supabase.from('orders').update({ status: 'Delivered', delivery_stages: stages }).eq('id', orderId);
    set(s => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'Delivered', deliveryStages: stages } : o) }));

    await get().addNotification({ type: 'delivery', message: `Your ${meal?.name ?? 'meal'} has been delivered!`, kidId: order.kidId });

    const kid = get().kids.find(k => k.id === order.kidId);
    if (!kid) return;
    const newBadges: string[] = [];
    if (!kid.badges.includes('First Order')) newBadges.push('First Order');
    if (kid.veggiePoints >= 100 && !kid.badges.includes('Veggie Champion')) newBadges.push('Veggie Champion');
    if (kid.currentStreak >= 7 && !kid.badges.includes('Healthy Streak')) newBadges.push('Healthy Streak');
    if (kid.ordersUnderBudget >= 10 && !kid.badges.includes('Budget Master')) newBadges.push('Budget Master');
    if (kid.brainPowerOrders >= 5 && !kid.badges.includes('Salad Hero')) newBadges.push('Salad Hero');
    if (kid.uniqueMealsTried.length >= 6 && !kid.badges.includes('Explorer')) newBadges.push('Explorer');

    if (newBadges.length > 0) {
      await get().updateKid(order.kidId, { badges: [...kid.badges, ...newBadges] });
      for (const b of newBadges) {
        await get().addNotification({ type: 'badge', message: `Badge unlocked: ${b}!`, kidId: order.kidId });
      }
    }
  },

  addAutoApproveRule: async (rule) => {
    const { data, error } = await supabase.from('auto_approve_rules').insert({
      kid_id: rule.kidId, type: rule.type,
      budget_threshold: rule.budgetThreshold ?? null,
      whitelisted_meal_ids: rule.whitelistedMealIds ?? [],
      enabled: rule.enabled,
    }).select().single();
    if (error) return;
    set(s => ({ autoApproveRules: [...s.autoApproveRules, { ...rule, id: data.id }] }));
  },

  updateAutoApproveRule: async (ruleId, updates) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.budgetThreshold !== undefined) dbUpdates.budget_threshold = updates.budgetThreshold;
    if (updates.whitelistedMealIds !== undefined) dbUpdates.whitelisted_meal_ids = updates.whitelistedMealIds;
    if (updates.enabled !== undefined) dbUpdates.enabled = updates.enabled;
    if (Object.keys(dbUpdates).length > 0) await supabase.from('auto_approve_rules').update(dbUpdates).eq('id', ruleId);
    set(s => ({ autoApproveRules: s.autoApproveRules.map(r => r.id === ruleId ? { ...r, ...updates } : r) }));
  },

  removeAutoApproveRule: async (ruleId) => {
    await supabase.from('auto_approve_rules').delete().eq('id', ruleId);
    set(s => ({ autoApproveRules: s.autoApproveRules.filter(r => r.id !== ruleId) }));
  },

  addReward: async (reward) => {
    const { data, error } = await supabase.from('rewards').insert({
      name: reward.name, description: reward.description,
      point_cost: reward.pointCost, emoji: reward.emoji,
    }).select().single();
    if (error) return;
    set(s => ({ rewards: [...s.rewards, { ...reward, id: data.id }] }));
  },

  removeReward: async (rewardId) => {
    await supabase.from('rewards').delete().eq('id', rewardId);
    set(s => ({ rewards: s.rewards.filter(r => r.id !== rewardId) }));
  },

  redeemReward: async (kidId, rewardId) => {
    const state = get();
    const reward = state.rewards.find(r => r.id === rewardId);
    const kid = state.kids.find(k => k.id === kidId);
    if (!reward || !kid || kid.veggiePoints < reward.pointCost) return false;

    const { error } = await supabase.from('reward_redemptions').insert({
      kid_id: kidId, reward_id: rewardId, points_spent: reward.pointCost, timestamp: now(),
    });
    if (error) return false;

    await get().updateKid(kidId, { veggiePoints: kid.veggiePoints - reward.pointCost });

    set(s => ({
      rewardRedemptions: [{
        id: crypto.randomUUID(), kidId, rewardId, timestamp: now(), pointsSpent: reward.pointCost,
      }, ...s.rewardRedemptions],
    }));

    await get().addNotification({ type: 'badge', message: `${reward.emoji} You redeemed "${reward.name}"! Show this to Mom/Dad.`, kidId });
    return true;
  },

  addFamilyChallenge: async (challenge) => {
    const { data, error } = await supabase.from('family_challenges').insert({
      title: challenge.title, description: challenge.description,
      target_count: challenge.targetCount, reward_points: challenge.rewardPoints,
      deadline: challenge.deadline, type: challenge.type,
      current_progress: {}, completed: false,
    }).select().single();
    if (error) return;
    set(s => ({ familyChallenges: [...s.familyChallenges, {
      ...challenge, id: data.id, currentProgress: {}, completed: false,
    }] }));
  },

  updateChallengeProgress: async (challengeId, kidId, increment) => {
    const challenge = get().familyChallenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;
    const prev = challenge.currentProgress[kidId] ?? 0;
    const next = prev + increment;
    const newProgress = { ...challenge.currentProgress, [kidId]: next };
    const totalProgress = Object.values(newProgress).reduce((sum, v) => sum + v, 0);
    const completed = totalProgress >= challenge.targetCount;
    await supabase.from('family_challenges').update({ current_progress: newProgress, completed }).eq('id', challengeId);
    set(s => ({ familyChallenges: s.familyChallenges.map(c => c.id === challengeId ? { ...c, currentProgress: newProgress, completed } : c) }));
  },

  removeFamilyChallenge: async (challengeId) => {
    await supabase.from('family_challenges').delete().eq('id', challengeId);
    set(s => ({ familyChallenges: s.familyChallenges.filter(c => c.id !== challengeId) }));
  },

  addNotification: async (n) => {
    const { data, error } = await supabase.from('notifications').insert({
      message: n.message, type: n.type, read: false, timestamp: now(), kid_id: n.kidId ?? null,
    }).select().single();
    if (error) return;
    set(s => ({ notifications: [{ ...n, id: data.id, timestamp: now(), read: false }, ...s.notifications].slice(0, 50) }));
  },

  markNotificationRead: async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
  },

  markAllNotificationsRead: async () => {
    const ids = get().notifications.filter(n => !n.read).map(n => n.id);
    if (ids.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', ids);
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }));
  },

  clearNotifications: async () => {
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    set({ notifications: [] });
  },

  rateMeal: async (kidId, mealId, rating) => {
    const existing = get().mealRatings.find(r => r.kidId === kidId && r.mealId === mealId);
    if (existing) {
      await supabase.from('meal_ratings').update({ rating, timestamp: now() })
        .eq('kid_id', kidId).eq('meal_id', mealId);
    } else {
      await supabase.from('meal_ratings').insert({ kid_id: kidId, meal_id: mealId, rating, timestamp: now() });
    }
    set(s => {
      const idx = s.mealRatings.findIndex(r => r.kidId === kidId && r.mealId === mealId);
      const newRating: MealRating = { kidId, mealId, rating, timestamp: now() };
      if (idx >= 0) {
        const updated = [...s.mealRatings];
        updated[idx] = newRating;
        return { mealRatings: updated };
      }
      return { mealRatings: [...s.mealRatings, newRating] };
    });
  },

  setWeeklyPointChallenge: async (targetPoints, bonusCredit) => {
    await supabase.from('weekly_point_challenges').update({ active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    const { data, error } = await supabase.from('weekly_point_challenges').insert({
      target_points: targetPoints, bonus_credit: bonusCredit, week_start: now(), active: true,
    }).select().single();
    if (error) return;
    set({ weeklyPointChallenge: { id: data.id, targetPoints, bonusCredit, weekStart: now(), winnerId: null, active: true } });
  },

  resolveWeeklyChallenge: async (winnerId) => {
    const state = get();
    const challenge = state.weeklyPointChallenge;
    if (!challenge || !challenge.active) return;
    const winner = state.kids.find(k => k.id === winnerId);
    if (!winner) return;
    const otherKids = state.kids.filter(k => k.id !== winnerId);
    const runnerUpPoints = Math.max(...otherKids.map(k => k.veggiePoints), 0);

    await supabase.from('weekly_point_challenges').update({ active: false, winner_id: winnerId }).eq('id', challenge.id);
    await supabase.from('leaderboard_history').insert({
      week_start: challenge.weekStart, winner_id: winnerId, winner_name: winner.name,
      winner_points: winner.veggiePoints, runner_up_points: runnerUpPoints,
    });
    await get().updateKid(winnerId, { walletBalance: winner.walletBalance + challenge.bonusCredit });

    set({
      weeklyPointChallenge: { ...challenge, winnerId, active: false },
      leaderboardHistory: [
        { weekStart: challenge.weekStart, winnerId, winnerName: winner.name, winnerPoints: winner.veggiePoints, runnerUpPoints },
        ...state.leaderboardHistory,
      ].slice(0, 10),
    });

    await get().addNotification({ type: 'badge', message: `${winner.name} won the weekly challenge! +Rs ${challenge.bonusCredit} bonus!`, kidId: winnerId });
  },

  clearWeeklyChallenge: () => set({ weeklyPointChallenge: null }),

  resetAllData: async () => {
    const tables = ['orders', 'meal_schedule', 'meal_ratings', 'reward_redemptions', 'rewards',
      'family_challenges', 'auto_approve_rules', 'weekly_point_challenges', 'leaderboard_history',
      'notifications', 'kid_profiles'];
    for (const t of tables) {
      await supabase.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    set({
      kids: [], weeklyPlan: [], orders: [], autoApproveRules: [], rewards: [],
      familyChallenges: [], rewardRedemptions: [], mealRatings: [],
      weeklyPointChallenge: null, leaderboardHistory: [], notifications: [],
      currentKidId: '', isParentAuthenticated: false,
    });
  },
}));
