/*
# KidEats Full Schema — Auth, All App Tables, and Row-Level Security

## Overview
This migration extends the existing KidEats schema to support the full app
with authentication. It adds missing columns to existing tables, creates new
tables for all app features, enables row-level security scoped to each
signed-in family, and adds performance indexes.

## Changes to Existing Tables

### meals (shared menu — no parent_id)
- Added: is_kid_safe, is_veg, protein, carbs, fats
- This table is shared across all families; authenticated users can read but not write

### kid_profiles
- Added: current_streak, orders_under_budget, brain_power_orders, unique_meals_tried, last_order_date, veg_mode
- Set parent_id default to auth.uid() for automatic ownership on insert

### meal_schedule
- Added: day_of_week, parent_id
- Made kid_profile_id nullable (schedule is family-wide, not per-kid)

### orders
- Added: parent_id, timestamp, price, parent_note, kid_note, delivery_stages (jsonb), auto_approved

## New Tables
- rewards: parent-created rewards redeemable with veggie points
- reward_redemptions: records of rewards kids have redeemed
- family_challenges: family-wide challenges with per-kid progress
- auto_approve_rules: rules for auto-approving kid orders
- meal_ratings: kid ratings (love/meh/dislike) for meals
- weekly_point_challenges: weekly competition for most veggie points
- leaderboard_history: past weekly challenge winners
- notifications: in-app notifications
- family_settings: per-family settings (parent PIN)

## Security (RLS)
- meals: SELECT for authenticated (shared menu), no writes
- All family-specific tables: full CRUD scoped to parent_id = auth.uid()
- 4 separate policies per table (SELECT, INSERT, UPDATE, DELETE)

## Indexes
- Added indexes on parent_id for all family-specific tables
*/

-- ===== ALTER EXISTING TABLES =====

-- meals: add nutrition and dietary flags
ALTER TABLE meals ADD COLUMN IF NOT EXISTS is_kid_safe boolean DEFAULT true;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS is_veg boolean DEFAULT true;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS protein text;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS carbs text;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS fats text;

-- kid_profiles: add achievement tracking + set parent_id default
ALTER TABLE kid_profiles ALTER COLUMN parent_id SET DEFAULT auth.uid();
ALTER TABLE kid_profiles ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0;
ALTER TABLE kid_profiles ADD COLUMN IF NOT EXISTS orders_under_budget integer NOT NULL DEFAULT 0;
ALTER TABLE kid_profiles ADD COLUMN IF NOT EXISTS brain_power_orders integer NOT NULL DEFAULT 0;
ALTER TABLE kid_profiles ADD COLUMN IF NOT EXISTS unique_meals_tried text[] NOT NULL DEFAULT '{}';
ALTER TABLE kid_profiles ADD COLUMN IF NOT EXISTS last_order_date date;
ALTER TABLE kid_profiles ADD COLUMN IF NOT EXISTS veg_mode text NOT NULL DEFAULT 'both';

-- meal_schedule: add day_of_week and parent_id, allow nullable kid_profile_id
ALTER TABLE meal_schedule ADD COLUMN IF NOT EXISTS day_of_week text;
ALTER TABLE meal_schedule ADD COLUMN IF NOT EXISTS parent_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE meal_schedule ALTER COLUMN kid_profile_id DROP NOT NULL;

-- orders: add missing columns + parent_id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS parent_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS timestamp bigint;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS parent_note text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS kid_note text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_stages jsonb NOT NULL DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS auto_approved boolean NOT NULL DEFAULT false;

-- ===== CREATE NEW TABLES =====

CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  point_cost integer NOT NULL DEFAULT 0,
  emoji text NOT NULL DEFAULT '🎁',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  kid_id uuid NOT NULL REFERENCES kid_profiles(id) ON DELETE CASCADE,
  reward_id uuid REFERENCES rewards(id) ON DELETE SET NULL,
  points_spent integer NOT NULL DEFAULT 0,
  timestamp bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

CREATE TABLE IF NOT EXISTS family_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  target_count integer NOT NULL DEFAULT 1,
  current_progress jsonb NOT NULL DEFAULT '{}',
  reward_points integer NOT NULL DEFAULT 0,
  deadline bigint,
  completed boolean NOT NULL DEFAULT false,
  type text NOT NULL DEFAULT 'new_veggies',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auto_approve_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  kid_id uuid NOT NULL REFERENCES kid_profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'budget_threshold',
  budget_threshold numeric,
  whitelisted_meal_ids text[] NOT NULL DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  kid_id uuid NOT NULL REFERENCES kid_profiles(id) ON DELETE CASCADE,
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  rating text NOT NULL DEFAULT 'meh',
  timestamp bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

CREATE TABLE IF NOT EXISTS weekly_point_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  target_points integer NOT NULL DEFAULT 100,
  bonus_credit numeric NOT NULL DEFAULT 0,
  week_start bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
  winner_id uuid REFERENCES kid_profiles(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS leaderboard_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start bigint NOT NULL,
  winner_id uuid,
  winner_name text,
  winner_points integer NOT NULL DEFAULT 0,
  runner_up_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'approval',
  read boolean NOT NULL DEFAULT false,
  timestamp bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
  kid_id uuid REFERENCES kid_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS family_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  pin text NOT NULL DEFAULT '1234',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== DROP ALL EXISTING POLICIES =====

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ===== ENABLE RLS ON ALL TABLES =====

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_approve_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_point_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_settings ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- meals: shared menu, read-only for authenticated users
CREATE POLICY "meals_select" ON meals FOR SELECT TO authenticated USING (true);

-- kid_profiles: owner-scoped CRUD
CREATE POLICY "kids_select" ON kid_profiles FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "kids_insert" ON kid_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "kids_update" ON kid_profiles FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "kids_delete" ON kid_profiles FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- meal_schedule: owner-scoped CRUD
CREATE POLICY "schedule_select" ON meal_schedule FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "schedule_insert" ON meal_schedule FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "schedule_update" ON meal_schedule FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "schedule_delete" ON meal_schedule FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- orders: owner-scoped CRUD
CREATE POLICY "orders_select" ON orders FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "orders_insert" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "orders_update" ON orders FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "orders_delete" ON orders FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- rewards: owner-scoped CRUD
CREATE POLICY "rewards_select" ON rewards FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "rewards_insert" ON rewards FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "rewards_update" ON rewards FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "rewards_delete" ON rewards FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- reward_redemptions: owner-scoped CRUD
CREATE POLICY "redemptions_select" ON reward_redemptions FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "redemptions_insert" ON reward_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "redemptions_update" ON reward_redemptions FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "redemptions_delete" ON reward_redemptions FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- family_challenges: owner-scoped CRUD
CREATE POLICY "challenges_select" ON family_challenges FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "challenges_insert" ON family_challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "challenges_update" ON family_challenges FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "challenges_delete" ON family_challenges FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- auto_approve_rules: owner-scoped CRUD
CREATE POLICY "rules_select" ON auto_approve_rules FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "rules_insert" ON auto_approve_rules FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "rules_update" ON auto_approve_rules FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "rules_delete" ON auto_approve_rules FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- meal_ratings: owner-scoped CRUD
CREATE POLICY "ratings_select" ON meal_ratings FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "ratings_insert" ON meal_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "ratings_update" ON meal_ratings FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "ratings_delete" ON meal_ratings FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- weekly_point_challenges: owner-scoped CRUD
CREATE POLICY "weekly_select" ON weekly_point_challenges FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "weekly_insert" ON weekly_point_challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "weekly_update" ON weekly_point_challenges FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "weekly_delete" ON weekly_point_challenges FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- leaderboard_history: owner-scoped CRUD
CREATE POLICY "leaderboard_select" ON leaderboard_history FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "leaderboard_insert" ON leaderboard_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "leaderboard_update" ON leaderboard_history FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "leaderboard_delete" ON leaderboard_history FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- notifications: owner-scoped CRUD
CREATE POLICY "notifications_select" ON notifications FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "notifications_delete" ON notifications FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- family_settings: owner-scoped CRUD
CREATE POLICY "settings_select" ON family_settings FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "settings_insert" ON family_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "settings_update" ON family_settings FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "settings_delete" ON family_settings FOR DELETE TO authenticated USING (auth.uid() = parent_id);

-- ===== INDEXES =====

CREATE INDEX IF NOT EXISTS idx_kid_profiles_parent ON kid_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_meal_schedule_parent ON meal_schedule(parent_id);
CREATE INDEX IF NOT EXISTS idx_orders_parent ON orders(parent_id);
CREATE INDEX IF NOT EXISTS idx_orders_kid ON orders(kid_profile_id);
CREATE INDEX IF NOT EXISTS idx_rewards_parent ON rewards(parent_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_parent ON reward_redemptions(parent_id);
CREATE INDEX IF NOT EXISTS idx_family_challenges_parent ON family_challenges(parent_id);
CREATE INDEX IF NOT EXISTS idx_auto_approve_rules_parent ON auto_approve_rules(parent_id);
CREATE INDEX IF NOT EXISTS idx_meal_ratings_parent ON meal_ratings(parent_id);
CREATE INDEX IF NOT EXISTS idx_weekly_point_challenges_parent ON weekly_point_challenges(parent_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_parent ON leaderboard_history(parent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_parent ON notifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_family_settings_parent ON family_settings(parent_id);
