
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MoodTracker from "@/components/MoodTracker";
import ChatSupport from "@/components/ChatSupport";
import MoodInsights from "@/components/MoodInsights";
import DailyCheckIn from "@/components/DailyCheckIn";
import PersonalityChat from "@/components/PersonalityChat";
import MoodQuiz from "@/components/MoodQuiz";
import BineuralBeats from "@/components/BineuralBeats";
import RelaxationHub from "@/components/RelaxationHub";
import ExerciseRecommendations from "@/components/ExerciseRecommendations";
import NutritionTracker from "@/components/NutritionTracker";
import MotivationalStories from "@/components/MotivationalStories";
import EmergencySupport from "@/components/EmergencySupport";
import AuthForm from "@/components/AuthForm";
import { Heart, Brain, TrendingUp, MessageCircle, User, TestTube, Music, GamepadIcon, Dumbbell, Apple, BookOpen, AlertTriangle, LogOut } from "lucide-react";

const Index = ({ username, onLogout }) => {
  const [selectedTab, setSelectedTab] = useState("tracker");
  const [userMood, setUserMood] = useState(3);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  

  const getMoodTheme = (mood: number) => {
    switch (mood) {
      case 1: return "from-red-400 to-orange-400";
      case 2: return "from-orange-400 to-yellow-400";
      case 3: return "from-yellow-400 to-green-400";
      case 4: return "from-green-400 to-blue-400";
      case 5: return "from-blue-400 to-purple-400";
      default: return "from-blue-500 to-purple-500";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Blur Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')"
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>
      </div>

      {/* Animated Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/20 rounded-full animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/20 rounded-full animate-float-medium delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-pink-200/20 rounded-full animate-float-fast delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-indigo-200/20 rounded-full animate-float-slow delay-500"></div>
      </div>

      {/* Content with Glass Effect */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/20 backdrop-blur-md border-b border-white/30 shadow-lg animate-slide-down">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl shadow-lg">
                  <img src="/public/favicon.ico" alt="Logo" className="h-6 w-6" />
                </div>
                               
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-text-shimmer">
                    Mindful U
                  </h1>
                  <p className="text-sm text-gray-700 font-medium">Healing starts here</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Welcome, {username}!</span>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8 animate-fade-in-up delay-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-bounce-gentle">
              How are you feeling today, {username}?
            </h2>
            <p className="text-gray-700 font-medium">
              Comprehensive mental health support with AI-powered insights and wellness tools
            </p>
          </div>

          <div className="animate-fade-in-up delay-400">
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <div className="flex justify-center">
              <TabsList className="inline-flex justify-center gap-1 bg-white/30 backdrop-blur-md border border-white/40 shadow-xl rounded-xl px-2 py-1">
                <TabsTrigger value="tracker" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <Heart className="h-3 w-3 animate-heartbeat" />
                  <span className="hidden sm:inline">Mood</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <TestTube className="h-3 w-3" />
                  <span className="hidden sm:inline">Quiz</span>
                </TabsTrigger>
                {/* <TabsTrigger value="personality" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <User className="h-3 w-3" />
                  <span className="hidden sm:inline">AI Doc</span>
                </TabsTrigger> */}
                <TabsTrigger value="binaural" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <Music className="h-3 w-3" />
                  <span className="hidden sm:inline">Audio</span>
                </TabsTrigger>
                <TabsTrigger value="relaxation" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <GamepadIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">Games</span>
                </TabsTrigger>
                <TabsTrigger value="exercise" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <Dumbbell className="h-3 w-3" />
                  <span className="hidden sm:inline">Exercise</span>
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <Apple className="h-3 w-3" />
                  <span className="hidden sm:inline">Nutrition</span>
                </TabsTrigger>
                <TabsTrigger value="stories" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <BookOpen className="h-3 w-3" />
                  <span className="hidden sm:inline">Stories</span>
                </TabsTrigger>
                {/* <TabsTrigger value="emergency" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span className="hidden sm:inline">SOS</span>
                </TabsTrigger> */}
                 <TabsTrigger value="checkin" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <Brain className="h-3 w-3 animate-spin-slow" />
                  <span className="hidden sm:inline">Check-in</span>
                </TabsTrigger> 
                <TabsTrigger value="insights" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <TrendingUp className="h-3 w-3 animate-bounce-x" />
                  <span className="hidden sm:inline">Insights</span>
                </TabsTrigger>
                <TabsTrigger value="support" className="flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 data-[state=active]:bg-white/80">
                  <MessageCircle className="h-3 w-3 animate-wiggle" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="tracker" className="space-y-6 animate-fade-in-scale">
                <MoodTracker onMoodChange={setUserMood} />
              </TabsContent>

              <TabsContent value="quiz" className="space-y-6 animate-fade-in-scale">
                <MoodQuiz onMoodChange={setUserMood} onMoodResult={setUserMood} />
              </TabsContent>

              <TabsContent value="personality" className="space-y-6 animate-fade-in-scale">
                <PersonalityChat />
              </TabsContent>

              <TabsContent value="binaural" className="space-y-6 animate-fade-in-scale">
                <BineuralBeats />
              </TabsContent>

              <TabsContent value="relaxation" className="space-y-6 animate-fade-in-scale">
                <RelaxationHub />
              </TabsContent>

              <TabsContent value="exercise" className="space-y-6 animate-fade-in-scale">
                <ExerciseRecommendations />
              </TabsContent>

              <TabsContent value="nutrition" className="space-y-6 animate-fade-in-scale">
                <NutritionTracker />
              </TabsContent>

              <TabsContent value="stories" className="space-y-6 animate-fade-in-scale">
                <MotivationalStories />
              </TabsContent>

              <TabsContent value="emergency" className="space-y-6 animate-fade-in-scale">
                <EmergencySupport />
              </TabsContent>

              <TabsContent value="checkin" className="space-y-6 animate-fade-in-scale">
                <DailyCheckIn />
              </TabsContent>

              <TabsContent value="insights" className="space-y-6 animate-fade-in-scale">
                <MoodInsights />
              </TabsContent>

              <TabsContent value="support" className="space-y-6 animate-fade-in-scale">
                <ChatSupport />
              </TabsContent>
            </Tabs>
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
