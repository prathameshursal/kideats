import { supabase } from './supabase';
import * as m from './mappers';
import type {
  KidProfile, Meal, ScheduleSlot, Order, AutoApproveRule,
  Reward, FamilyChallenge, RewardRedemption, MealRating,
  WeeklyPointChallenge, LeaderboardEntry, AppNotification,
} from '../types';

export interface FamilyData {
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
  pin: string;
}

export async function loadFamilyData(): Promise<FamilyData> {
  const [mealsRes, kidsRes, scheduleRes, ordersRes, rewardsRes, redemptionsRes,
    challengesRes, rulesRes, ratingsRes, weeklyRes, leaderboardRes, notificationsRes, settingsRes] =
    await Promise.all([
      supabase.from('meals').select('*').order('name'),
      supabase.from('kid_profiles').select('*').order('created_at'),
      supabase.from('meal_schedule').select('*'),
      supabase.from('orders').select('*').order('timestamp', { ascending: false }),
      supabase.from('rewards').select('*').order('created_at'),
      supabase.from('reward_redemptions').select('*').order('timestamp', { ascending: false }),
      supabase.from('family_challenges').select('*').order('created_at'),
      supabase.from('auto_approve_rules').select('*').order('created_at'),
      supabase.from('meal_ratings').select('*'),
      supabase.from('weekly_point_challenges').select('*').eq('active', true).order('week_start', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('leaderboard_history').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('notifications').select('*').order('timestamp', { ascending: false }).limit(50),
      supabase.from('family_settings').select('*').maybeSingle(),
    ]);

  return {
    meals: (mealsRes.data ?? []).map(m.mapMeal),
    kids: (kidsRes.data ?? []).map(m.mapKid),
    weeklyPlan: (scheduleRes.data ?? []).map(m.mapSchedule),
    orders: (ordersRes.data ?? []).map(m.mapOrder),
    rewards: (rewardsRes.data ?? []).map(m.mapReward),
    rewardRedemptions: (redemptionsRes.data ?? []).map(m.mapRedemption),
    familyChallenges: (challengesRes.data ?? []).map(m.mapChallenge),
    autoApproveRules: (rulesRes.data ?? []).map(m.mapAutoApproveRule),
    mealRatings: (ratingsRes.data ?? []).map(m.mapMealRating),
    weeklyPointChallenge: weeklyRes.data ? m.mapWeeklyChallenge(weeklyRes.data) : null,
    leaderboardHistory: (leaderboardRes.data ?? []).map(m.mapLeaderboard),
    notifications: (notificationsRes.data ?? []).map(m.mapNotification),
    pin: settingsRes.data?.pin ?? '1234',
  };
}

export async function ensureFamilySettings(): Promise<void> {
  const { data } = await supabase.from('family_settings').select('id').maybeSingle();
  if (!data) {
    await supabase.from('family_settings').insert({ pin: '1234' });
  }
}
