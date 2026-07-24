export interface KidProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  dailyBudget: number;
  weeklyBudget: number;
  walletBalance: number;
  allergies: string[];
  dietaryBlocks: string[];
  veggiePoints: number;
  badges: string[];
  currentStreak: number;
  ordersUnderBudget: number;
  brainPowerOrders: number;
  uniqueMealsTried: string[];
  lastOrderDate: string | null;
  vegMode: 'veg' | 'nonveg' | 'both';
}

export interface MealNutrition {
  protein: string;
  carbs: string;
  fats: string;
}

export interface Meal {
  id: string;
  name: string;
  price: number;
  prepTime: number;
  calories: number;
  veggiePoints: number;
  tags: string[];
  image: string;
  allergens: string[];
  category: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  isKidSafe: boolean;
  isVeg: boolean;
  nutrition: MealNutrition;
}

export interface ScheduleSlot {
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snack';
  mealId: string;
  isPreApproved: boolean;
}

export interface DeliveryStage {
  stage: string;
  time: number;
  completed: boolean;
}

export interface Order {
  id: string;
  kidId: string;
  mealId: string;
  status: 'Pending Approval' | 'Cooking' | 'In Transit' | 'Delivered' | 'Rejected';
  timestamp: number;
  price: number;
  parentNote?: string;
  kidNote?: string;
  deliveryStages: DeliveryStage[];
}

export interface AutoApproveRule {
  id: string;
  kidId: string;
  type: 'budget_threshold' | 'meal_whitelist';
  budgetThreshold?: number;
  whitelistedMealIds?: string[];
  enabled: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  emoji: string;
  createdBy: 'parent';
}

export interface FamilyChallenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentProgress: Record<string, number>;
  rewardPoints: number;
  deadline: number;
  completed: boolean;
  type: 'new_veggies' | 'streak' | 'budget' | 'variety';
}

export interface RewardRedemption {
  id: string;
  kidId: string;
  rewardId: string;
  timestamp: number;
  pointsSpent: number;
}

export interface MealRating {
  kidId: string;
  mealId: string;
  rating: 'love' | 'meh' | 'dislike';
  timestamp: number;
}

export interface WeeklyPointChallenge {
  id: string;
  targetPoints: number;
  bonusCredit: number;
  weekStart: number;
  winnerId: string | null;
  active: boolean;
}

export interface LeaderboardEntry {
  weekStart: number;
  winnerId: string;
  winnerName: string;
  winnerPoints: number;
  runnerUpPoints: number;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'approval' | 'rejection' | 'delivery' | 'points' | 'badge';
  read: boolean;
  timestamp: number;
  kidId?: string;
}

export type DashboardRole = 'parent' | 'kid';

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'First Order', name: 'First Order', icon: '🎯', description: 'Place your very first order', color: 'from-amber-400 to-orange-400' },
  { id: 'Veggie Champion', name: 'Veggie Champion', icon: '🥦', description: 'Earn 100 veggie points', color: 'from-emerald-400 to-teal-400' },
  { id: 'Healthy Streak', name: 'Healthy Streak', icon: '🔥', description: '7 consecutive days with orders', color: 'from-red-400 to-rose-400' },
  { id: 'Budget Master', name: 'Budget Master', icon: '💰', description: '10 orders under budget', color: 'from-blue-400 to-cyan-400' },
  { id: 'Salad Hero', name: 'Salad Hero', icon: '🥗', description: 'Order 5 Brain Power meals', color: 'from-green-400 to-emerald-400' },
  { id: 'Explorer', name: 'Explorer', icon: '🗺️', description: 'Try all meal categories on the menu', color: 'from-purple-400 to-pink-400' },
];

export const TAG_META: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  'Boost My Energy': { label: 'Boost My Energy', emoji: '⚡', color: 'text-yellow-600', bg: 'bg-gradient-to-r from-yellow-400 to-orange-400' },
  'Brain Power': { label: 'Brain Power', emoji: '🧠', color: 'text-blue-600', bg: 'bg-gradient-to-r from-blue-400 to-cyan-400' },
  'Post-Sports Snacks': { label: 'Post-Sports Snacks', emoji: '🏃', color: 'text-green-600', bg: 'bg-gradient-to-r from-green-400 to-emerald-400' },
  'Sweet but Healthy': { label: 'Sweet but Healthy', emoji: '🍯', color: 'text-pink-600', bg: 'bg-gradient-to-r from-pink-400 to-rose-400' },
  'Rice & Bowl': { label: 'Rice & Bowl', emoji: '🍚', color: 'text-amber-700', bg: 'bg-gradient-to-r from-amber-500 to-yellow-500' },
  'Wraps & Rolls': { label: 'Wraps & Rolls', emoji: '🌯', color: 'text-orange-700', bg: 'bg-gradient-to-r from-orange-500 to-red-400' },
  'Breakfast Tiffin': { label: 'Breakfast Tiffin', emoji: '🫓', color: 'text-teal-700', bg: 'bg-gradient-to-r from-teal-400 to-cyan-500' },
  'Cold Salad': { label: 'Cold Salad', emoji: '🥗', color: 'text-lime-700', bg: 'bg-gradient-to-r from-lime-400 to-green-400' },
};

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MEAL_SLOTS: ('Breakfast' | 'Lunch' | 'Snack')[] = ['Breakfast', 'Lunch', 'Snack'];

export const DEFAULT_KIDS: KidProfile[] = [
  {
    id: 'kid_1', name: 'Aarav', age: 8, avatar: '🦸',
    dailyBudget: 200, weeklyBudget: 1400, walletBalance: 200,
    allergies: ['Nuts'], dietaryBlocks: ['High Sugar'],
    veggiePoints: 120, badges: ['First Order'], currentStreak: 3,
    ordersUnderBudget: 4, brainPowerOrders: 1,
    uniqueMealsTried: ['m1', 'm3'], lastOrderDate: null,
    vegMode: 'both',
  },
  {
    id: 'kid_2', name: 'Riya', age: 14, avatar: '🧜‍♀️',
    dailyBudget: 350, weeklyBudget: 2450, walletBalance: 350,
    allergies: ['Gluten'], dietaryBlocks: ['Deep Fried'],
    veggiePoints: 280, badges: ['First Order', 'Veggie Champion'], currentStreak: 7,
    ordersUnderBudget: 8, brainPowerOrders: 3,
    uniqueMealsTried: ['m1', 'm2', 'm3', 'm5'], lastOrderDate: null,
    vegMode: 'veg',
  },
];

// Pexels image URLs matched to each dish
const IMG = {
  sproutWrap: 'https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg?auto=compress&cs=tinysrgb&w=400',
  paneerBowl: 'https://images.pexels.com/photos/9797029/pexels-photo-9797029.jpeg?auto=compress&cs=tinysrgb&w=400',
  berrySmoothie: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg?auto=compress&cs=tinysrgb&w=400',
  wheatPizza: 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=400',
  veggieBento: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  oatBalls: 'https://images.pexels.com/photos/3338681/pexels-photo-3338681.jpeg?auto=compress&cs=tinysrgb&w=400',
  rajmaRice: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400',
  paneerTikka: 'https://images.pexels.com/photos/9797031/pexels-photo-9797031.jpeg?auto=compress&cs=tinysrgb&w=400',
  chanaChaat: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400',
  soyaPulao: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400',
  eggBhurji: 'https://images.pexels.com/photos/6941010/pexels-photo-6941010.jpeg?auto=compress&cs=tinysrgb&w=400',
  chickenKhichdi: 'https://images.pexels.com/photos/7353381/pexels-photo-7353381.jpeg?auto=compress&cs=tinysrgb&w=400',
  palakPulao: 'https://images.pexels.com/photos/12737919/pexels-photo-12737919.jpeg?auto=compress&cs=tinysrgb&w=400',
  chickenRice: 'https://images.pexels.com/photos/5836649/pexels-photo-5836649.jpeg?auto=compress&cs=tinysrgb&w=400',
  choleBowl: 'https://images.pexels.com/photos/8992923/pexels-photo-8992923.jpeg?auto=compress&cs=tinysrgb&w=400',
  sproutsChaat: 'https://images.pexels.com/photos/8992921/pexels-photo-8992921.jpeg?auto=compress&cs=tinysrgb&w=400',
  kathiRoll: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400',
  thepla: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
  kebabWrap: 'https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg?auto=compress&cs=tinysrgb&w=400',
  frankie: 'https://images.pexels.com/photos/2955820/pexels-photo-2955820.jpeg?auto=compress&cs=tinysrgb&w=400',
  quesadilla: 'https://images.pexels.com/photos/6605961/pexels-photo-6605961.jpeg?auto=compress&cs=tinysrgb&w=400',
  rotiRoll: 'https://images.pexels.com/photos/7625261/pexels-photo-7625261.jpeg?auto=compress&cs=tinysrgb&w=400',
  chilla: 'https://images.pexels.com/photos/4331491/pexels-photo-4331491.jpeg?auto=compress&cs=tinysrgb&w=400',
  upma: 'https://images.pexels.com/photos/7625067/pexels-photo-7625067.jpeg?auto=compress&cs=tinysrgb&w=400',
  poha: 'https://images.pexels.com/photos/7625068/pexels-photo-7625068.jpeg?auto=compress&cs=tinysrgb&w=400',
  idli: 'https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400',
  daliyaPulao: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400',
  uttapam: 'https://images.pexels.com/photos/4331490/pexels-photo-4331490.jpeg?auto=compress&cs=tinysrgb&w=400',
  chanaSalad: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400',
  sweetPotatoChaat: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400',
  cucumberSalad: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
};

export const DEFAULT_MEALS: Meal[] = [
  // === ORIGINAL 6 ===
  { id: 'm1', name: 'Superman Sprout Wraps', price: 120, prepTime: 15, calories: 280, veggiePoints: 30, tags: ['Boost My Energy', 'Wraps & Rolls'], image: IMG.sproutWrap, allergens: [], category: 'Lunch', isKidSafe: true, isVeg: true, nutrition: { protein: '12g', carbs: '35g', fats: '8g' } },
  { id: 'm2', name: 'Power-Up Paneer Bowl', price: 180, prepTime: 20, calories: 350, veggiePoints: 45, tags: ['Brain Power', 'Rice & Bowl'], image: IMG.paneerBowl, allergens: ['Gluten'], category: 'Lunch', isKidSafe: true, isVeg: true, nutrition: { protein: '18g', carbs: '40g', fats: '12g' } },
  { id: 'm3', name: 'Smart Berry Smoothie', price: 80, prepTime: 5, calories: 150, veggiePoints: 25, tags: ['Brain Power', 'Sweet but Healthy'], image: IMG.berrySmoothie, allergens: [], category: 'Breakfast', isKidSafe: true, isVeg: true, nutrition: { protein: '4g', carbs: '30g', fats: '2g' } },
  { id: 'm4', name: 'Whole Wheat Dino Pizzas', price: 150, prepTime: 25, calories: 320, veggiePoints: 35, tags: ['Boost My Energy'], image: IMG.wheatPizza, allergens: ['Gluten'], category: 'Snack', isKidSafe: true, isVeg: true, nutrition: { protein: '14g', carbs: '42g', fats: '10g' } },
  { id: 'm5', name: 'Rainbow Veggie Bento', price: 200, prepTime: 18, calories: 300, veggiePoints: 50, tags: ['Post-Sports Snacks', 'Rice & Bowl'], image: IMG.veggieBento, allergens: [], category: 'Lunch', isKidSafe: true, isVeg: true, nutrition: { protein: '10g', carbs: '45g', fats: '6g' } },
  { id: 'm6', name: 'Energy Oat Balls', price: 60, prepTime: 10, calories: 180, veggiePoints: 20, tags: ['Post-Sports Snacks', 'Sweet but Healthy'], image: IMG.oatBalls, allergens: ['Nuts'], category: 'Snack', isKidSafe: true, isVeg: true, nutrition: { protein: '6g', carbs: '25g', fats: '7g' } },

  // === RICE & BOWL MEALS ===
  { id: 'm7', name: 'Rajma Masala Brown Rice Bowl', price: 150, prepTime: 20, calories: 340, veggiePoints: 40, tags: ['Rice & Bowl', 'Brain Power'], image: IMG.rajmaRice, allergens: [], category: 'Lunch', isKidSafe: true, isVeg: true, nutrition: { protein: '14g', carbs: '48g', fats: '8g' } },
  { id: 'm8', name: 'Paneer Tikka Jeera Rice Bowl', price: 190, prepTime: 22, calories: 380, veggiePoints: 45, tags: ['Rice & Bowl', 'Boost My Energy'], image: IMG.paneerTikka, allergens: ['Gluten'], category: 'Lunch', isKidSafe: true, isVeg: true, nutrition: { protein: '20g', carbs: '42g', fats: '14g' } },
  { id: 'm9', name: 'Desi Chana Chaat Protein Bowl', price: 130, prepTime: 15, calories: 290, veggiePoints: 35, tags: ['Rice & Bowl', 'Post-Sports Snacks'], image: IMG.chanaChaat, allergens: [], category: 'Lunch', isKidSafe: true, isVeg: true, nutrition: { protein: '12g', carbs: '38g', fats: '9g' } },
  { id: 'm10', name: 'Soya Keema & Peas Pulao Bowl', price: 160, prepTime: 25, calories: 330, veggiePoints: 38, tags: ['Rice & Bowl', 'Boost My Energy'], image: IMG.soyaPulao, allergens: [], category: 'Lunch', isKidSafe: true, isVeg: true, nutrition: { protein: '16g', carbs: '44g', fats: '10g' } },
  { id: 'm11', name: 'Egg Bhurji Veggie Fried Rice Bowl', price: 170, prepTime: 18, calories: 360, veggiePoints: 30, tags: ['Rice & Bowl', 'Boost My Energy'], image: IMG.eggBhurji, allergens: ['Eggs'], category: 'Lunch', isKidSafe: true, isVeg: false, nutrition: { protein: '18g', carbs: '40g', fats: '14g' } },
  { id: 'm12', name: 'Methi Chicken & Millet Khichdi Bowl', price: 210, prepTime: 30, calories: 350, veggiePoints: 25, tags: ['Rice & Bowl', 'Brain Power'], image: IMG.chickenKhichdi, allergens: [], category: 'Dinner', isKidSafe: true, isVeg: false, nutrition: { protein: '22g', carbs: '38g', fats: '12g' } },
  { id: 'm13', name: 'Palak Corn & Paneer Pulao Bowl', price: 175, prepTime: 22, calories: 310, veggiePoints: 42, tags: ['Rice & Bowl', 'Brain Power'], image: IMG.palakPulao, allergens: [], category: 'Lunch', isKidSafe: true, isVeg: true, nutrition: { protein: '15g', carbs: '42g', fats: '9g' } },
  { id: 'm14', name: 'Lemon Coriander Chicken Rice Bowl', price: 220, prepTime: 25, calories: 370, veggiePoints: 22, tags: ['Rice & Bowl', 'Boost My Energy'], image: IMG.chickenRice, allergens: [], category: 'Dinner', isKidSafe: true, isVeg: false, nutrition: { protein: '24g', carbs: '40g', fats: '11g' } },
  { id: 'm15', name: 'Chole Chickpea & Quinoa Bowl', price: 165, prepTime: 20, calories: 320, veggiePoints: 44, tags: ['Rice & Bowl', 'Post-Sports Snacks'], image: IMG.choleBowl, allergens: [], category: 'Lunch', isKidSafe: true, isVeg: true, nutrition: { protein: '16g', carbs: '44g', fats: '8g' } },
  { id: 'm16', name: 'Sprouts Moong & Peanut Chaat Bowl', price: 110, prepTime: 10, calories: 240, veggiePoints: 35, tags: ['Rice & Bowl', 'Cold Salad', 'Post-Sports Snacks'], image: IMG.sproutsChaat, allergens: ['Nuts'], category: 'Snack', isKidSafe: true, isVeg: true, nutrition: { protein: '12g', carbs: '30g', fats: '8g' } },

  // === WRAPS, ROLLS & PARATHAS ===
  { id: 'm17', name: 'Paneer Bhurji Whole Wheat Kathi Roll', price: 140, prepTime: 15, calories: 300, veggiePoints: 35, tags: ['Wraps & Rolls', 'Boost My Energy'], image: IMG.kathiRoll, allergens: ['Gluten'], category: 'Lunch', isKidSafe: true, isVeg: true, nutrition: { protein: '14g', carbs: '36g', fats: '12g' } },
  { id: 'm18', name: 'Aloo Methi Thepla Roll with Curd Dip', price: 100, prepTime: 12, calories: 260, veggiePoints: 28, tags: ['Wraps & Rolls', 'Breakfast Tiffin'], image: IMG.thepla, allergens: ['Gluten', 'Dairy'], category: 'Breakfast', isKidSafe: true, isVeg: true, nutrition: { protein: '8g', carbs: '38g', fats: '10g' } },
  { id: 'm19', name: 'Chicken Seekh Kebab Whole Wheat Wrap', price: 185, prepTime: 20, calories: 360, veggiePoints: 20, tags: ['Wraps & Rolls', 'Boost My Energy'], image: IMG.kebabWrap, allergens: ['Gluten'], category: 'Lunch', isKidSafe: true, isVeg: false, nutrition: { protein: '22g', carbs: '34g', fats: '14g' } },
  { id: 'm20', name: 'Masala Oats Veggie Frankie', price: 95, prepTime: 10, calories: 250, veggiePoints: 30, tags: ['Wraps & Rolls', 'Brain Power'], image: IMG.frankie, allergens: ['Gluten'], category: 'Snack', isKidSafe: true, isVeg: true, nutrition: { protein: '10g', carbs: '36g', fats: '8g' } },
  { id: 'm21', name: 'Rajma-Corn Whole Wheat Quesadilla Roll', price: 135, prepTime: 15, calories: 290, veggiePoints: 32, tags: ['Wraps & Rolls', 'Boost My Energy'], image: IMG.quesadilla, allergens: ['Gluten', 'Dairy'], category: 'Snack', isKidSafe: true, isVeg: true, nutrition: { protein: '12g', carbs: '38g', fats: '10g' } },
  { id: 'm22', name: 'Mixed Sprouts Green Chutney Stuffed Roti Roll', price: 105, prepTime: 12, calories: 240, veggiePoints: 34, tags: ['Wraps & Rolls', 'Post-Sports Snacks'], image: IMG.rotiRoll, allergens: ['Gluten'], category: 'Snack', isKidSafe: true, isVeg: true, nutrition: { protein: '10g', carbs: '34g', fats: '7g' } },
  { id: 'm23', name: 'Moong Dal Chilla with Paneer Stuffing', price: 120, prepTime: 15, calories: 270, veggiePoints: 36, tags: ['Wraps & Rolls', 'Breakfast Tiffin', 'Brain Power'], image: IMG.chilla, allergens: ['Dairy'], category: 'Breakfast', isKidSafe: true, isVeg: true, nutrition: { protein: '14g', carbs: '30g', fats: '9g' } },

  // === BREAKFAST-STYLE TIFFIN ===
  { id: 'm24', name: 'Veggie Rava Upma with Coconut Chutney', price: 90, prepTime: 15, calories: 260, veggiePoints: 25, tags: ['Breakfast Tiffin', 'Brain Power'], image: IMG.upma, allergens: ['Gluten'], category: 'Breakfast', isKidSafe: true, isVeg: true, nutrition: { protein: '8g', carbs: '40g', fats: '8g' } },
  { id: 'm25', name: 'Poha Power Bowl', price: 85, prepTime: 10, calories: 240, veggiePoints: 28, tags: ['Breakfast Tiffin', 'Boost My Energy'], image: IMG.poha, allergens: ['Nuts'], category: 'Breakfast', isKidSafe: true, isVeg: true, nutrition: { protein: '8g', carbs: '38g', fats: '7g' } },
  { id: 'm26', name: 'Mini Masala Idli Stir-Fry Bowl', price: 95, prepTime: 12, calories: 230, veggiePoints: 26, tags: ['Breakfast Tiffin', 'Brain Power'], image: IMG.idli, allergens: [], category: 'Breakfast', isKidSafe: true, isVeg: true, nutrition: { protein: '8g', carbs: '36g', fats: '6g' } },
  { id: 'm27', name: 'Daliya Veggie Pulao', price: 100, prepTime: 18, calories: 270, veggiePoints: 30, tags: ['Breakfast Tiffin', 'Boost My Energy'], image: IMG.daliyaPulao, allergens: ['Gluten'], category: 'Breakfast', isKidSafe: true, isVeg: true, nutrition: { protein: '10g', carbs: '42g', fats: '7g' } },
  { id: 'm28', name: 'Vegetable Uttapam with Sambar Dip', price: 110, prepTime: 15, calories: 280, veggiePoints: 32, tags: ['Breakfast Tiffin', 'Brain Power'], image: IMG.uttapam, allergens: [], category: 'Breakfast', isKidSafe: true, isVeg: true, nutrition: { protein: '10g', carbs: '40g', fats: '8g' } },

  // === COLD / ROOM-TEMP FRIENDLY ===
  { id: 'm29', name: 'Kala Chana & Raw Mango Salad Bowl', price: 115, prepTime: 10, calories: 220, veggiePoints: 32, tags: ['Cold Salad', 'Post-Sports Snacks'], image: IMG.chanaSalad, allergens: [], category: 'Snack', isKidSafe: true, isVeg: true, nutrition: { protein: '12g', carbs: '30g', fats: '6g' } },
  { id: 'm30', name: 'Sweet Potato & Peanut Chaat Bowl', price: 100, prepTime: 8, calories: 250, veggiePoints: 30, tags: ['Cold Salad', 'Sweet but Healthy', 'Post-Sports Snacks'], image: IMG.sweetPotatoChaat, allergens: ['Nuts'], category: 'Snack', isKidSafe: true, isVeg: true, nutrition: { protein: '8g', carbs: '38g', fats: '8g' } },
  { id: 'm31', name: 'Cucumber Carrot Moong Salad with Lemon', price: 90, prepTime: 8, calories: 180, veggiePoints: 28, tags: ['Cold Salad', 'Brain Power'], image: IMG.cucumberSalad, allergens: [], category: 'Snack', isKidSafe: true, isVeg: true, nutrition: { protein: '8g', carbs: '24g', fats: '4g' } },
];
