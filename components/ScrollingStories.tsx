"use client";

import { useEffect, useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

interface Story {
  id: string;
  username: string;
  message: string;
  duration: string;
  yPosition: number;
  speed: number;
  startTime: number;
}

const storyTemplates = [
  {
    username: "brave_phoenix_2847",
    message: "When they passed the law, I knew everything would change. My wife and I had been together for 12 years...",
    duration: "1:32",
  },
  {
    username: "quiet_storm_9183",
    message: "The looks started first. Then the whispers. Being non-binary in a small town was never easy, but now...",
    duration: "1:45",
  },
  {
    username: "gentle_warrior_3621",
    message: "I lost my job today. They didn't say it was because I'm trans, but we all knew. Twenty years of perfect reviews...",
    duration: "1:28",
  },
  {
    username: "fierce_hope_7429",
    message: "My students need me, but the new policies make it impossible to be myself. How do I choose between my identity and my calling?",
    duration: "1:51",
  },
  {
    username: "resilient_soul_1847",
    message: "The pharmacy refused my prescription again. Third time this month. They say it's 'policy changes' but I know what it really is...",
    duration: "1:39",
  },
  {
    username: "wild_courage_5932",
    message: "My parents finally understand. It took years, but yesterday my dad used my real name for the first time...",
    duration: "1:44",
  },
  {
    username: "tender_rebel_8264",
    message: "The support group saved my life. When everything else fell apart, they were there. We protect each other now...",
    duration: "1:36",
  },
  {
    username: "bold_spirit_1738",
    message: "I wear my pins proudly. Every day is an act of resistance. They want us invisible, but I refuse to hide...",
    duration: "1:41",
  },
  {
    username: "steady_voice_4892",
    message: "The clinic closed last month. Now I drive three hours for care that used to be ten minutes away...",
    duration: "1:23",
  },
  {
    username: "bright_soul_7263",
    message: "My teenager came out last week. In this climate, I'm terrified and proud at the same time...",
    duration: "1:38",
  },
  {
    username: "quiet_strength_9471",
    message: "They removed all the books. Every single one. The library feels empty without our stories...",
    duration: "1:29",
  },
  {
    username: "fierce_light_3847",
    message: "I'm a teacher. I can't say 'partner' anymore. Thirty years of love reduced to 'roommate'...",
    duration: "1:42",
  },
];

function generateRandomStory(index: number): Story {
  const template = storyTemplates[index % storyTemplates.length];
  const speeds = [50, 55, 60, 65, 70];
  const yPositions = [5, 15, 25, 35, 45, 55, 65, 75, 85];
  
  return {
    id: `story-${Date.now()}-${Math.random()}`,
    username: template.username,
    message: template.message,
    duration: template.duration,
    yPosition: yPositions[Math.floor(Math.random() * yPositions.length)],
    speed: speeds[Math.floor(Math.random() * speeds.length)],
    startTime: Date.now(),
  };
}

export function ScrollingStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const storyIndexRef = useRef(0);

  useEffect(() => {
    // Initialize with more stories visible
    const initialStories = Array.from({ length: 8 }, (_, i) => {
      const story = generateRandomStory(i);
      // Stagger stories across the screen
      story.startTime = Date.now() - (i * 2500);
      return story;
    });
    setStories(initialStories);

    // Add new stories more frequently
    const interval = setInterval(() => {
      const newStory = generateRandomStory(storyIndexRef.current++);
      setStories(prev => [...prev, newStory]);
      
      // Clean up old stories after they've scrolled off
      setTimeout(() => {
        setStories(prev => prev.filter(s => s.id !== newStory.id));
      }, 70000);
    }, 3000); // Add new story every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.15] dark:opacity-[0.07]">
      {stories.map((story) => (
          <div
            key={story.id}
            className="absolute whitespace-nowrap"
            style={{
              top: `${story.yPosition}%`,
              animation: `scroll ${story.speed}s linear infinite, fadeIn 3s ease-out`,
            }}
          >
            <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 shadow-lg p-6">
              {/* Username */}
              <span className="font-mono text-sm font-bold">
                {story.username}
              </span>
              
              {/* Message preview */}
              <p className="text-sm max-w-md truncate">
                {story.message}
              </p>
              
              {/* Audio player */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2">
                <Play className="w-3 h-3" />
                <div className="w-24 h-1 bg-gray-300 dark:bg-gray-600">
                  <div 
                    className="h-full bg-gray-600 dark:bg-gray-400"
                    style={{ width: "35%" }}
                  />
                </div>
                <span className="text-xs">{story.duration}</span>
              </div>
            </div>
          </div>
      ))}
      
      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(100vw);
          }
          to {
            transform: translateX(-200vw);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
      `}</style>
    </div>
  );
}