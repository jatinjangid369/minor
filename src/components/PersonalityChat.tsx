
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Bot, Loader2, Brain, Heart } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface PersonalityType {
  type: string;
  description: string;
  traits: string[];
  communicationStyle: string;
}

const PersonalityChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [personalityType, setPersonalityType] = useState<PersonalityType | null>(null);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const personalityQuestions = [
    "How do you typically handle stressful situations?",
    "What energizes you more: social interactions or quiet time alone?",
    "When making decisions, do you rely more on logic or your feelings?",
    "Do you prefer structured plans or flexible, spontaneous approaches?",
    "How do you process new information best?"
  ];

  const personalityTypes: Record<string, PersonalityType> = {
    analytical: {
      type: "Analytical Thinker",
      description: "You prefer logical, structured approaches to problems",
      traits: ["Detail-oriented", "Systematic", "Objective"],
      communicationStyle: "I'll provide you with clear, evidence-based guidance and practical steps."
    },
    empathetic: {
      type: "Empathetic Supporter",
      description: "You're highly attuned to emotions and relationships",
      traits: ["Compassionate", "Intuitive", "People-focused"],
      communicationStyle: "I'll focus on understanding your feelings and providing emotional support."
    },
    creative: {
      type: "Creative Explorer",
      description: "You think outside the box and value innovation",
      traits: ["Imaginative", "Flexible", "Open-minded"],
      communicationStyle: "I'll offer creative solutions and encourage exploration of new perspectives."
    },
    practical: {
      type: "Practical Problem-Solver",
      description: "You focus on realistic, actionable solutions",
      traits: ["Results-oriented", "Efficient", "Direct"],
      communicationStyle: "I'll give you straightforward advice and actionable strategies."
    }
  };

  useEffect(() => {
    if (!assessmentComplete) {
      startPersonalityAssessment();
    }
    // scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startPersonalityAssessment = () => {
    const welcomeMessage: Message = {
      id: "welcome",
      text: "Hello! I'm Dr. Mind, your AI psychiatrist. To provide you with the best support, I'd like to understand your personality type first. I'll ask you 5 quick questions. Are you ready to begin?",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const analyzePersonality = (responses: string[]) => {
    const keywords = {
      analytical: ["logic", "think", "analyze", "plan", "systematic", "data", "facts"],
      empathetic: ["feel", "emotions", "people", "relationships", "heart", "care", "support"],
      creative: ["creative", "new", "different", "imagine", "explore", "possibilities"],
      practical: ["practical", "realistic", "action", "results", "efficient", "direct"]
    };

    const scores = Object.keys(keywords).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<string, number>);

    responses.forEach(response => {
      const lowerResponse = response.toLowerCase();
      Object.entries(keywords).forEach(([type, words]) => {
        words.forEach(word => {
          if (lowerResponse.includes(word)) {
            scores[type]++;
          }
        });
      });
    });

    const dominantType = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];

    return personalityTypes[dominantType] || personalityTypes.empathetic;
  };

  const generatePersonalizedResponse = (userMessage: string) => {
    if (!personalityType) return "Please complete the personality assessment first.";

    const responses = {
      analytical: {
        anxious: "Based on cognitive behavioral therapy principles, anxiety often stems from thought patterns. Let's identify the specific triggers and develop a systematic approach to manage them. What specific situations tend to increase your anxiety levels?",
        sad: "Research shows that sadness often correlates with specific thought patterns and behaviors. Let's examine the data - when did these feelings start, and what patterns can we identify in your daily activities?",
        happy: "It's excellent that you're experiencing positive emotions. Studies indicate that maintaining happiness involves consistent practices. What specific activities or thoughts contributed to this positive state?",
        general: "Let's approach this systematically. Can you break down the situation into smaller, manageable components so we can analyze each aspect?"
      },
      empathetic: {
        anxious: "I can sense the weight you're carrying right now. Anxiety can feel overwhelming, but please know that you're not alone in this journey. Your feelings are completely valid. What would feel most supportive for you right now?",
        sad: "I hear the pain in your words, and I want you to know that it's okay to feel this way. Sadness is a natural human emotion, and you're brave for reaching out. How can I best support you through this difficult time?",
        happy: "Your joy is contagious! I'm so grateful you're sharing this beautiful moment with me. These positive feelings deserve to be celebrated and cherished. What's bringing you the most happiness today?",
        general: "I'm here to listen with my whole heart. Your experiences and feelings matter deeply. Please feel free to share whatever is on your mind - this is a safe space for you."
      },
      creative: {
        anxious: "Anxiety can sometimes be our mind's way of protecting us, but it can also limit our potential. Let's explore some creative visualization techniques or perhaps try a different perspective on your situation. What if we imagined your anxiety as a character - what would it look like?",
        sad: "Sometimes sadness opens doorways to deeper understanding and growth. While it's difficult, there might be hidden gifts in this experience. Would you like to explore some creative expression as a way to process these feelings?",
        happy: "What a wonderful energy you're radiating! Happiness often sparks creativity and new possibilities. How might you channel this positive energy into something meaningful or creative?",
        general: "Every challenge is an opportunity for creative problem-solving. Let's think outside the conventional approaches - what unconventional solutions might we explore together?"
      },
      practical: {
        anxious: "Anxiety is manageable with the right tools and strategies. Let's focus on practical steps: breathing exercises, identifying triggers, and creating an action plan. What specific situations cause you the most anxiety?",
        sad: "Sadness is temporary, and there are concrete steps we can take to improve your mood. Let's create a practical plan: daily activities, social connections, and self-care routines. What's one small action you can take today?",
        happy: "Great! Let's maintain this positive momentum with practical strategies. Consistency is key - what daily habits or activities help sustain your happiness?",
        general: "Let's cut straight to solutions. What's the main issue you're facing, and what specific outcome are you hoping to achieve? We can create a step-by-step action plan."
      }
    };

    const typeResponses = responses[personalityType.type.toLowerCase().split(' ')[0] as keyof typeof responses] || responses.empathetic;
    const message = userMessage.toLowerCase();

    if (message.includes('anxious') || message.includes('anxiety') || message.includes('worry')) {
      return typeResponses.anxious;
    } else if (message.includes('sad') || message.includes('depressed') || message.includes('down')) {
      return typeResponses.sad;
    } else if (message.includes('happy') || message.includes('good') || message.includes('great')) {
      return typeResponses.happy;
    } else {
      return typeResponses.general;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    setTimeout(() => {
      let response: string;

      if (!assessmentComplete) {
        if (currentQuestion < personalityQuestions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
          response = personalityQuestions[currentQuestion + 1];
        } else {
          // Assessment complete
          const userResponses = messages.filter(m => m.sender === "user").map(m => m.text);
          const detectedPersonality = analyzePersonality(userResponses);
          setPersonalityType(detectedPersonality);
          setAssessmentComplete(true);
          
          response = `Thank you for completing the assessment! Based on your responses, I've identified you as a **${detectedPersonality.type}**. ${detectedPersonality.description}. ${detectedPersonality.communicationStyle} How can I support you today?`;
        }
      } else {
        response = generatePersonalizedResponse(inputMessage);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const resetAssessment = () => {
    setMessages([]);
    setPersonalityType(null);
    setAssessmentComplete(false);
    setCurrentQuestion(0);
    startPersonalityAssessment();
    toast.success("Assessment reset! Let's start fresh.");
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg h-[700px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <CardTitle>AI Psychiatrist - Dr. Mind</CardTitle>
          </div>
          {personalityType && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="animate-fade-in">
                {personalityType.type}
              </Badge>
              <Button variant="outline" size="sm" onClick={resetAssessment}>
                Reset
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {personalityType 
            ? `Personalized support for your ${personalityType.type.toLowerCase()} personality`
            : "Personality assessment in progress..."
          }
        </p>
        {personalityType && (
          <div className="flex flex-wrap gap-1 mt-2">
            {personalityType.traits.map((trait, index) => (
              <Badge key={index} variant="outline" className="text-xs animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                {trait}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 animate-fade-in ${
                message.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                }`}
              >
                {message.sender === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Brain className="h-4 w-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[75%] p-3 rounded-xl ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-white/60 backdrop-blur-sm text-gray-800"
                } shadow-sm`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p
                  className={`text-xs mt-1 opacity-70 ${
                    message.sender === "user" ? "text-white" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  <p className="text-sm text-gray-600">Dr. Mind is analyzing...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder={
              !assessmentComplete 
                ? "Answer the assessment question..."
                : "Share your thoughts with Dr. Mind..."
            }
            className="flex-1 bg-white/60 backdrop-blur-sm"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalityChat;
