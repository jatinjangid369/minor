
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, GamepadIcon, Eye, Wind, Droplets, Waves, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface RelaxationActivity {
  id: string;
  name: string;
  type: "video" | "game" | "visual";
  description: string;
  duration: string;
  icon: React.ReactNode;
  color: string;
  content: string;
}

const RelaxationHub = () => {
  const [selectedActivity, setSelectedActivity] = useState<RelaxationActivity | null>(null);
  const [isActive, setIsActive] = useState(false);

  const activities: RelaxationActivity[] = [
    {
      id: "breathing",
      name: "Breathing Circles",
      type: "visual",
      description: "Follow the expanding and contracting circle to regulate your breathing",
      duration: "5-10 min",
      icon: <Wind className="h-5 w-5" />,
      color: "bg-blue-500",
      content: "breathing-visual"
    },
    {
      id: "water-drops",
      name: "Water Droplets",
      type: "visual",
      description: "Watch peaceful water droplets fall and create ripples",
      duration: "Continuous",
      icon: <Droplets className="h-5 w-5" />,
      color: "bg-cyan-500",
      content: "water-visual"
    },
    {
      id: "ocean-waves",
      name: "Ocean Waves",
      type: "visual",
      description: "Soothing ocean waves animation with calming sounds",
      duration: "Continuous",
      icon: <Waves className="h-5 w-5" />,
      color: "bg-teal-500",
      content: "waves-visual"
    },
    {
      id: "color-therapy",
      name: "Color Therapy",
      type: "visual",
      description: "Slowly changing colors to promote relaxation and mood enhancement",
      duration: "10-15 min",
      icon: <Sparkles className="h-5 w-5" />,
      color: "bg-purple-500",
      content: "color-visual"
    },
    {
      id: "zen-garden",
      name: "Digital Zen Garden",
      type: "game",
      description: "Create patterns in sand for a meditative experience",
      duration: "Open-ended",
      icon: <GamepadIcon className="h-5 w-5" />,
      color: "bg-amber-500",
      content: "zen-game"
    },
    {
      id: "bubble-pop",
      name: "Mindful Bubble Pop",
      type: "game",
      description: "Pop bubbles at your own pace for stress relief",
      duration: "Open-ended",
      icon: <GamepadIcon className="h-5 w-5" />,
      color: "bg-pink-500",
      content: "bubble-game"
    }
  ];

  const startActivity = (activity: RelaxationActivity) => {
    setSelectedActivity(activity);
    setIsActive(true);
    toast.success(`Started ${activity.name}`);
  };

  const stopActivity = () => {
    setSelectedActivity(null);
    setIsActive(false);
  };

  const BreathingVisual = () => {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl animate-fade-in">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-white rounded-full animate-breathing opacity-80"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-medium text-center">
              <div className="text-sm mb-1">Breathe</div>
              <div className="text-xs opacity-75">In... Out...</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const WaterVisual = () => {
    return (
      <div className="h-96 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-xl relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-water-drop opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
          <div className="text-sm font-medium">Peaceful Waters</div>
          <div className="text-xs opacity-75">Let your stress wash away</div>
        </div>
      </div>
    );
  };

  const WavesVisual = () => {
    return (
      <div className="h-96 bg-gradient-to-b from-teal-400 to-blue-700 rounded-xl relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 w-full h-20 bg-white opacity-20 animate-wave"></div>
          <div className="absolute bottom-0 w-full h-16 bg-white opacity-15 animate-wave-delayed"></div>
          <div className="absolute bottom-0 w-full h-12 bg-white opacity-10 animate-wave-slow"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <div className="text-lg font-medium mb-2">Ocean Waves</div>
          <div className="text-sm opacity-75">Find your rhythm with the sea</div>
        </div>
      </div>
    );
  };

  const ColorVisual = () => {
    return (
      <div className="h-96 rounded-xl animate-color-therapy animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center backdrop-blur-sm bg-black bg-opacity-20 p-6 rounded-lg">
            <div className="text-xl font-medium mb-2">Color Therapy</div>
            <div className="text-sm opacity-75">Let the colors heal your mind</div>
          </div>
        </div>
      </div>
    );
  };

  const ZenGame = () => {
    const [patterns, setPatterns] = useState<Array<{x: number, y: number}>>([]);

    const addPattern = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPatterns(prev => [...prev, {x, y}]);
    };

    return (
      <div className="h-96 bg-gradient-to-br from-amber-200 to-orange-300 rounded-xl relative cursor-crosshair animate-fade-in" onClick={addPattern}>
        {patterns.map((pattern, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 border-2 border-amber-700 rounded-full animate-zen-ripple"
            style={{ left: `${pattern.x}%`, top: `${pattern.y}%` }}
          />
        ))}
        <div className="absolute top-4 left-4 text-amber-800">
          <div className="text-sm font-medium">Zen Garden</div>
          <div className="text-xs">Click to create patterns</div>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setPatterns([]);
          }}
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 bg-white/50"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const BubbleGame = () => {
    const [bubbles, setBubbles] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);

    const generateBubble = () => {
      const newBubble = {
        id: Date.now(),
        x: Math.random() * 90,
        y: Math.random() * 90,
        size: 20 + Math.random() * 40
      };
      setBubbles(prev => [...prev, newBubble]);
    };

    const popBubble = (id: number) => {
      setBubbles(prev => prev.filter(bubble => bubble.id !== id));
    };

    useState(() => {
      const interval = setInterval(generateBubble, 2000);
      return () => clearInterval(interval);
    });

    return (
      <div className="h-96 bg-gradient-to-br from-pink-300 to-purple-400 rounded-xl relative overflow-hidden animate-fade-in">
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-white bg-opacity-30 border border-white border-opacity-50 cursor-pointer animate-bubble-float hover:scale-110 transition-transform"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`
            }}
            onClick={() => popBubble(bubble.id)}
          />
        ))}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
          <div className="text-sm font-medium">Mindful Bubbles</div>
          <div className="text-xs opacity-75">Pop bubbles to release stress</div>
        </div>
        <Button
          onClick={generateBubble}
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 bg-white/50"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderActivityContent = () => {
    if (!selectedActivity) return null;

    switch (selectedActivity.content) {
      case "breathing-visual":
        return <BreathingVisual />;
      case "water-visual":
        return <WaterVisual />;
      case "waves-visual":
        return <WavesVisual />;
      case "color-visual":
        return <ColorVisual />;
      case "zen-game":
        return <ZenGame />;
      case "bubble-game":
        return <BubbleGame />;
      default:
        return null;
    }
  };

  if (isActive && selectedActivity) {
    return (
      <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className={`p-1 rounded ${selectedActivity.color} text-white`}>
                {selectedActivity.icon}
              </div>
              {selectedActivity.name}
            </CardTitle>
            <Button onClick={stopActivity} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderActivityContent()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GamepadIcon className="h-5 w-5 text-purple-500 animate-bounce" />
          Relaxation Hub
        </CardTitle>
        <p className="text-sm text-gray-600">
          Satisfying visuals and mindful games for stress relief
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="p-4 rounded-xl border-2 border-gray-200 bg-white/60 backdrop-blur-sm hover:border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => startActivity(activity)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${activity.color} text-white animate-pulse-gentle`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{activity.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {activity.duration}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-xs">
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200 animate-fade-in">
          <div className="flex items-start gap-2">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-800 mb-1">Benefits of Visual Relaxation</h4>
              <p className="text-sm text-purple-700">
                Visual meditation and satisfying activities can reduce cortisol levels, lower blood pressure, 
                and help activate your parasympathetic nervous system for deep relaxation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelaxationHub;
