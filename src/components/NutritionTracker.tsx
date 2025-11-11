
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Apple, Plus, TrendingUp, Brain, Heart, Zap } from "lucide-react";
import { toast } from "sonner";

interface NutritionEntry {
  id: string;
  food: string;
  category: "protein" | "vegetables" | "fruits" | "grains" | "dairy" | "other";
  moodImpact: "positive" | "neutral" | "negative";
  time: string;
  notes?: string;
}

interface NutritionTip {
  category: string;
  tip: string;
  moodBenefit: string;
  icon: React.ReactNode;
  color: string;
}

const NutritionTracker = () => {
  const [newFood, setNewFood] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("other");
  const [selectedMoodImpact, setSelectedMoodImpact] = useState<string>("neutral");
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([
    { id: "1", food: "Salmon", category: "protein", moodImpact: "positive", time: "12:00", notes: "Rich in omega-3" },
    { id: "2", food: "Spinach salad", category: "vegetables", moodImpact: "positive", time: "12:30" },
    { id: "3", food: "Blueberries", category: "fruits", moodImpact: "positive", time: "15:00", notes: "Antioxidants" },
    { id: "4", food: "Coffee", category: "other", moodImpact: "neutral", time: "08:00" },
  ]);

  const categories = [
    { value: "protein", label: "Protein", color: "bg-red-500" },
    { value: "vegetables", label: "Vegetables", color: "bg-green-500" },
    { value: "fruits", label: "Fruits", color: "bg-orange-500" },
    { value: "grains", label: "Grains", color: "bg-yellow-500" },
    { value: "dairy", label: "Dairy", color: "bg-blue-500" },
    { value: "other", label: "Other", color: "bg-gray-500" },
  ];

  const moodImpacts = [
    { value: "positive", label: "Positive", color: "text-green-600" },
    { value: "neutral", label: "Neutral", color: "text-gray-600" },
    { value: "negative", label: "Negative", color: "text-red-600" },
  ];

  const nutritionTips: NutritionTip[] = [
    {
      category: "Omega-3 Foods",
      tip: "Include salmon, walnuts, and chia seeds",
      moodBenefit: "Reduces inflammation and supports brain health",
      icon: <Brain className="h-4 w-4" />,
      color: "bg-blue-500"
    },
    {
      category: "Complex Carbs",
      tip: "Choose oats, quinoa, and sweet potatoes",
      moodBenefit: "Stabilizes blood sugar and serotonin levels",
      icon: <Zap className="h-4 w-4" />,
      color: "bg-orange-500"
    },
    {
      category: "Antioxidant-Rich",
      tip: "Eat berries, dark chocolate, and green tea",
      moodBenefit: "Protects against oxidative stress",
      icon: <Heart className="h-4 w-4" />,
      color: "bg-purple-500"
    },
    {
      category: "Probiotics",
      tip: "Include yogurt, kefir, and fermented foods",
      moodBenefit: "Supports gut-brain connection",
      icon: <Apple className="h-4 w-4" />,
      color: "bg-green-500"
    }
  ];

  const addNutritionEntry = () => {
    if (!newFood.trim()) return;

    const newEntry: NutritionEntry = {
      id: Date.now().toString(),
      food: newFood,
      category: selectedCategory as any,
      moodImpact: selectedMoodImpact as any,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setNutritionEntries(prev => [newEntry, ...prev]);
    setNewFood("");
    toast.success("Food logged successfully! 🍎");
  };

  const getCategoryStats = () => {
    const stats = categories.map(category => {
      const count = nutritionEntries.filter(entry => entry.category === category.value).length;
      return {
        name: category.label,
        value: count,
        color: category.color.replace('bg-', '')
      };
    }).filter(stat => stat.value > 0);

    return stats;
  };

  const getMoodImpactStats = () => {
    return moodImpacts.map(impact => {
      const count = nutritionEntries.filter(entry => entry.moodImpact === impact.value).length;
      return {
        name: impact.label,
        value: count,
        color: impact.value === 'positive' ? '#10b981' : impact.value === 'neutral' ? '#6b7280' : '#ef4444'
      };
    }).filter(stat => stat.value > 0);
  };

  const pieColors = ['#ef4444', '#10b981', '#f59e0b', '#eab308', '#3b82f6', '#6b7280'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Food Logger */}
      <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-green-500 animate-bounce" />
            Nutrition Tracker
          </CardTitle>
          <p className="text-sm text-gray-600">
            Track how food affects your mood and energy
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Food Form */}
          <div className="space-y-3 animate-fade-in">
            <Input
              value={newFood}
              onChange={(e) => setNewFood(e.target.value)}
              placeholder="What did you eat? (e.g., Grilled chicken salad)"
              className="bg-white/60 backdrop-blur-sm"
              onKeyPress={(e) => e.key === "Enter" && addNutritionEntry()}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 rounded border bg-white/60 backdrop-blur-sm text-sm"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Mood Impact</label>
                <select
                  value={selectedMoodImpact}
                  onChange={(e) => setSelectedMoodImpact(e.target.value)}
                  className="w-full p-2 rounded border bg-white/60 backdrop-blur-sm text-sm"
                >
                  {moodImpacts.map(impact => (
                    <option key={impact.value} value={impact.value}>
                      {impact.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button onClick={addNutritionEntry} className="w-full" disabled={!newFood.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Log Food
            </Button>
          </div>

          {/* Today's Entries */}
          <div className="space-y-2 animate-fade-in-up delay-200">
            <h3 className="font-medium text-gray-700">Today's Intake</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {nutritionEntries.slice(0, 8).map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{entry.food}</div>
                    <div className="text-xs text-gray-600">{entry.time} • {entry.notes}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {categories.find(c => c.value === entry.category)?.label}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${moodImpacts.find(m => m.value === entry.moodImpact)?.color}`}
                    >
                      {moodImpacts.find(m => m.value === entry.moodImpact)?.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Tips */}
      <div className="space-y-6">
        {/* Nutrition Charts */}
        <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale delay-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Nutrition Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Category Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">Food Categories</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={getCategoryStats()}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {getCategoryStats().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mood Impact */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">Mood Impact</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={getMoodImpactStats()}>
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <defs>
                      <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Tips */}
        <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale delay-400">
          <CardHeader>
            <CardTitle>Mood-Boosting Nutrition Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nutritionTips.map((tip, index) => (
                <div
                  key={tip.category}
                  className="p-3 bg-white/60 backdrop-blur-sm rounded-lg animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded ${tip.color} text-white`}>
                      {tip.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{tip.category}</h4>
                      <p className="text-xs text-gray-600 mb-1">{tip.tip}</p>
                      <p className="text-xs text-green-700">{tip.moodBenefit}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NutritionTracker;
