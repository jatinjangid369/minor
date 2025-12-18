
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, Brain, Zap, Moon, Heart } from "lucide-react";
import { toast } from "sonner";

interface FrequencyPreset {
  name: string;
  frequency: number;
  description: string;
  benefits: string[];
  icon: React.ReactNode;
  color: string;
}

const BineuralBeats = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState(40);
  const [volume, setVolume] = useState([50]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [duration, setDuration] = useState(10); // minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillator1Ref = useRef<OscillatorNode | null>(null);
  const oscillator2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const frequencyPresets: FrequencyPreset[] = [
    {
      name: "Deep Focus",
      frequency: 40,
      description: "Gamma waves for enhanced concentration and cognitive performance",
      benefits: ["Improved focus", "Enhanced memory", "Increased awareness"],
      icon: <Brain className="h-5 w-5" />,
      color: "bg-purple-500"
    },
    {
      name: "Meditation",
      frequency: 8,
      description: "Alpha waves for relaxed alertness and mindfulness",
      benefits: ["Deep relaxation", "Stress relief", "Inner peace"],
      icon: <Heart className="h-5 w-5" />,
      color: "bg-green-500"
    },
    {
      name: "Energy Boost",
      frequency: 15,
      description: "Beta waves for alertness and mental energy",
      benefits: ["Increased energy", "Mental clarity", "Alertness"],
      icon: <Zap className="h-5 w-5" />,
      color: "bg-yellow-500"
    },
    {
      name: "Deep Sleep",
      frequency: 3,
      description: "Delta waves for deep, restorative sleep",
      benefits: ["Better sleep", "Deep rest", "Recovery"],
      icon: <Moon className="h-5 w-5" />,
      color: "bg-blue-500"
    }
  ];

  useEffect(() => {
    return () => {
      stopAudio();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (oscillator1Ref.current && oscillator2Ref.current) {
      oscillator1Ref.current.frequency.setValueAtTime(200, audioContextRef.current!.currentTime);
      oscillator2Ref.current.frequency.setValueAtTime(200 + currentFrequency, audioContextRef.current!.currentTime);
    }
  }, [currentFrequency]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume[0] / 100 * 0.1, audioContextRef.current!.currentTime);
    }
  }, [volume]);

  const initializeAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const context = audioContextRef.current;

    // Create oscillators
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();

    // Create gain node for volume control
    const gainNode = context.createGain();

    // Set frequencies (binaural beat = difference between frequencies)
    osc1.frequency.setValueAtTime(200, context.currentTime);
    osc2.frequency.setValueAtTime(200 + currentFrequency, context.currentTime);

    // Set waveform
    osc1.type = 'sine';
    osc2.type = 'sine';

    // Set volume
    gainNode.gain.setValueAtTime(volume[0] / 100 * 0.1, context.currentTime);

    // Create stereo panner for left/right separation
    const pannerL = context.createStereoPanner();
    const pannerR = context.createStereoPanner();
    pannerL.pan.setValueAtTime(-1, context.currentTime); // Left ear
    pannerR.pan.setValueAtTime(1, context.currentTime);  // Right ear

    // Connect nodes
    osc1.connect(pannerL).connect(gainNode).connect(context.destination);
    osc2.connect(pannerR).connect(gainNode).connect(context.destination);

    // Store references
    oscillator1Ref.current = osc1;
    oscillator2Ref.current = osc2;
    gainNodeRef.current = gainNode;

    // Start oscillators
    osc1.start();
    osc2.start();
  };

  const startAudio = () => {
    try {
      initializeAudio();
      setIsPlaying(true);
      setTimeRemaining(duration * 60); // Convert to seconds

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopAudio();
            toast.success("Binaural beats session completed!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.success(`Started ${selectedPreset || 'custom'} binaural beats session`);
    } catch (error) {
      toast.error("Unable to start audio. Please check your browser permissions.");
      console.error("Audio error:", error);
    }
  };

  const stopAudio = () => {
    if (oscillator1Ref.current) {
      oscillator1Ref.current.stop();
      oscillator1Ref.current = null;
    }
    if (oscillator2Ref.current) {
      oscillator2Ref.current.stop();
      oscillator2Ref.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    setTimeRemaining(0);
  };

  const selectPreset = (preset: FrequencyPreset) => {
    setCurrentFrequency(preset.frequency);
    setSelectedPreset(preset.name);
    if (isPlaying) {
      stopAudio();
      setTimeout(() => startAudio(), 100);
    }
    toast.success(`Selected ${preset.name} preset`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const getAIRecommendation = async () => {
    try {
      setIsGenerating(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please login to get AI recommendations");
        setIsGenerating(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/recommend/beats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === "success" && data.data) {
        const { frequency, preset_name, reason, volume: recVolume, duration: recDuration } = data.data;
        setCurrentFrequency(frequency);
        setSelectedPreset(`AI: ${preset_name}`);
        setVolume([recVolume || 50]);
        setDuration(recDuration || 15);

        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-semibold">AI Recommendation Applied</span>
            <span className="text-xs opacity-90">{reason}</span>
          </div>,
          { duration: 5000 }
        );

        if (isPlaying) {
          stopAudio();
          // Optional: Auto-start or let user verify settings first. Let's let user start.
        }
      } else {
        toast.error("Failed to get recommendation");
      }
    } catch (error) {
      console.error("AI Recommendation error:", error);
      toast.error("Error connecting to AI service");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Controls */}
      <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500 animate-pulse-gentle" />
                Binaural Beats Generator
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Use headphones for the best binaural beats experience
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={getAIRecommendation}
              disabled={isGenerating}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700 shadow-md animate-shimmer"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">✨</span> Thinking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 fill-current" /> AI Recommend
                </span>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Frequency Control */}
          <div className="space-y-3 animate-fade-in">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Frequency</label>
              <Badge variant="outline" className="animate-bounce-gentle">
                {currentFrequency} Hz
              </Badge>
            </div>
            <Slider
              value={[currentFrequency]}
              onValueChange={(value) => setCurrentFrequency(value[0])}
              max={50}
              min={1}
              step={0.5}
              className="animate-fade-in-up delay-200"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Delta (0.5-4 Hz)</span>
              <span>Theta (4-8 Hz)</span>
              <span>Alpha (8-13 Hz)</span>
              <span>Beta (13-30 Hz)</span>
              <span>Gamma (30+ Hz)</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-3 animate-fade-in delay-300">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Volume
              </label>
              <Badge variant="outline">
                {volume[0]}%
              </Badge>
            </div>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              min={0}
              step={5}
            />
          </div>

          {/* Duration Control */}
          <div className="space-y-3 animate-fade-in delay-400">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <Badge variant="outline">
                {duration} min
              </Badge>
            </div>
            <Slider
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              max={60}
              min={5}
              step={5}
            />
          </div>

          {/* Timer Display */}
          {timeRemaining > 0 && (
            <div className="text-center animate-fade-in">
              <div className="text-2xl font-bold text-purple-600 animate-pulse-gentle">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600">remaining</p>
            </div>
          )}

          {/* Play/Pause Button */}
          <Button
            onClick={isPlaying ? stopAudio : startAudio}
            className={`w-full text-lg py-6 transition-all duration-300 hover:scale-105 ${isPlaying
              ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              } animate-fade-in delay-500`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-6 w-6 mr-3" />
                Stop Session
              </>
            ) : (
              <>
                <Play className="h-6 w-6 mr-3" />
                Start Session
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale delay-200">
        <CardHeader>
          <CardTitle>Frequency Presets</CardTitle>
          <p className="text-sm text-gray-600">
            Choose a preset for specific mental states
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {frequencyPresets.map((preset, index) => (
            <div
              key={preset.name}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-lg animate-fade-in ${selectedPreset === preset.name
                ? "border-purple-400 bg-purple-50 shadow-lg scale-105"
                : "border-gray-200 bg-white/60 backdrop-blur-sm hover:border-gray-300"
                }`}
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => selectPreset(preset)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${preset.color} text-white animate-pulse-gentle`}>
                  {preset.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{preset.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {preset.frequency} Hz
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {preset.benefits.map((benefit, benefitIndex) => (
                      <Badge
                        key={benefitIndex}
                        variant="secondary"
                        className="text-xs animate-fade-in"
                        style={{ animationDelay: `${(index * 150) + (benefitIndex * 50)}ms` }}
                      >
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
            <div className="flex items-start gap-2">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">How it works</h4>
                <p className="text-sm text-blue-700">
                  Binaural beats are created when slightly different frequencies are played in each ear.
                  Your brain perceives the difference as a rhythmic beat that can influence brainwave patterns.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BineuralBeats;
