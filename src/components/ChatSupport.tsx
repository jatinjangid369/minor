import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User, Loader2 } from "lucide-react";
import { pipeline } from "@huggingface/transformers";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatSupport = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm here to listen and support you. How are you feeling today? Feel free to share what's on your mind.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiPipeline, setAiPipeline] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAI();
  }, []);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeAI = async () => {
    try {
      console.log("Initializing AI pipeline...");
      // Initialize a text generation pipeline for conversational responses
      const pipe = await pipeline("text-generation", "microsoft/DialoGPT-medium", {
        device: "webgpu",
      });
      setAiPipeline(pipe);
      console.log("AI pipeline initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AI:", error);
      // Fallback to rule-based responses if AI fails
      toast.error("AI features are loading. Using fallback responses for now.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
  try {
    const res = await fetch("http://localhost:8000/peacebot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_input: userMessage,
        context: messages.map((msg) => ({
          role: msg.sender,
          content: msg.text,
        })),
      }),
    });

    const data = await res.json();
    return data.reply;
  } catch (error) {
    console.error("Backend error:", error);
    return "I'm here to listen. Can you tell me more about how you're feeling?";
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

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Use AI pipeline if available, otherwise use rule-based responses
      let response: string;
      
      if (aiPipeline) {
        console.log("Using AI pipeline for response");
        // For now, using rule-based responses as DialoGPT might be complex for this use case
        response = await generateResponse(inputMessage);
      } else {
        response = await generateResponse(inputMessage);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to listen. Sometimes I might take a moment to respond, but I'm always here for you. Can you tell me more about how you're feeling?",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          AI Support Chat
        </CardTitle>
        <p className="text-sm text-gray-600">
          A safe space to share your thoughts and feelings
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '440px' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                    : "bg-gradient-to-r from-green-400 to-blue-500"
                }`}
              >
                {message.sender === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[75%] p-3 rounded-xl ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-white/60 backdrop-blur-sm text-gray-800"
                } shadow-sm`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
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
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <p className="text-sm text-gray-600">Thinking...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar - sticks to bottom */}
        <div className="flex gap-2 mt-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts or feelings..."
            className="flex-1 bg-white/60 backdrop-blur-sm"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatSupport;
