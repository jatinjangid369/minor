
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Brain, Heart, Zap, Timer, Play, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  type: "physical" | "mental" | "breathing";
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  benefits: string[];
  instructions: string[];
  icon: React.ReactNode;
  color: string;
}

const ExerciseRecommendations = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const exercises: Exercise[] = [
    {
      id: "deep-breathing",
      name: "4-7-8 Breathing",
      type: "breathing",
      duration: "5 min",
      difficulty: "easy",
      description: "A powerful breathing technique to reduce anxiety and promote relaxation",
      benefits: ["Reduces anxiety", "Improves sleep", "Calms nervous system"],
      instructions: [
        "Sit comfortably with your back straight",
        "Exhale completely through your mouth",
        "Inhale through your nose for 4 counts",
        "Hold your breath for 7 counts",
        "Exhale through your mouth for 8 counts",
        "Repeat this cycle 4 times"
      ],
      icon: <Heart className="h-5 w-5" />,
      color: "bg-blue-500"
    },
    {
      id: "progressive-relaxation",
      name: "Progressive Muscle Relaxation",
      type: "mental",
      duration: "15 min",
      difficulty: "easy",
      description: "Systematically tense and relax muscle groups to reduce physical tension",
      benefits: ["Reduces muscle tension", "Improves body awareness", "Promotes relaxation"],
      instructions: [
        "Lie down in a comfortable position",
        "Start with your toes - tense for 5 seconds, then relax",
        "Move up to your calves, tense and relax",
        "Continue with thighs, glutes, abdomen",
        "Tense and relax arms, shoulders, and face",
        "End with deep breathing and full body relaxation"
      ],
      icon: <Brain className="h-5 w-5" />,
      color: "bg-purple-500"
    },
    {
      id: "desk-stretches",
      name: "Desk Stretches",
      type: "physical",
      duration: "10 min",
      difficulty: "easy",
      description: "Simple stretches to relieve tension from sitting at a desk",
      benefits: ["Relieves neck tension", "Improves posture", "Increases circulation"],
      instructions: [
        "Neck rolls: Gently roll your head in circles",
        "Shoulder shrugs: Lift shoulders to ears, hold, release",
        "Arm circles: Extend arms and make circles",
        "Spinal twist: Sit tall and twist gently left and right",
        "Hip flexor stretch: Step one leg back and lean forward",
        "Hold each stretch for 30 seconds"
      ],
      icon: <Dumbbell className="h-5 w-5" />,
      color: "bg-green-500"
    },
    {
      id: "mindful-walking",
      name: "Mindful Walking",
      type: "mental",
      duration: "20 min",
      difficulty: "medium",
      description: "Walking meditation to connect with the present moment",
      benefits: ["Improves focus", "Reduces stress", "Connects with nature"],
      instructions: [
        "Choose a quiet path, indoors or outdoors",
        "Begin walking slower than your normal pace",
        "Focus on the sensation of your feet touching the ground",
        "Notice your breath and how your body moves",
        "When your mind wanders, gently return focus to walking",
        "End with a moment of gratitude"
      ],
      icon: <Brain className="h-5 w-5" />,
      color: "bg-teal-500"
    },
    {
      id: "energy-boost",
      name: "Quick Energy Boost",
      type: "physical",
      duration: "5 min",
      difficulty: "medium",
      description: "High-energy movements to increase alertness and mood",
      benefits: ["Increases energy", "Improves mood", "Boosts circulation"],
      instructions: [
        "Start with 20 jumping jacks",
        "Do 10 bodyweight squats",
        "Perform 10 push-ups (modify as needed)",
        "Add 30 seconds of high knees",
        "Finish with 10 deep breaths",
        "Hydrate and notice how you feel"
      ],
      icon: <Zap className="h-5 w-5" />,
      color: "bg-orange-500"
    },
    {
      id: "memory-game",
      name: "Memory Challenge",
      type: "mental",
      duration: "10 min",
      difficulty: "medium",
      description: "Cognitive exercises to improve memory and focus",
      benefits: ["Enhances memory", "Improves concentration", "Brain training"],
      instructions: [
        "Create a mental list of 10 items you can see",
        "Close your eyes and try to recall all 10 items",
        "Practice remembering a sequence of numbers",
        "Visualize a familiar route and describe details",
        "Try to remember what you ate yesterday",
        "Practice word associations for 5 minutes"
      ],
      icon: <Brain className="h-5 w-5" />,
      color: "bg-indigo-500"
    }
  ];

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentStep(0);
    setIsActive(true);
    toast.success(`Started ${exercise.name}`);
  };

  const nextStep = () => {
    if (selectedExercise && currentStep < selectedExercise.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeExercise();
    }
  };

  const completeExercise = () => {
    if (selectedExercise) {
      setCompletedExercises(prev => [...prev, selectedExercise.id]);
      toast.success(`Completed ${selectedExercise.name}! Great job! 🎉`);
    }
    setSelectedExercise(null);
    setIsActive(false);
    setCurrentStep(0);
  };

  const stopExercise = () => {
    setSelectedExercise(null);
    setIsActive(false);
    setCurrentStep(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "physical": return "bg-orange-100 text-orange-800";
      case "mental": return "bg-purple-100 text-purple-800";
      case "breathing": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isActive && selectedExercise) {
    return (
      <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className={`p-1 rounded ${selectedExercise.color} text-white`}>
                {selectedExercise.icon}
              </div>
              {selectedExercise.name}
            </CardTitle>
            <Button onClick={stopExercise} variant="outline" size="sm">
              Stop
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getTypeColor(selectedExercise.type)}>
              {selectedExercise.type}
            </Badge>
            <Badge variant="outline">
              <Timer className="h-3 w-3 mr-1" />
              {selectedExercise.duration}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center animate-fade-in">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              Step {currentStep + 1} of {selectedExercise.instructions.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / selectedExercise.instructions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl animate-fade-in-scale">
            <p className="text-lg text-gray-800 leading-relaxed text-center">
              {selectedExercise.instructions[currentStep]}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={nextStep}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-300 hover:scale-105"
            >
              {currentStep < selectedExercise.instructions.length - 1 ? (
                <>Next Step</>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Exercise
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 animate-fade-in">
            Take your time with each step. Listen to your body and breathe deeply.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-green-500 animate-bounce" />
          Exercise Recommendations
        </CardTitle>
        <p className="text-sm text-gray-600">
          Physical and mental exercises to boost your wellbeing
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer animate-fade-in ${
                completedExercises.includes(exercise.id)
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 bg-white/60 backdrop-blur-sm hover:border-gray-300"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => startExercise(exercise)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${exercise.color} text-white animate-pulse-gentle`}>
                  {exercise.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      {exercise.name}
                      {completedExercises.includes(exercise.id) && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge className={getTypeColor(exercise.type)} variant="secondary">
                      {exercise.type}
                    </Badge>
                    <Badge className={getDifficultyColor(exercise.difficulty)} variant="secondary">
                      {exercise.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {exercise.duration}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {exercise.benefits.slice(0, 2).map((benefit, benefitIndex) => (
                      <Badge
                        key={benefitIndex}
                        variant="outline"
                        className="text-xs animate-fade-in"
                        style={{ animationDelay: `${(index * 100) + (benefitIndex * 50)}ms` }}
                      >
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button size="sm" variant="ghost" className="text-xs w-full">
                    <Play className="h-3 w-3 mr-1" />
                    Start Exercise
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {completedExercises.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">Great Progress!</h4>
                <p className="text-sm text-green-700">
                  You've completed {completedExercises.length} exercise{completedExercises.length !== 1 ? 's' : ''} today. 
                  Keep up the excellent work!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
          <div className="flex items-start gap-2">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Exercise Benefits</h4>
              <p className="text-sm text-blue-700">
                Regular physical and mental exercises can reduce stress hormones, increase endorphins, 
                improve cognitive function, and boost overall mental health.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseRecommendations;
