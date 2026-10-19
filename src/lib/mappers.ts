import type {
  KidProfile, Meal, ScheduleSlot, Order, AutoApproveRule,
  Reward, FamilyChallenge, RewardRedemption, MealRating,
  WeeklyPointChallenge, LeaderboardEntry, AppNotification,
} from '../types';

// ===== DB row types (snake_case from Supabase) =====

interface MealRow {
  id: string; name: string; price: number; prep_time: number; calories: number;
  veggie_points: number; tags: string[]; image_url: string; allergens: string[];
  category: string; is_kid_safe: boolean; is_veg: boolean;
  protein: string | null; carbs: string | null; fats: string | null;
}

interface KidRow {
  id: string; name: string; age: number; avatar: string;
  daily_budget: number; weekly_spending_limit: number; wallet_balance: number;
  allergies: string[]; dietary_restrictions: string[];
  veggie_points: number; badges: string[]; current_streak: number;
  orders_under_budget: number; brain_power_orders: number;
  unique_meals_tried: string[]; last_order_date: string | null; veg_mode: string;
}

interface ScheduleRow {
  id: string; kid_profile_id: string | null; meal_id: string;
  meal_slot: string; day_of_week: string | null; is_pre_approved: boolean;
}

interface OrderRow {
  id: string; kid_profile_id: string; meal_id: string; status: string;
  timestamp: number | null; price: number; parent_note: string | null;
  kid_note: string | null; delivery_stages: JsonDeliveryStage[];
}

interface JsonDeliveryStage { stage: string; time: number; completed: boolean }

// ===== Mappers: DB row → app type =====

export function mapMeal(r: MealRow): Meal {
  return {
    id: r.id, name: r.name, price: Number(r.price), prepTime: r.prep_time,
    calories: r.calories, veggiePoints: r.veggie_points, tags: r.tags ?? [],
    image: r.image_url, allergens: r.allergens ?? [],
    category: r.category as Meal['category'], isKidSafe: r.is_kid_safe,
    isVeg: r.is_veg, nutrition: { protein: r.protein ?? '', carbs: r.carbs ?? '', fats: r.fats ?? '' },
  };
}

export function mapKid(r: KidRow): KidProfile {
  return {
    id: r.id, name: r.name, age: r.age, avatar: r.avatar,
    dailyBudget: Number(r.daily_budget), weeklyBudget: Number(r.weekly_spending_limit),
    walletBalance: Number(r.wallet_balance), allergies: r.allergies ?? [],
    dietaryBlocks: r.dietary_restrictions ?? [], veggiePoints: r.veggie_points,
    badges: r.badges ?? [], currentStreak: r.current_streak,
    ordersUnderBudget: r.orders_under_budget, brainPowerOrders: r.brain_power_orders,
    uniqueMealsTried: r.unique_meals_tried ?? [],
    lastOrderDate: r.last_order_date, vegMode: r.veg_mode as KidProfile['vegMode'],
  };
}

export function mapSchedule(r: ScheduleRow): ScheduleSlot {
  return {
    day: r.day_of_week ?? '',
    mealType: r.meal_slot as ScheduleSlot['mealType'],
    mealId: r.meal_id, isPreApproved: r.is_pre_approved,
  };
}

export function mapOrder(r: OrderRow): Order {
  return {
    id: r.id, kidId: r.kid_profile_id, mealId: r.meal_id,
    status: r.status as Order['status'],
    timestamp: r.timestamp ?? Date.now(),
    price: Number(r.price),
    parentNote: r.parent_note ?? undefined,
    kidNote: r.kid_note ?? undefined,
    deliveryStages: (r.delivery_stages ?? []).map(s => ({
      stage: s.stage, time: s.time, completed: s.completed,
    })),
  };
}

export function mapReward(r: any): Reward {
  return { id: r.id, name: r.name, description: r.description, pointCost: r.point_cost, emoji: r.emoji, createdBy: 'parent' };
}

export function mapRedemption(r: any): RewardRedemption {
  return { id: r.id, kidId: r.kid_id, rewardId: r.reward_id, timestamp: r.timestamp, pointsSpent: r.points_spent };
}

export function mapChallenge(r: any): FamilyChallenge {
  return {
    id: r.id, title: r.title, description: r.description, targetCount: r.target_count,
    currentProgress: r.current_progress ?? {}, rewardPoints: r.reward_points,
    deadline: r.deadline, completed: r.completed, type: r.type as FamilyChallenge['type'],
  };
}

export function mapAutoApproveRule(r: any): AutoApproveRule {
  return {
    id: r.id, kidId: r.kid_id, type: r.type as AutoApproveRule['type'],
    budgetThreshold: r.budget_threshold != null ? Number(r.budget_threshold) : undefined,
    whitelistedMealIds: r.whitelisted_meal_ids ?? [], enabled: r.enabled,
  };
}

export function mapMealRating(r: any): MealRating {
  return { kidId: r.kid_id, mealId: r.meal_id, rating: r.rating as MealRating['rating'], timestamp: r.timestamp };
}

export function mapWeeklyChallenge(r: any): WeeklyPointChallenge {
  return { id: r.id, targetPoints: r.target_points, bonusCredit: Number(r.bonus_credit), weekStart: r.week_start, winnerId: r.winner_id, active: r.active };
}

export function mapLeaderboard(r: any): LeaderboardEntry {
  return { weekStart: r.week_start, winnerId: r.winner_id, winnerName: r.winner_name, winnerPoints: r.winner_points, runnerUpPoints: r.runner_up_points };
}

export function mapNotification(r: any): AppNotification {
  return { id: r.id, message: r.message, type: r.type as AppNotification['type'], read: r.read, timestamp: r.timestamp, kidId: r.kid_id ?? undefined };
}
