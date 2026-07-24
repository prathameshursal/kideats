import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, Eye, Heart, EyeOff } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { Meal, KidProfile, MealRating } from '../../types';

interface SuggestionRow {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  meals: Meal[];
  color: string;
}

function getTimeCategory(): 'breakfast' | 'lunch' | 'snack' | 'dinner' {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 18) return 'snack';
  return 'dinner';
}

const POPULARITY_SCORES: Record<string, number> = {
  m1: 87, m2: 92, m3: 78, m4: 95, m5: 88, m6: 72,
  m7: 91, m8: 96, m9: 85, m10: 79, m11: 83, m12: 74,
  m13: 90, m14: 76, m15: 94, m16: 69, m17: 93, m18: 71,
  m19: 82, m20: 77, m21: 86, m22: 68, m23: 89, m24: 73,
  m25: 84, m26: 81, m27: 75, m28: 80, m29: 70, m30: 66, m31: 67,
};

export function getPopularityScore(mealId: string): number {
  return POPULARITY_SCORES[mealId] ?? Math.floor(Math.random() * 30 + 60);
}

export function getMealRating(mealRatings: MealRating[], kidId: string, mealId: string): MealRating | undefined {
  return mealRatings.find(r => r.kidId === kidId && r.mealId === mealId);
}

export function isMealDisliked(mealRatings: MealRating[], kidId: string, mealId: string): boolean {
  const rating = getMealRating(mealRatings, kidId, mealId);
  return rating?.rating === 'dislike';
}

export function isMealFavorite(mealRatings: MealRating[], kidId: string, mealId: string): boolean {
  const rating = getMealRating(mealRatings, kidId, mealId);
  return rating?.rating === 'love';
}

interface Props {
  kid: KidProfile;
  onOrderMeal: (meal: Meal) => void;
  showDisliked: boolean;
  onToggleShowDisliked: () => void;
}

export default function SmartSuggestions({ kid, onOrderMeal, showDisliked, onToggleShowDisliked }: Props) {
  const meals = useAppStore(s => s.meals);
  const orders = useAppStore(s => s.orders);
  const mealRatings = useAppStore(s => s.mealRatings);

  const kidOrders = orders.filter(o => o.kidId === kid.id && o.status !== 'Rejected');
  const lastOrderedMealId = kidOrders[0]?.mealId;
  const lastOrderedMeal = meals.find(m => m.id === lastOrderedMealId);

  const dislikedMealIds = useMemo(() =>
    new Set(mealRatings.filter(r => r.kidId === kid.id && r.rating === 'dislike').map(r => r.mealId)),
    [mealRatings, kid.id]
  );

  const favoriteMealIds = useMemo(() =>
    new Set(mealRatings.filter(r => r.kidId === kid.id && r.rating === 'love').map(r => r.mealId)),
    [mealRatings, kid.id]
  );

  const triedMealIds = new Set(kid.uniqueMealsTried);

  const suggestions = useMemo((): SuggestionRow[] => {
    const rows: SuggestionRow[] = [];
    const timeCategory = getTimeCategory();

    // Favorites row
    const favorites = meals.filter(m => favoriteMealIds.has(m.id));
    if (favorites.length > 0) {
      rows.push({
        id: 'favorites',
        title: 'Your Favorites',
        subtitle: 'Meals you loved',
        icon: <Heart size={14} className="text-rose-500 fill-rose-500" />,
        meals: favorites,
        color: 'from-rose-50 to-pink-50',
      });
    }

    // "Because you ordered X" recommendation
    if (lastOrderedMeal) {
      const similar = meals.filter(m =>
        m.id !== lastOrderedMeal.id &&
        !dislikedMealIds.has(m.id) &&
        m.tags.some(t => lastOrderedMeal.tags.includes(t))
      ).slice(0, 4);

      if (similar.length > 0) {
        rows.push({
          id: 'because-ordered',
          title: `Because ${kid.name} ordered ${lastOrderedMeal.name.split(' ').slice(0, 2).join(' ')}...`,
          subtitle: 'You might also like these',
          icon: <Sparkles size={14} className="text-amber-500" />,
          meals: similar,
          color: 'from-amber-50 to-orange-50',
        });
      }
    }

    // Time-aware suggestions
    const categoryMap: Record<string, string> = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      snack: 'Snack',
      dinner: 'Dinner',
    };
    const timeMeals = meals.filter(m =>
      m.category === categoryMap[timeCategory] && !dislikedMealIds.has(m.id)
    ).slice(0, 5);

    if (timeMeals.length > 0) {
      const timeLabels: Record<string, string> = {
        breakfast: 'Good Morning! Breakfast picks',
        lunch: 'Lunchtime! Perfect meals for now',
        snack: 'Snack o\'clock! Light bites',
        dinner: 'Dinner time! Evening favorites',
      };
      rows.push({
        id: 'time-aware',
        title: timeLabels[timeCategory],
        subtitle: 'Based on the time of day',
        icon: <Clock size={14} className="text-teal-500" />,
        meals: timeMeals,
        color: 'from-teal-50 to-emerald-50',
      });
    }

    // Trending at school
    const trending = [...meals]
      .filter(m => !dislikedMealIds.has(m.id))
      .sort((a, b) => getPopularityScore(b.id) - getPopularityScore(a.id))
      .slice(0, 5);

    rows.push({
      id: 'trending',
      title: 'Trending at School',
      subtitle: 'Popular with other kids',
      icon: <TrendingUp size={14} className="text-blue-500" />,
      meals: trending,
      color: 'from-blue-50 to-sky-50',
    });

    // "You haven't tried this yet!" discovery
    const untried = meals.filter(m =>
      !triedMealIds.has(m.id) && !dislikedMealIds.has(m.id)
    ).slice(0, 5);

    if (untried.length > 0) {
      rows.push({
        id: 'discovery',
        title: 'You haven\'t tried this yet!',
        subtitle: 'New meals waiting for you',
        icon: <Eye size={14} className="text-emerald-500" />,
        meals: untried,
        color: 'from-emerald-50 to-green-50',
      });
    }

    return rows;
  }, [meals, kid, lastOrderedMeal, dislikedMealIds, favoriteMealIds, triedMealIds, orders]);

  const hiddenCount = dislikedMealIds.size;

  return (
    <div className="space-y-5">
      {hiddenCount > 0 && (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
          <span className="text-xs text-gray-500">
            {hiddenCount} meal{hiddenCount !== 1 ? 's' : ''} hidden (rated dislike)
          </span>
          <button
            onClick={onToggleShowDisliked}
            className="flex items-center gap-1 text-xs font-semibold text-gray-600 min-h-[36px] px-2"
          >
            {showDisliked ? <EyeOff size={12} /> : <Eye size={12} />}
            {showDisliked ? 'Hide' : 'Show anyway?'}
          </button>
        </div>
      )}

      {suggestions.map((row, rowIdx) => (
        <motion.div
          key={row.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rowIdx * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            {row.icon}
            <div>
              <h3 className="text-sm font-bold text-gray-800">{row.title}</h3>
              <p className="text-xs text-gray-400">{row.subtitle}</p>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {row.meals.map(meal => (
              <motion.button
                key={meal.id}
                onClick={() => onOrderMeal(meal)}
                whileTap={{ scale: 0.95 }}
                className={`relative shrink-0 w-40 rounded-2xl overflow-hidden bg-gradient-to-b ${row.color} border border-gray-100 shadow-sm`}
              >
                <div className="relative h-24 overflow-hidden">
                  <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {row.id === 'trending' && (
                    <div className="absolute top-1.5 right-1.5 bg-white/90 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                      <TrendingUp size={8} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-blue-600">{getPopularityScore(meal.id)}%</span>
                    </div>
                  )}
                  {favoriteMealIds.has(meal.id) && (
                    <div className="absolute top-1.5 left-1.5 bg-white/90 rounded-full p-1">
                      <Heart size={10} className="text-rose-500 fill-rose-500" />
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 bg-white/90 rounded-full px-1.5 py-0.5">
                    <span className="text-[10px] font-bold text-gray-800">Rs {meal.price}</span>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold text-gray-800 leading-tight line-clamp-2 text-left">{meal.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Sparkles size={9} className="text-amber-500" />
                    <span className="text-[10px] font-semibold text-amber-600">+{meal.veggiePoints} pts</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
