import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// safe env read for many bundlers
const API_BASE =
  // Vite
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) ||
  // Next.js / CRA modern
  (typeof import.meta !== "undefined" && (import.meta as any).env?.NEXT_PUBLIC_API_BASE) ||
  // Default to local backend in development for convenience
  (typeof import.meta !== "undefined" && (import.meta as any).env?.MODE === "development" ? "http://localhost:5000" : "");

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Minimal fetch to your backend
  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      const trimmed = userMessage.trim();
      if (!trimmed) return "Please tell me something you'd like to talk about.";

      const base = API_BASE || "";
      const res = await fetch(`${base}/api/pirate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.ok) {
        // simple fallback
        return "I'm here to listen. Can you tell me more about how you're feeling?";
      }

      const data = await res.json();
      return (data?.answer as string) || "I'm here to listen. Can you tell me more about how you're feeling?";
    } catch (err) {
      console.error("Network error:", err);
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
      const responseText = await generateResponse(inputMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to listen. Sometimes I might take a moment to respond, but I'm always here for you.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          AI Support Chat
        </CardTitle>
        <p className="text-sm text-gray-600">A safe space to share your thoughts and feelings</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: "440px" }}>
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`p-2 rounded-full ${message.sender === "user" ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gradient-to-r from-green-400 to-blue-500"}`}>
                {message.sender === "user" ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
              </div>
              <div className={`max-w-[75%] p-3 rounded-xl ${message.sender === "user" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : "bg-white/60 backdrop-blur-sm text-gray-800"} shadow-sm`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-1 opacity-70 ${message.sender === "user" ? "text-white" : "text-gray-500"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

        <div className="flex gap-2 mt-2">
          <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Share your thoughts or feelings..." className="flex-1 bg-white/60 backdrop-blur-sm" disabled={isLoading} />
          <Button onClick={sendMessage} disabled={!inputMessage.trim() || isLoading} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatSupport;
