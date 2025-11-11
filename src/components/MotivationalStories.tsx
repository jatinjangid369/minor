
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Pause, RotateCcw, Heart, Star, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Story {
  id: string;
  title: string;
  category: "resilience" | "growth" | "success" | "kindness" | "perseverance";
  duration: string;
  story: string[];
  lesson: string;
  affirmation: string;
  tags: string[];
}

const MotivationalStories = () => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingMode, setReadingMode] = useState<"manual" | "auto">("manual");
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);

  const stories: Story[] = [
    {
      id: "butterfly",
      title: "The Butterfly's Struggle",
      category: "growth",
      duration: "3 min",
      story: [
        "A man found a cocoon of a butterfly. One day, a small opening appeared. He sat and watched the butterfly for several hours as it struggled to force its body through that little hole.",
        "Then it seemed to stop making any progress. It appeared as if it had gotten as far as it could, and it could go no further. So the man decided to help the butterfly.",
        "He took a pair of scissors and snipped off the remaining bit of the cocoon. The butterfly then emerged easily, but it had a swollen body and small, shriveled wings.",
        "The man continued to watch the butterfly because he expected that, at any moment, the wings would enlarge and expand to be able to support the body, which would contract in time.",
        "Neither happened! In fact, the butterfly spent the rest of its life crawling around with a swollen body and shriveled wings. It never was able to fly.",
        "What the man, in his kindness and haste, did not understand was that the restricting cocoon and the struggle required for the butterfly to get through the tiny opening were necessary.",
        "The struggle was nature's way of forcing fluid from the body of the butterfly into its wings so that it would be ready for flight once it achieved its freedom from the cocoon."
      ],
      lesson: "Sometimes struggles are exactly what we need in our lives. Going through life with no obstacles would cripple us. We would not be as strong as we could have been.",
      affirmation: "I embrace challenges as opportunities for growth and transformation.",
      tags: ["Growth", "Resilience", "Patience", "Natural Process"]
    },
    {
      id: "starfish",
      title: "The Starfish Story",
      category: "kindness",
      duration: "2 min",
      story: [
        "Once upon a time, there was an old man who used to go to the ocean to do his writing. He had a habit of walking on the beach every morning before he began his work.",
        "Early one morning, he was walking along the shore after a big storm had passed and found the vast beach littered with starfish as far as the eye could see, stretching in both directions.",
        "Off in the distance, the old man noticed a small boy approaching. As the boy walked, he paused every so often and as he grew closer, the man could see that he was occasionally bending down to pick up an object and throw it into the sea.",
        "The boy came closer still and the man called out, \"Good morning! May I ask what it is that you are doing?\"",
        "The young boy paused, looked up, and replied, \"Throwing starfish into the ocean. The tide has washed them up onto the beach and they can't return to the sea by themselves. When the sun gets high, they will die, unless I throw them back into the water.\"",
        "The old man replied, \"But there must be tens of thousands of starfish on this beach. I'm afraid you won't really be able to make much of a difference.\"",
        "The boy bent down, picked up yet another starfish and threw it as far as he could into the ocean. Then he turned, smiled and said, \"It made a difference to that one!\""
      ],
      lesson: "Never underestimate the power of small actions. Every single act of kindness, no matter how small, can change someone's world.",
      affirmation: "My small acts of kindness create ripples of positive change in the world.",
      tags: ["Compassion", "Individual Impact", "Kindness", "Perspective"]
    },
    {
      id: "bamboo",
      title: "The Chinese Bamboo Tree",
      category: "perseverance",
      duration: "4 min",
      story: [
        "The Chinese bamboo tree doesn't break through the ground for the first four years. Yet, farmers water and fertilize it with the belief that the tree will eventually grow.",
        "During those four years, all the growth is happening underground, developing a root system strong enough to support the tree's potential for outward growth in the fifth year and beyond.",
        "In the fifth year, the Chinese bamboo tree grows 80 feet in just six weeks! But if the farmer had stopped watering the tree during those first four years, the tree would have died in the ground.",
        "The question is: Did the Chinese bamboo tree grow 80 feet in six weeks, or did it grow 80 feet in five years? The obvious answer is that it grew 80 feet in five years.",
        "For the first four years, the tree was growing its roots, developing a network of support for the future. Without this foundation, the tree could not have sustained its later rapid growth."
      ],
      lesson: "Success doesn't happen overnight. It requires consistent effort, patience, and faith, even when you don't see immediate results. Keep nurturing your dreams.",
      affirmation: "I trust the process of my growth, even when progress isn't immediately visible.",
      tags: ["Patience", "Perseverance", "Growth", "Faith"]
    },
    {
      id: "mayonnaise",
      title: "The Mayonnaise Jar",
      category: "success",
      duration: "3 min",
      story: [
        "A professor stood before his philosophy class with some items in front of him. When the class began, wordlessly, he picked up a very large, empty mayonnaise jar and proceeded to fill it with golf balls.",
        "He then asked the students if the jar was full. They agreed that it was. The professor then picked up a box of pebbles and poured them into the jar. He shook the jar lightly, and the pebbles rolled into the open areas between the golf balls.",
        "He then asked the students again if the jar was full. They agreed it was. The professor next picked up a box of sand and poured it into the jar. Of course, the sand filled up everything else.",
        "\"Now,\" said the professor, \"I want you to recognize that this jar represents your life. The golf balls are the important things—your family, your children, your health, your friends, and your favorite passions—things that if everything else was lost and only they remained, your life would still be full.\"",
        "\"The pebbles are the other things that matter, like your job, your house, and your car. The sand is everything else—the small stuff. If you put the sand into the jar first, there is no room for the pebbles or the golf balls.\"",
        "\"The same goes for life. If you spend all your time and energy on the small stuff, you will never have room for the things that are important to you. Pay attention to the things that are critical to your happiness.\"",
        "\"Take care of the golf balls first—the things that really matter. Set your priorities. The rest is just sand.\""
      ],
      lesson: "Focus on what truly matters in life. Don't let the minor things consume your time and energy at the expense of what's most important.",
      affirmation: "I prioritize what truly matters in my life and let go of the trivial concerns.",
      tags: ["Priorities", "Life Balance", "Values", "Focus"]
    }
  ];

  const startReading = (story: Story) => {
    setSelectedStory(story);
    setCurrentParagraph(0);
    setIsReading(true);
    toast.success(`Started reading "${story.title}"`);
  };

  const nextParagraph = () => {
    if (selectedStory && currentParagraph < selectedStory.story.length - 1) {
      setCurrentParagraph(prev => prev + 1);
    } else if (selectedStory) {
      // End of story
      stopAutoPlay();
    }
  };

  const previousParagraph = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(prev => prev - 1);
    }
  };

  const resetStory = () => {
    setCurrentParagraph(0);
    stopAutoPlay();
  };

  const startAutoPlay = () => {
    stopAutoPlay(); // Clear any existing interval
    setReadingMode("auto");
    const interval = setInterval(() => {
      setCurrentParagraph(prev => {
        if (selectedStory && prev < selectedStory.story.length - 1) {
          return prev + 1;
        } else {
          stopAutoPlay();
          return prev;
        }
      });
    }, 8000); // Change paragraph every 8 seconds
    setAutoPlayInterval(interval);
  };

  const stopAutoPlay = () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
    setReadingMode("manual");
  };

  const exitStory = () => {
    stopAutoPlay();
    setSelectedStory(null);
    setIsReading(false);
  };

  const getRandomStory = () => {
    const randomIndex = Math.floor(Math.random() * stories.length);
    startReading(stories[randomIndex]);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "resilience": return "bg-blue-100 text-blue-800";
      case "growth": return "bg-green-100 text-green-800";
      case "success": return "bg-purple-100 text-purple-800";
      case "kindness": return "bg-pink-100 text-pink-800";
      case "perseverance": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isReading && selectedStory) {
    return (
      <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              {selectedStory.title}
            </CardTitle>
            <Button onClick={exitStory} variant="outline" size="sm">
              Exit
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(selectedStory.category)}>
              {selectedStory.category}
            </Badge>
            <Badge variant="outline">
              {selectedStory.duration}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center animate-fade-in">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Paragraph {currentParagraph + 1} of {selectedStory.story.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentParagraph + 1) / selectedStory.story.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl animate-fade-in-scale min-h-[200px]">
            <p className="text-gray-800 leading-relaxed text-center">
              {selectedStory.story[currentParagraph]}
            </p>
          </div>

          {currentParagraph === selectedStory.story.length - 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-amber-800 mb-1">Lesson</h3>
                <p className="text-sm text-amber-700">{selectedStory.lesson}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-1">Affirmation</h3>
                <p className="text-sm text-blue-700 italic">"{selectedStory.affirmation}"</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-between">
            <div className="space-x-2">
              <Button
                onClick={previousParagraph}
                variant="outline"
                size="sm"
                disabled={currentParagraph === 0}
              >
                Previous
              </Button>
              <Button
                onClick={nextParagraph}
                variant="outline"
                size="sm"
                disabled={currentParagraph === selectedStory.story.length - 1}
              >
                Next
              </Button>
            </div>

            <div className="space-x-2">
              <Button
                onClick={resetStory}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              {readingMode === "manual" ? (
                <Button
                  onClick={startAutoPlay}
                  variant="outline"
                  size="sm"
                  className="bg-amber-100"
                  disabled={currentParagraph === selectedStory.story.length - 1}
                >
                  <Play className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={stopAutoPlay}
                  variant="outline"
                  size="sm"
                  className="bg-amber-100"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-500 animate-bounce" />
          Motivational Stories
        </CardTitle>
        <p className="text-sm text-gray-600">
          Short inspirational stories with powerful life lessons
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={getRandomStory} className="animate-fade-in">
            <RefreshCw className="h-4 w-4 mr-2" />
            Random Story
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="p-4 rounded-xl border-2 border-gray-200 bg-white/60 backdrop-blur-sm hover:border-amber-300 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => startReading(story)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{story.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {story.duration}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {story.story[0]}
              </p>
              <div className="flex items-center justify-between">
                <Badge className={getCategoryColor(story.category)}>
                  {story.category}
                </Badge>
                <Button size="sm" variant="ghost" className="text-xs">
                  <Play className="h-3 w-3 mr-1" />
                  Read Story
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 animate-fade-in">
          <div className="flex items-start gap-2">
            <Heart className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">The Power of Stories</h4>
              <p className="text-sm text-amber-700">
                Stories have been used throughout history to inspire, teach and heal. 
                They help us connect to our emotions, find meaning in challenges, and 
                develop resilience by learning from others' experiences.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center animate-fade-in">
          {Array.from(new Set(stories.flatMap(story => story.tags))).map((tag, index) => (
            <Badge key={tag} variant="outline" className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <Star className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MotivationalStories;
