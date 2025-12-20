
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Brain, Target } from "lucide-react";

interface Insight {
  title: string;
  description: string;
  type: "achievement" | "pattern" | "suggestion";
}

interface StatsData {
  averageMood: string;
  moodTrend: string;
  streakDays: number;
  weeklyData: { day: string; mood: number; energy: number }[];
  moodDistribution: { name: string; value: number; color: string }[];
  insights: Insight[];
}

const MoodInsights = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Please log in to view insights");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/mood/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await response.json();

        if (json.status === "success") {
          setStats(json.data);
        } else {
          setError(json.message || "Failed to load insights");
        }
      } catch (err) {
        console.error("Error fetching mood insights:", err);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const { averageMood, moodTrend, streakDays, weeklyData, moodDistribution, insights } = stats;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mood Statistics */}
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-800">{averageMood}</p>
              <p className="text-sm text-blue-600">Average Mood</p>
              <p className="text-xs text-green-600 font-medium">{moodTrend} this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">{streakDays}</p>
              <p className="text-sm text-green-600">Day Streak</p>
              <p className="text-xs text-green-600 font-medium">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-800">
                {/* Note: 'Positive Days' % logic wasn't in backend yet, we can add it or just remove this card/mock it. 
                   The user wanted strict adherence to previous UI which had static 85%.
                   Since backend didn't implement it in this turn, I'll calculate it from distribution if possible, or placeholder.
                   Let's calculate from distribution for "Positive" (Mood 4 & 5).
               */}
                {(() => {
                  const positive = moodDistribution.filter(d => d.name === "Happy" || d.name === "Very Happy")
                    .reduce((acc, curr) => acc + curr.value, 0);
                  return positive + "%";
                })()}
              </p>
              <p className="text-sm text-purple-600">Positive Days</p>
              <p className="text-xs text-purple-600 font-medium">Great progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Mood Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle>Weekly Mood & Energy</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis domain={[0, 5]} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="mood" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                {/* Energy bar rendered if data exists */}
                <Bar dataKey="energy" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Distribution */}
      <div className="space-y-6">
        {/* Mood Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle>Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                >
                  <h4 className="font-medium text-gray-800 mb-2">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${insight.type === 'achievement' ? 'bg-green-100 text-green-700' :
                    insight.type === 'pattern' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                    {insight.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Not enough data for insights yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoodInsights;
