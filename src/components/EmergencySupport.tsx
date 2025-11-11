
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Phone, MessageSquare, Heart, ExternalLink, MapPin, Info } from "lucide-react";
import { toast } from "sonner";

interface EmergencyResource {
  id: string;
  name: string;
  description: string;
  contactMethod: "phone" | "text" | "chat" | "location";
  contact: string;
  hours: string;
  category: "crisis" | "general" | "youth" | "veterans";
  urgent?: boolean;
}

const EmergencySupport = () => {
  const [zipCode, setZipCode] = useState("");
  const [showLocalResources, setShowLocalResources] = useState(false);

  const emergencyResources: EmergencyResource[] = [
    {
      id: "988",
      name: "988 Suicide & Crisis Lifeline",
      description: "Free and confidential support for people in distress, and prevention and crisis resources.",
      contactMethod: "phone",
      contact: "988",
      hours: "24/7",
      category: "crisis",
      urgent: true
    },
    {
      id: "crisis-text",
      name: "Crisis Text Line",
      description: "Free, 24/7 text support with a trained Crisis Counselor.",
      contactMethod: "text",
      contact: "HOME to 741741",
      hours: "24/7",
      category: "crisis",
      urgent: true
    },
    {
      id: "samhsa",
      name: "SAMHSA's National Helpline",
      description: "Treatment referral and information service for individuals and families facing mental health challenges.",
      contactMethod: "phone",
      contact: "1-800-662-4357",
      hours: "24/7",
      category: "general"
    },
    {
      id: "trevor",
      name: "The Trevor Project",
      description: "Crisis intervention and suicide prevention services for LGBTQ+ young people under 25.",
      contactMethod: "phone",
      contact: "1-866-488-7386",
      hours: "24/7",
      category: "youth"
    },
    {
      id: "veterans",
      name: "Veterans Crisis Line",
      description: "Connects veterans and their families with qualified VA responders.",
      contactMethod: "phone",
      contact: "988, Press 1",
      hours: "24/7",
      category: "veterans"
    },
    {
      id: "warmline",
      name: "National Warmline Network",
      description: "Emotional support and connection when you're not in crisis but need to talk.",
      contactMethod: "phone",
      contact: "Find local number",
      hours: "Varies by location",
      category: "general"
    }
  ];

  const calmingStrategies = [
    {
      name: "Deep Breathing",
      description: "Inhale for 4 counts, hold for 7, exhale for 8. Repeat 5 times.",
      icon: <Heart className="h-5 w-5" />
    },
    {
      name: "5-4-3-2-1 Grounding",
      description: "Identify 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
      icon: <MapPin className="h-5 w-5" />
    },
    {
      name: "Progressive Relaxation",
      description: "Tense and release each muscle group, starting from your toes and working up.",
      icon: <Heart className="h-5 w-5" />
    },
    {
      name: "Mental Vacation",
      description: "Visualize a peaceful, safe place for 5 minutes using all your senses.",
      icon: <ExternalLink className="h-5 w-5" />
    }
  ];

  const findLocalResources = () => {
    if (zipCode.length === 5 && !isNaN(Number(zipCode))) {
      setShowLocalResources(true);
      toast.success(`Found resources near ${zipCode}`);
    } else {
      toast.error("Please enter a valid 5-digit ZIP code");
    }
  };

  return (
    <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
      <CardHeader className="bg-red-50 border-b border-red-100">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
          Emergency Support
        </CardTitle>
        <p className="text-sm text-gray-600">
          Immediate resources for mental health crises
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Urgent Resources */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 animate-fade-in">
          <h3 className="font-medium text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            If you are in immediate danger, call 911 or go to your nearest emergency room
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emergencyResources
              .filter(resource => resource.urgent)
              .map((resource) => (
                <div key={resource.id} className="bg-white p-3 rounded-md shadow-sm animate-fade-in">
                  <h4 className="font-medium text-gray-800 mb-1">{resource.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {resource.hours}
                    </Badge>
                    <Button size="sm" variant="destructive" className="gap-1 text-xs">
                      {resource.contactMethod === "phone" ? (
                        <Phone className="h-3 w-3" />
                      ) : resource.contactMethod === "text" ? (
                        <MessageSquare className="h-3 w-3" />
                      ) : (
                        <MessageSquare className="h-3 w-3" />
                      )}
                      {resource.contact}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Immediate Coping Strategies */}
        <div className="space-y-3 animate-fade-in delay-200">
          <h3 className="font-medium text-gray-800">Immediate Coping Strategies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calmingStrategies.map((strategy, index) => (
              <div
                key={strategy.name}
                className="bg-white/60 backdrop-blur-sm p-3 rounded-md shadow-sm animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded bg-blue-100 text-blue-800">
                    {strategy.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">{strategy.name}</h4>
                    <p className="text-xs text-gray-600">{strategy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ZIP Code Resources */}
        <div className="space-y-3 animate-fade-in delay-400">
          <h3 className="font-medium text-gray-800">Find Local Resources</h3>
          <div className="flex items-center gap-2">
            <Input
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter ZIP code"
              className="bg-white/60 backdrop-blur-sm"
              maxLength={5}
            />
            <Button onClick={findLocalResources} disabled={zipCode.length !== 5 || isNaN(Number(zipCode))}>
              Find
            </Button>
          </div>
          {showLocalResources && (
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-md shadow-sm animate-fade-in">
              <h4 className="font-medium text-gray-800">Resources near {zipCode}</h4>
              <ul className="text-sm space-y-2 mt-2">
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-green-100 text-green-800">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="font-medium">City Mental Health Center</div>
                    <div className="text-xs text-gray-600">123 Main St, City, State</div>
                    <div className="text-xs text-gray-600">Phone: (555) 123-4567</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-green-100 text-green-800">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="font-medium">Community Support Group</div>
                    <div className="text-xs text-gray-600">456 Oak Ave, City, State</div>
                    <div className="text-xs text-gray-600">Phone: (555) 987-6543</div>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* General Resources */}
        <div className="space-y-3 animate-fade-in delay-500">
          <h3 className="font-medium text-gray-800">More Support Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emergencyResources
              .filter(resource => !resource.urgent)
              .map((resource) => (
                <div 
                  key={resource.id} 
                  className="bg-white/60 backdrop-blur-sm p-3 rounded-md shadow-sm animate-fade-in hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-gray-800 mb-1">{resource.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {resource.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {resource.hours}
                      </Badge>
                      <Button size="sm" variant="ghost" className="gap-1 text-xs">
                        {resource.contactMethod === "phone" ? (
                          <Phone className="h-3 w-3" />
                        ) : resource.contactMethod === "text" ? (
                          <MessageSquare className="h-3 w-3" />
                        ) : (
                          <Info className="h-3 w-3" />
                        )}
                        {resource.contact}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 animate-fade-in delay-700">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Remember</h4>
              <p className="text-sm text-blue-700">
                It's okay to ask for help. Mental health emergencies are real emergencies. 
                Reaching out shows strength, not weakness. You are not alone.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencySupport;
