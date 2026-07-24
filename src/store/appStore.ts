import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KidProfile, Meal, ScheduleSlot, Order, AppNotification, DashboardRole, AutoApproveRule, Reward, FamilyChallenge, RewardRedemption, MealRating, WeeklyPointChallenge, LeaderboardEntry } from '../types';
import { DEFAULT_KIDS, DEFAULT_MEALS } from '../types';

interface AppState {
  parentPin: string;
  isParentAuthenticated: boolean;
  pinAttempts: number;
  pinLockoutUntil: number;

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

  currentRole: DashboardRole;
  currentKidId: string;
  notifications: AppNotification[];

  // Actions
  authenticateParent: (pin: string) => boolean;
  logoutParent: () => void;
  switchRole: (role: DashboardRole) => void;
  switchKid: (kidId: string) => void;

  addKid: (kid: KidProfile) => void;
  updateKid: (kidId: string, updates: Partial<KidProfile>) => void;
  deleteKid: (kidId: string) => void;
  addFunds: (kidId: string, amount: number) => void;
  setAllowance: (kidId: string, daily: number, weekly: number) => void;
  toggleAllergy: (kidId: string, allergy: string) => void;
  toggleDietaryBlock: (kidId: string, block: string) => void;
  setVegMode: (kidId: string, mode: 'veg' | 'nonveg' | 'both') => void;

  addScheduleSlot: (slot: ScheduleSlot) => void;
  removeScheduleSlot: (day: string, mealType: string) => void;
  togglePreApproved: (day: string, mealType: string) => void;

  placeOrder: (kidId: string, mealId: string, autoApproved: boolean, kidNote?: string) => string;
  approveOrder: (orderId: string) => void;
  bulkApproveOrders: (orderIds: string[]) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  advanceDelivery: (orderId: string) => void;
  markDelivered: (orderId: string) => void;

  addAutoApproveRule: (rule: Omit<AutoApproveRule, 'id'>) => void;
  updateAutoApproveRule: (ruleId: string, updates: Partial<AutoApproveRule>) => void;
  removeAutoApproveRule: (ruleId: string) => void;

  addReward: (reward: Omit<Reward, 'id'>) => void;
  removeReward: (rewardId: string) => void;
  redeemReward: (kidId: string, rewardId: string) => boolean;

  addFamilyChallenge: (challenge: Omit<FamilyChallenge, 'id' | 'currentProgress' | 'completed'>) => void;
  updateChallengeProgress: (challengeId: string, kidId: string, increment: number) => void;
  removeFamilyChallenge: (challengeId: string) => void;

  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  rateMeal: (kidId: string, mealId: string, rating: MealRating['rating']) => void;

  setWeeklyPointChallenge: (targetPoints: number, bonusCredit: number) => void;
  resolveWeeklyChallenge: (winnerId: string) => void;
  clearWeeklyChallenge: () => void;

  resetAllData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      parentPin: '1234',
      isParentAuthenticated: false,
      pinAttempts: 0,
      pinLockoutUntil: 0,

      kids: DEFAULT_KIDS,
      meals: DEFAULT_MEALS,
      weeklyPlan: [],
      orders: [],
      autoApproveRules: [],
      rewards: [],
      familyChallenges: [],
      rewardRedemptions: [],
      mealRatings: [],
      weeklyPointChallenge: null,
      leaderboardHistory: [],

      currentRole: 'kid',
      currentKidId: 'kid_1',
      notifications: [],

      authenticateParent: (pin: string) => {
        const state = get();
        if (state.pinLockoutUntil > Date.now()) return false;
        if (pin === state.parentPin) {
          set({ isParentAuthenticated: true, pinAttempts: 0, pinLockoutUntil: 0 });
          return true;
        }
        const attempts = state.pinAttempts + 1;
        if (attempts >= 3) {
          set({ pinAttempts: 0, pinLockoutUntil: Date.now() + 30000 });
          return false;
        }
        set({ pinAttempts: attempts });
        return false;
      },

      logoutParent: () => set({ isParentAuthenticated: false }),
      switchRole: (role) => set({ currentRole: role }),
      switchKid: (kidId) => set({ currentKidId: kidId }),

      addKid: (kid) => set(s => ({ kids: [...s.kids, kid] })),
      updateKid: (kidId, updates) => set(s => ({
        kids: s.kids.map(k => k.id === kidId ? { ...k, ...updates } : k),
      })),
      deleteKid: (kidId) => set(s => ({ kids: s.kids.filter(k => k.id !== kidId) })),

      addFunds: (kidId, amount) => set(s => ({
        kids: s.kids.map(k => k.id === kidId ? { ...k, walletBalance: k.walletBalance + amount } : k),
      })),

      setAllowance: (kidId, daily, weekly) => set(s => ({
        kids: s.kids.map(k => k.id === kidId ? { ...k, dailyBudget: daily, weeklyBudget: weekly } : k),
      })),

      toggleAllergy: (kidId, allergy) => set(s => ({
        kids: s.kids.map(k => {
          if (k.id !== kidId) return k;
          const has = k.allergies.includes(allergy);
          return { ...k, allergies: has ? k.allergies.filter(a => a !== allergy) : [...k.allergies, allergy] };
        }),
      })),

      toggleDietaryBlock: (kidId, block) => set(s => ({
        kids: s.kids.map(k => {
          if (k.id !== kidId) return k;
          const has = k.dietaryBlocks.includes(block);
          return { ...k, dietaryBlocks: has ? k.dietaryBlocks.filter(b => b !== block) : [...k.dietaryBlocks, block] };
        }),
      })),

      setVegMode: (kidId, mode) => set(s => ({
        kids: s.kids.map(k => k.id === kidId ? { ...k, vegMode: mode } : k),
      })),

      addScheduleSlot: (slot) => set(s => {
        const filtered = s.weeklyPlan.filter(p => !(p.day === slot.day && p.mealType === slot.mealType));
        return { weeklyPlan: [...filtered, slot] };
      }),

      removeScheduleSlot: (day, mealType) => set(s => ({
        weeklyPlan: s.weeklyPlan.filter(p => !(p.day === day && p.mealType === mealType)),
      })),

      togglePreApproved: (day, mealType) => set(s => ({
        weeklyPlan: s.weeklyPlan.map(p =>
          p.day === day && p.mealType === mealType ? { ...p, isPreApproved: !p.isPreApproved } : p
        ),
      })),

      placeOrder: (kidId, mealId, autoApproved, kidNote) => {
        const state = get();
        const meal = state.meals.find(m => m.id === mealId);
        const kid = state.kids.find(k => k.id === kidId);
        if (!meal || !kid) return '';

        const orderId = generateId();
        const status = autoApproved ? 'Cooking' : 'Pending Approval';

        const deliveryStages = autoApproved
          ? [
              { stage: 'Cooking', time: Date.now(), completed: true },
              { stage: 'Packed', time: 0, completed: false },
              { stage: 'In Transit', time: 0, completed: false },
              { stage: 'Delivered', time: 0, completed: false },
            ]
          : [];

        const order: Order = {
          id: orderId,
          kidId,
          mealId,
          status,
          timestamp: Date.now(),
          price: meal.price,
          kidNote,
          deliveryStages,
        };

        if (autoApproved) {
          set(s => ({
            orders: [order, ...s.orders],
            kids: s.kids.map(k => {
              if (k.id !== kidId) return k;
              const newPoints = k.veggiePoints + meal.veggiePoints;
              const newTried = k.uniqueMealsTried.includes(mealId) ? k.uniqueMealsTried : [...k.uniqueMealsTried, mealId];
              const newUnderBudget = meal.price <= k.dailyBudget ? k.ordersUnderBudget + 1 : k.ordersUnderBudget;
              const newBrainPower = meal.tags.includes('Brain Power') ? k.brainPowerOrders + 1 : k.brainPowerOrders;
              return {
                ...k,
                walletBalance: Math.max(0, k.walletBalance - meal.price),
                veggiePoints: newPoints,
                uniqueMealsTried: newTried,
                ordersUnderBudget: newUnderBudget,
                brainPowerOrders: newBrainPower,
                lastOrderDate: new Date().toISOString().split('T')[0],
              };
            }),
          }));
          get().addNotification({
            type: 'approval',
            message: `Your ${meal.name} order is being prepared!`,
            kidId,
          });
          get().addNotification({
            type: 'points',
            message: `You earned ${meal.veggiePoints} Veggie Points!`,
            kidId,
          });
        } else {
          set(s => ({ orders: [order, ...s.orders] }));
          get().addNotification({
            type: 'approval',
            message: `Order for ${meal.name} sent to parent for approval`,
            kidId,
          });
        }

        return orderId;
      },

      approveOrder: (orderId) => {
        const state = get();
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        const meal = state.meals.find(m => m.id === order.mealId);
        if (!meal) return;

        set(s => ({
          orders: s.orders.map(o => o.id === orderId ? {
            ...o,
            status: 'Cooking',
            deliveryStages: [
              { stage: 'Cooking', time: Date.now(), completed: true },
              { stage: 'Packed', time: 0, completed: false },
              { stage: 'In Transit', time: 0, completed: false },
              { stage: 'Delivered', time: 0, completed: false },
            ],
          } : o),
          kids: s.kids.map(k => {
            if (k.id !== order.kidId) return k;
            const newPoints = k.veggiePoints + meal.veggiePoints;
            const newTried = k.uniqueMealsTried.includes(order.mealId) ? k.uniqueMealsTried : [...k.uniqueMealsTried, order.mealId];
            const newUnderBudget = meal.price <= k.dailyBudget ? k.ordersUnderBudget + 1 : k.ordersUnderBudget;
            const newBrainPower = meal.tags.includes('Brain Power') ? k.brainPowerOrders + 1 : k.brainPowerOrders;
            return {
              ...k,
              walletBalance: Math.max(0, k.walletBalance - meal.price),
              veggiePoints: newPoints,
              uniqueMealsTried: newTried,
              ordersUnderBudget: newUnderBudget,
              brainPowerOrders: newBrainPower,
              lastOrderDate: new Date().toISOString().split('T')[0],
            };
          }),
        }));

        get().addNotification({
          type: 'approval',
          message: `Mom approved your ${meal.name}!`,
          kidId: order.kidId,
        });
        get().addNotification({
          type: 'points',
          message: `You earned ${meal.veggiePoints} Veggie Points!`,
          kidId: order.kidId,
        });
      },

      bulkApproveOrders: (orderIds) => {
        orderIds.forEach(id => get().approveOrder(id));
      },

      rejectOrder: (orderId, reason) => {
        const state = get();
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        set(s => ({
          orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'Rejected', parentNote: reason } : o),
        }));

        get().addNotification({
          type: 'rejection',
          message: `Your order was returned. Reason: ${reason}`,
          kidId: order.kidId,
        });
      },

      advanceDelivery: (orderId) => set(s => ({
        orders: s.orders.map(o => {
          if (o.id !== orderId) return o;
          const stages = [...o.deliveryStages];
          const nextIdx = stages.findIndex(st => !st.completed);
          if (nextIdx === -1) return o;
          stages[nextIdx] = { ...stages[nextIdx], completed: true, time: Date.now() };
          const statusMap: Record<number, Order['status']> = {
            1: 'Cooking',
            2: 'In Transit',
            3: 'Delivered',
          };
          const newStatus = statusMap[nextIdx] ?? o.status;
          return { ...o, deliveryStages: stages, status: newStatus };
        }),
      })),

      markDelivered: (orderId) => {
        const state = get();
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        set(s => ({
          orders: s.orders.map(o => o.id === orderId ? {
            ...o,
            status: 'Delivered',
            deliveryStages: o.deliveryStages.map(st => ({ ...st, completed: true, time: st.time || Date.now() })),
          } : o),
        }));

        get().addNotification({
          type: 'delivery',
          message: `Your ${state.meals.find(m => m.id === order.mealId)?.name ?? 'meal'} has been delivered!`,
          kidId: order.kidId,
        });

        // Check badges
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
          set(s => ({
            kids: s.kids.map(k => k.id === order.kidId ? { ...k, badges: [...k.badges, ...newBadges] } : k),
          }));
          newBadges.forEach(b => {
            get().addNotification({
              type: 'badge',
              message: `Badge unlocked: ${b}!`,
              kidId: order.kidId,
            });
          });
        }
      },

      addAutoApproveRule: (rule) => set(s => ({
        autoApproveRules: [...s.autoApproveRules, { ...rule, id: generateId() }],
      })),

      updateAutoApproveRule: (ruleId, updates) => set(s => ({
        autoApproveRules: s.autoApproveRules.map(r => r.id === ruleId ? { ...r, ...updates } : r),
      })),

      removeAutoApproveRule: (ruleId) => set(s => ({
        autoApproveRules: s.autoApproveRules.filter(r => r.id !== ruleId),
      })),

      addReward: (reward) => set(s => ({
        rewards: [...s.rewards, { ...reward, id: generateId() }],
      })),

      removeReward: (rewardId) => set(s => ({
        rewards: s.rewards.filter(r => r.id !== rewardId),
      })),

      redeemReward: (kidId, rewardId) => {
        const state = get();
        const reward = state.rewards.find(r => r.id === rewardId);
        const kid = state.kids.find(k => k.id === kidId);
        if (!reward || !kid || kid.veggiePoints < reward.pointCost) return false;

        set(s => ({
          kids: s.kids.map(k => k.id === kidId ? { ...k, veggiePoints: k.veggiePoints - reward.pointCost } : k),
          rewardRedemptions: [...s.rewardRedemptions, {
            id: generateId(),
            kidId,
            rewardId,
            timestamp: Date.now(),
            pointsSpent: reward.pointCost,
          }],
        }));

        get().addNotification({
          type: 'badge',
          message: `${reward.emoji} You redeemed "${reward.name}"! Show this to Mom/Dad.`,
          kidId,
        });
        return true;
      },

      addFamilyChallenge: (challenge) => set(s => ({
        familyChallenges: [...s.familyChallenges, {
          ...challenge,
          id: generateId(),
          currentProgress: {},
          completed: false,
        }],
      })),

      updateChallengeProgress: (challengeId, kidId, increment) => set(s => ({
        familyChallenges: s.familyChallenges.map(c => {
          if (c.id !== challengeId || c.completed) return c;
          const prev = c.currentProgress[kidId] ?? 0;
          const next = prev + increment;
          const newProgress = { ...c.currentProgress, [kidId]: next };
          const totalProgress = Object.values(newProgress).reduce((sum, v) => sum + v, 0);
          return { ...c, currentProgress: newProgress, completed: totalProgress >= c.targetCount };
        }),
      })),

      removeFamilyChallenge: (challengeId) => set(s => ({
        familyChallenges: s.familyChallenges.filter(c => c.id !== challengeId),
      })),

      addNotification: (n) => set(s => ({
        notifications: [{
          ...n,
          id: generateId(),
          timestamp: Date.now(),
          read: false,
        }, ...s.notifications].slice(0, 50),
      })),

      markNotificationRead: (id) => set(s => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      })),

      markAllNotificationsRead: () => set(s => ({
        notifications: s.notifications.map(n => ({ ...n, read: true })),
      })),

      clearNotifications: () => set({ notifications: [] }),

      rateMeal: (kidId, mealId, rating) => set(s => {
        const existing = s.mealRatings.findIndex(r => r.kidId === kidId && r.mealId === mealId);
        const newRating: MealRating = { kidId, mealId, rating, timestamp: Date.now() };
        if (existing >= 0) {
          const updated = [...s.mealRatings];
          updated[existing] = newRating;
          return { mealRatings: updated };
        }
        return { mealRatings: [...s.mealRatings, newRating] };
      }),

      setWeeklyPointChallenge: (targetPoints, bonusCredit) => set({
        weeklyPointChallenge: {
          id: generateId(),
          targetPoints,
          bonusCredit,
          weekStart: Date.now(),
          winnerId: null,
          active: true,
        },
      }),

      resolveWeeklyChallenge: (winnerId) => {
        const state = get();
        const challenge = state.weeklyPointChallenge;
        if (!challenge || !challenge.active) return;
        const winner = state.kids.find(k => k.id === winnerId);
        if (!winner) return;

        const otherKids = state.kids.filter(k => k.id !== winnerId);
        const runnerUpPoints = Math.max(...otherKids.map(k => k.veggiePoints), 0);

        set(s => ({
          weeklyPointChallenge: { ...challenge, winnerId, active: false },
          kids: s.kids.map(k => k.id === winnerId ? { ...k, walletBalance: k.walletBalance + challenge.bonusCredit } : k),
          leaderboardHistory: [
            {
              weekStart: challenge.weekStart,
              winnerId,
              winnerName: winner.name,
              winnerPoints: winner.veggiePoints,
              runnerUpPoints,
            },
            ...s.leaderboardHistory,
          ].slice(0, 10),
        }));

        get().addNotification({
          type: 'badge',
          message: `${winner.name} won the weekly challenge! +Rs ${challenge.bonusCredit} bonus!`,
          kidId: winnerId,
        });
      },

      clearWeeklyChallenge: () => set({ weeklyPointChallenge: null }),

      resetAllData: () => set({
        parentPin: '1234',
        isParentAuthenticated: false,
        pinAttempts: 0,
        pinLockoutUntil: 0,
        kids: DEFAULT_KIDS,
        meals: DEFAULT_MEALS,
        weeklyPlan: [],
        orders: [],
        autoApproveRules: [],
        rewards: [],
        familyChallenges: [],
        rewardRedemptions: [],
        mealRatings: [],
        weeklyPointChallenge: null,
        leaderboardHistory: [],
        currentRole: 'kid',
        currentKidId: 'kid_1',
        notifications: [],
      }),
    }),
    {
      name: 'kideats-storage',
    }
  )
);
