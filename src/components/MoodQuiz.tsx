
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TestTube, Brain, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface QuizQuestion {
  id: number;
  question: string;
  options: { text: string; value: number }[];
}

interface MoodQuizProps {
  onMoodResult: (mood: number) => void;
}

const MoodQuiz = ({ onMoodResult }: MoodQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [moodScore, setMoodScore] = useState(0);
  const [quizHistory, setQuizHistory] = useState<Array<{ date: string; score: number; mood: string }>>([]);

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/mood/quiz/history", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === "success") {
        setQuizHistory(data.data.map((item: any) => ({
          ...item,
          // Format date if needed, or backend can return formatted
          // Assuming backend returns a somewhat usable date string or we format it here
          date: new Date(item.date).toLocaleDateString()
        })));
      }
    } catch (error) {
      console.error("Failed to fetch quiz history", error);
    }
  };

  const saveQuizResult = async (score: number, moodLabel: string, answers: { q: number; v: number }[]) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const response = await fetch("http://localhost:5000/api/mood/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ score, moodLabel, answers })
      });

      const data = await response.json();
      if (data.status === "success") {
        // Refresh history after saving
        fetchQuizHistory();
      } else {
        toast.error("Failed to save quiz result");
      }

    } catch (error) {
      console.error("Failed to save quiz result", error);
      toast.error("Error saving result");
    }
  }

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "How well did you sleep last night?",
      options: [
        { text: "Very poorly - barely slept", value: 1 },
        { text: "Poorly - restless sleep", value: 2 },
        { text: "Okay - some interruptions", value: 3 },
        { text: "Well - mostly good sleep", value: 4 },
        { text: "Excellent - deep, restful sleep", value: 5 }
      ]
    },
    {
      id: 2,
      question: "How is your energy level right now?",
      options: [
        { text: "Completely drained", value: 1 },
        { text: "Very low energy", value: 2 },
        { text: "Moderate energy", value: 3 },
        { text: "Good energy", value: 4 },
        { text: "High energy, feeling great", value: 5 }
      ]
    },
    {
      id: 3,
      question: "How are you feeling about social interactions today?",
      options: [
        { text: "Want to avoid everyone", value: 1 },
        { text: "Prefer to be alone", value: 2 },
        { text: "Neutral about socializing", value: 3 },
        { text: "Looking forward to talking to people", value: 4 },
        { text: "Excited to connect with others", value: 5 }
      ]
    },
    {
      id: 4,
      question: "How optimistic do you feel about today?",
      options: [
        { text: "Very pessimistic", value: 1 },
        { text: "Somewhat negative", value: 2 },
        { text: "Neutral", value: 3 },
        { text: "Somewhat positive", value: 4 },
        { text: "Very optimistic", value: 5 }
      ]
    },
    {
      id: 5,
      question: "How well can you concentrate right now?",
      options: [
        { text: "Can't focus at all", value: 1 },
        { text: "Very difficult to focus", value: 2 },
        { text: "Some difficulty focusing", value: 3 },
        { text: "Can focus pretty well", value: 4 },
        { text: "Excellent concentration", value: 5 }
      ]
    }
  ];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete
      const totalScore = newAnswers.reduce((sum, score) => sum + score, 0);
      const averageScore = totalScore / quizQuestions.length;
      const percentageScore = (averageScore / 5) * 100;

      const finalScore = Math.round(percentageScore);
      const moodLabel = getMoodLabel(finalScore);

      setMoodScore(finalScore);
      setQuizComplete(true);
      onMoodResult(Math.round(averageScore));

      // Construct answers payload
      const answersPayload = newAnswers.map((val, index) => ({
        q: quizQuestions[index].id,
        v: val
      }));

      saveQuizResult(finalScore, moodLabel, answersPayload);

      toast.success(`Quiz completed! Your mood score: ${finalScore}%`);
    }
  };

  const getMoodLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Great";
    if (score >= 40) return "Good";
    if (score >= 20) return "Okay";
    return "Low";
  };

  const getMoodColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    if (score >= 20) return "text-orange-600";
    return "text-red-600";
  };

  const getMoodBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-blue-100";
    if (score >= 40) return "bg-yellow-100";
    if (score >= 20) return "bg-orange-100";
    return "bg-red-100";
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizComplete(false);
    setMoodScore(0);
  };

  const progress = ((currentQuestion + (quizComplete ? 1 : 0)) / quizQuestions.length) * 100;

  if (quizComplete) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results */}
        <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Your Mood Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getMoodColor(moodScore)} animate-bounce-gentle`}>
                {moodScore}%
              </div>
              <div className={`text-xl font-semibold ${getMoodColor(moodScore)} mt-2`}>
                {getMoodLabel(moodScore)}
              </div>
              <div className={`inline-block px-4 py-2 rounded-full ${getMoodBgColor(moodScore)} ${getMoodColor(moodScore)} mt-4 animate-fade-in`}>
                Based on your responses
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Recommendations:</h3>
              <div className="space-y-2">
                {moodScore >= 80 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                    <p className="text-green-800 text-sm">🎉 You're doing great! Keep up the positive momentum with activities you enjoy.</p>
                  </div>
                )}
                {moodScore >= 60 && moodScore < 80 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
                    <p className="text-blue-800 text-sm">👍 Good mood! Consider some light exercise or connecting with friends to boost it further.</p>
                  </div>
                )}
                {moodScore >= 40 && moodScore < 60 && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 animate-fade-in">
                    <p className="text-yellow-800 text-sm">💭 Consider some self-care activities like meditation, listening to music, or taking a walk.</p>
                  </div>
                )}
                {moodScore < 40 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 animate-fade-in">
                    <p className="text-red-800 text-sm">🤗 Take it easy today. Try our relaxation tools or consider reaching out to a friend or our AI support.</p>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={restartQuiz}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Take Quiz Again
            </Button>
          </CardContent>
        </Card>

        {/* History Chart */}
        <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale delay-200">
          <CardHeader>
            <CardTitle>Mood Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quizHistory.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [`${value}%`, "Mood Score"]}
                />
                <Bar
                  dataKey="score"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-500 animate-bounce" />
          Quick Mood Assessment
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 animate-fade-in" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="animate-fade-in-up">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {quizQuestions[currentQuestion].question}
          </h3>

          <div className="space-y-3">
            {quizQuestions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option.value)}
                variant="outline"
                className="w-full text-left justify-start p-4 h-auto bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 animate-fade-in hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 opacity-0 transition-opacity duration-200 hover:opacity-100"></div>
                  </div>
                  <span className="text-sm leading-relaxed">{option.text}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 animate-fade-in">
          <Brain className="h-4 w-4" />
          <span>Choose the option that best describes how you feel right now</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodQuiz;
