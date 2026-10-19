import { supabase } from './supabase';
import { DEFAULT_MEALS } from '../types';

export async function seedMealsIfEmpty(): Promise<void> {
  const { count, error } = await supabase.from('meals').select('*', { count: 'exact', head: true });
  if (error) return;
  if (count && count > 0) return;

  const rows = DEFAULT_MEALS.map(m => ({
    name: m.name,
    price: m.price,
    prep_time: m.prepTime,
    calories: m.calories,
    veggie_points: m.veggiePoints,
    tags: m.tags,
    image_url: m.image,
    allergens: m.allergens,
    category: m.category,
    is_kid_safe: m.isKidSafe,
    is_veg: m.isVeg,
    protein: m.nutrition.protein,
    carbs: m.nutrition.carbs,
    fats: m.nutrition.fats,
  }));

  await supabase.from('meals').insert(rows);
}
