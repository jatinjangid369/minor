
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Smile, Meh, Frown, Heart, Star } from "lucide-react";
import { toast } from "sonner";

interface MoodTrackerProps {
  onMoodChange?: (mood: number) => void;
}

const MoodTracker = ({ onMoodChange }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [moodHistory, setMoodHistory] = useState<any[]>([]);

  const moodOptions = [
    { value: 1, label: "Very Sad", icon: Frown, color: "text-red-500", bg: "bg-red-100", hoverBg: "hover:bg-red-200" },
    { value: 2, label: "Sad", icon: Frown, color: "text-orange-500", bg: "bg-orange-100", hoverBg: "hover:bg-orange-200" },
    { value: 3, label: "Neutral", icon: Meh, color: "text-yellow-500", bg: "bg-yellow-100", hoverBg: "hover:bg-yellow-200" },
    { value: 4, label: "Happy", icon: Smile, color: "text-green-500", bg: "bg-green-100", hoverBg: "hover:bg-green-200" },
    { value: 5, label: "Very Happy", icon: Star, color: "text-purple-500", bg: "bg-purple-100", hoverBg: "hover:bg-purple-200" },
  ];

  const fetchMoodHistory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/mood/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === "success") {
        const formattedHistory = data.data.map((log: any) => ({
          date: new Date(log.created_at).toISOString().split('T')[0],
          mood: log.mood,
          note: log.note
        }));

        console.log(formattedHistory);
        setMoodHistory(formattedHistory);
      }
    } catch (error) {
      console.error("Error fetching mood history:", error);
    }
  };

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
    if (onMoodChange) {
      onMoodChange(mood);
    }
  };

  const saveMood = async () => {
    if (selectedMood) {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("You must be logged in to save mood");
          return;
        }

        const response = await fetch("http://localhost:5000/api/mood/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mood: selectedMood, note }),
        });

        const data = await response.json();

        if (data.status === "success" || response.ok) {
          toast.success("Mood saved successfully! 💜");
          setSelectedMood(null);
          setNote("");
          fetchMoodHistory();
        } else {
          toast.error(data.message || "Failed to save mood");
        }
      } catch (error) {
        console.error("Error saving mood:", error);
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mood Selection */}
      <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 animate-fade-in">
            <Heart className="h-5 w-5 text-pink-500 animate-heartbeat" />
            How are you feeling right now?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-5 gap-3">
            {moodOptions.map((mood, index) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-500 hover:scale-110 hover:rotate-3 hover:shadow-lg transform-gpu animate-fade-in ${selectedMood === mood.value
                    ? `border-${mood.color.split('-')[1]}-400 ${mood.bg} shadow-lg scale-105 rotate-1 animate-bounce-gentle`
                    : `border-gray-200 ${mood.hoverBg} bg-white/60 backdrop-blur-sm hover:border-gray-300`
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${mood.color} transition-all duration-300 hover:scale-125`} />
                  <p className="text-xs font-medium text-gray-700">{mood.label}</p>
                </button>
              );
            })}
          </div>

          <div className="space-y-2 animate-fade-in-up delay-500">
            <label className="text-sm font-medium text-gray-700">
              What's on your mind? (optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Share your thoughts, feelings, or what happened today..."
              className="resize-none bg-white/60 backdrop-blur-sm border-white/40 focus:bg-white/80 transition-all duration-300 hover:shadow-md focus:scale-[1.01]"
              rows={3}
            />
          </div>

          <Button
            onClick={saveMood}
            disabled={!selectedMood}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:hover:scale-100 animate-fade-in-up delay-700"
          >
            <Heart className="h-4 w-4 mr-2 animate-heartbeat" />
            Save My Mood
          </Button>
        </CardContent>
      </Card>

      {/* Mood Chart */}
      <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale delay-200 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
        <CardHeader>
          <CardTitle className="animate-fade-in delay-300">Your Mood Journey</CardTitle>
        </CardHeader>
        <CardContent className="animate-fade-in delay-400">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                domain={[1, 5]}
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => moodOptions[value - 1]?.label || value}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name) => [moodOptions[value - 1]?.label || value, "Mood"]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="url(#gradient)"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodTracker;
