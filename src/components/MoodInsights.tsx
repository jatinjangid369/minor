
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Brain, Target } from "lucide-react";

const MoodInsights = () => {
  const weeklyData = [
    { day: "Mon", mood: 4, energy: 3 },
    { day: "Tue", mood: 3, energy: 4 },
    { day: "Wed", mood: 5, energy: 5 },
    { day: "Thu", mood: 2, energy: 2 },
    { day: "Fri", mood: 4, energy: 4 },
    { day: "Sat", mood: 5, energy: 5 },
    { day: "Sun", mood: 4, energy: 3 },
  ];

  const moodDistribution = [
    { name: "Very Happy", value: 25, color: "#8b5cf6" },
    { name: "Happy", value: 35, color: "#10b981" },
    { name: "Neutral", value: 20, color: "#f59e0b" },
    { name: "Sad", value: 15, color: "#f97316" },
    { name: "Very Sad", value: 5, color: "#ef4444" },
  ];

  const averageMood = 3.8;
  const moodTrend = "+0.5";
  const streakDays = 7;

  const insights = [
    {
      title: "Your mood tends to be higher on weekends",
      description: "Consider incorporating more weekend-like activities during weekdays",
      type: "pattern"
    },
    {
      title: "You've been consistent with tracking",
      description: "Great job maintaining this healthy habit for 7 days!",
      type: "achievement"
    },
    {
      title: "Midweek dip noticed",
      description: "Wednesday seems challenging. Try planning something enjoyable for midweek",
      type: "suggestion"
    },
  ];

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
              <p className="text-2xl font-bold text-purple-800">85%</p>
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
                <YAxis domain={[1, 5]} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="mood" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
              >
                <h4 className="font-medium text-gray-800 mb-2">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                  insight.type === 'achievement' ? 'bg-green-100 text-green-700' :
                  insight.type === 'pattern' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {insight.type}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoodInsights;
