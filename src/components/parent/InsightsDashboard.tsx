import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Printer, PieChart } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export default function InsightsDashboard() {
  const kids = useAppStore(s => s.kids);
  const orders = useAppStore(s => s.orders);
  const meals = useAppStore(s => s.meals);
  const mealRatings = useAppStore(s => s.mealRatings);

  const now = Date.now();
  const dayMs = 86400000;
  const weekMs = 7 * dayMs;

  const getKidInsights = (kidId: string) => {
    const weekOrders = orders.filter(o =>
      o.kidId === kidId &&
      o.status === 'Delivered' &&
      (now - o.timestamp) < weekMs
    );

    let totalCalories = 0;
    let totalProtein = 0;
    let totalFiber = 0;
    let totalSpent = 0;
    let sugarItems = 0;

    const dailySpending: Record<string, number> = {};
    const dayPatterns: Record<string, string[]> = {};

    weekOrders.forEach(o => {
      const meal = meals.find(m => m.id === o.mealId);
      if (!meal) return;

      totalCalories += meal.calories;
      totalProtein += parseInt(meal.nutrition.protein) || 0;
      totalFiber += Math.round((parseInt(meal.nutrition.carbs) || 0) * 0.15);
      totalSpent += o.price;

      if (meal.tags.includes('Sweet but Healthy')) sugarItems++;

      const dayName = new Date(o.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
      dailySpending[dayName] = (dailySpending[dayName] || 0) + o.price;

      const fullDay = new Date(o.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayPatterns[fullDay]) dayPatterns[fullDay] = [];
      dayPatterns[fullDay].push(...meal.tags);
    });

    const avgCalories = weekOrders.length > 0 ? Math.round(totalCalories / weekOrders.length) : 0;
    const avgProtein = weekOrders.length > 0 ? Math.round(totalProtein / weekOrders.length) : 0;
    const avgFiber = weekOrders.length > 0 ? Math.round(totalFiber / weekOrders.length) : 0;

    const spendingChart = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      amount: dailySpending[day] || 0,
    }));

    // Pattern detection
    const patterns: string[] = [];
    Object.entries(dayPatterns).forEach(([day, tags]) => {
      const sugarCount = tags.filter(t => t === 'Sweet but Healthy').length;
      if (sugarCount >= 2) {
        patterns.push(`tends to order high-sugar items on ${day}s`);
      }
    });

    if (sugarItems > 3) {
      patterns.push('ordered many sweet items this week');
    }

    const kidRatings = mealRatings.filter(r => r.kidId === kidId);
    const loveCount = kidRatings.filter(r => r.rating === 'love').length;
    const dislikeCount = kidRatings.filter(r => r.rating === 'dislike').length;

    if (dislikeCount > 3) {
      patterns.push('seems picky - many meals rated poorly');
    }

    if (loveCount > 5) {
      patterns.push('found many favorites - great variety!');
    }

    return {
      totalOrders: weekOrders.length,
      avgCalories,
      avgProtein,
      avgFiber,
      totalSpent,
      spendingChart,
      patterns,
    };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart size={18} className="text-teal-600" />
          <h3 className="font-bold text-gray-800">Weekly Insights</h3>
        </div>
        <motion.button
          onClick={handlePrint}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 min-h-[44px]"
        >
          <Printer size={14} />
          Export PDF
        </motion.button>
      </div>

      {kids.map(kid => {
        const insights = getKidInsights(kid.id);
        return (
          <motion.div
            key={kid.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                {kid.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{kid.name}</h4>
                <p className="text-xs text-gray-500">{insights.totalOrders} meals delivered this week</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-teal-600">Rs {insights.totalSpent}</p>
                <p className="text-xs text-gray-400">spent</p>
              </div>
            </div>

            <div className="p-4 space-y-5">
              {insights.totalOrders === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No delivered orders this week</p>
              ) : (
                <>
                  {/* Nutrition summary */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Avg Nutrition Per Meal</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-orange-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-orange-600">{insights.avgCalories}</p>
                        <p className="text-xs text-orange-500 font-medium">Calories</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-blue-600">{insights.avgProtein}g</p>
                        <p className="text-xs text-blue-500 font-medium">Protein</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-green-600">{insights.avgFiber}g</p>
                        <p className="text-xs text-green-500 font-medium">Fiber</p>
                      </div>
                    </div>
                  </div>

                  {/* Spending chart */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">7-Day Spending</p>
                    <div className="h-40 bg-gray-50 rounded-xl p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={insights.spendingChart} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            formatter={(value) => [`Rs ${value}`, 'Spent']}
                          />
                          <Bar dataKey="amount" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pattern cards */}
                  {insights.patterns.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Detected Patterns</p>
                      <div className="space-y-2">
                        {insights.patterns.map((pattern, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3"
                          >
                            <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-800 font-medium">
                              {kid.name} {pattern}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.patterns.length === 0 && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <p className="text-xs text-emerald-700 font-medium">
                        {kid.name}'s eating patterns look healthy this week!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
