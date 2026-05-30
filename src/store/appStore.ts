import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KidProfile, Meal, ScheduleSlot, Order, AppNotification, DashboardRole } from '../types';
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

  placeOrder: (kidId: string, mealId: string, autoApproved: boolean) => string;
  approveOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  advanceDelivery: (orderId: string) => void;
  markDelivered: (orderId: string) => void;

  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

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

      placeOrder: (kidId, mealId, autoApproved) => {
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

      resetAllData: () => set({
        parentPin: '1234',
        isParentAuthenticated: false,
        pinAttempts: 0,
        pinLockoutUntil: 0,
        kids: DEFAULT_KIDS,
        meals: DEFAULT_MEALS,
        weeklyPlan: [],
        orders: [],
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
