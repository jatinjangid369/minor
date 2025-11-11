
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Heart, Zap, Smile, Coffee, Moon } from "lucide-react";
import { toast } from "sonner";

const DailyCheckIn = () => {
  const [gratitude, setGratitude] = useState("");
  const [energy, setEnergy] = useState([5]);
  const [sleep, setSleep] = useState([7]);
  const [stress, setStress] = useState([3]);
  const [activities, setActivities] = useState<string[]>([]);
  const [goals, setGoals] = useState("");

  const activityOptions = [
    { id: "exercise", label: "Exercise", icon: Zap },
    { id: "meditation", label: "Meditation", icon: Heart },
    { id: "social", label: "Social Connection", icon: Smile },
    { id: "nature", label: "Time in Nature", icon: Coffee },
    { id: "creative", label: "Creative Activity", icon: Moon },
    { id: "learning", label: "Learning Something New", icon: Calendar },
  ];

  const handleActivityChange = (activityId: string, checked: boolean) => {
    if (checked) {
      setActivities(prev => [...prev, activityId]);
    } else {
      setActivities(prev => prev.filter(id => id !== activityId));
    }
  };

  const submitCheckIn = () => {
    const checkInData = {
      date: new Date().toISOString().split('T')[0],
      gratitude,
      energy: energy[0],
      sleep: sleep[0],
      stress: stress[0],
      activities,
      goals,
    };
    
    console.log("Check-in submitted:", checkInData);
    
    // Reset form
    setGratitude("");
    setEnergy([5]);
    setSleep([7]);
    setStress([3]);
    setActivities([]);
    setGoals("");
    
    toast.success("Daily check-in completed! 🌟");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Daily Check-in
          </CardTitle>
          <p className="text-sm text-gray-600">
            Take a moment to reflect on your day and set intentions
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Gratitude */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              What are you grateful for today?
            </Label>
            <Textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Write about three things you're grateful for..."
              className="resize-none bg-white/60 backdrop-blur-sm"
              rows={3}
            />
          </div>

          {/* Wellness Scales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Energy Level: {energy[0]}/10
              </Label>
              <Slider
                value={energy}
                onValueChange={setEnergy}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                Sleep Quality: {sleep[0]}/10
              </Label>
              <Slider
                value={sleep}
                onValueChange={setSleep}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Coffee className="h-4 w-4 text-red-500" />
                Stress Level: {stress[0]}/10
              </Label>
              <Slider
                value={stress}
                onValueChange={setStress}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              What wellness activities did you do today?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {activityOptions.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={activity.id}
                      checked={activities.includes(activity.id)}
                      onCheckedChange={(checked) => 
                        handleActivityChange(activity.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={activity.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-gray-600" />
                      {activity.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tomorrow's Goals */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              What's one goal for tomorrow?
            </Label>
            <Textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Set a small, achievable goal for tomorrow..."
              className="resize-none bg-white/60 backdrop-blur-sm"
              rows={2}
            />
          </div>

          <Button 
            onClick={submitCheckIn}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-200"
            size="lg"
          >
            Complete Check-in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyCheckIn;
