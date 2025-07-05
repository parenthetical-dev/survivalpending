'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause } from 'lucide-react';

interface Story {
  _id: string;
  username: string;
  contentSanitized: string;
  audioUrl?: string;
  createdAt: string;
  voiceSettings?: {
    voiceName: string;
  };
}

interface FeaturedStoriesProps {
  stories?: Story[];
  position?: 'above' | 'below';
  showPlaceholders?: boolean;
}

// Placeholder stories for development/preview
const placeholderStories: Story[] = [
  {
    _id: 'placeholder-1',
    username: 'brave_phoenix_4823',
    contentSanitized: "I came out to my family last week. It didn't go as planned. My dad hasn't spoken to me since, but my little sister secretly hugged me and whispered 'I love you no matter what.' That moment gave me hope. Even in the darkness, there's light. I'm documenting this because our stories matter, our love is real, and we deserve to exist openly.",
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Sample audio for demo
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    voiceSettings: {
      voiceName: 'Stella'
    }
  },
  {
    _id: 'placeholder-2',
    username: 'resilient_oak_7391',
    contentSanitized: "Twenty years of marriage, two kids, and I finally found the courage to be myself. Starting HRT next month at 47. My wife is my biggest supporter. My teens said 'We already knew, Mom. We love you.' I'm terrified and exhilarated. This is my truth: it's never too late to be who you really are. We're not going anywhere.",
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Sample audio for demo
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
    voiceSettings: {
      voiceName: 'River'
    }
  }
];

function AudioPlayer({ audioUrl, storyId }: { audioUrl: string; storyId: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setProgress(percentage * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
      <audio ref={audioRef} src={audioUrl} />
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        
        <div className="flex-1">
          <div 
            className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer relative"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
          {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

export function FeaturedStories({ stories, position = 'below', showPlaceholders = false }: FeaturedStoriesProps) {
  // Use placeholder stories if no stories provided or showPlaceholders is true
  const displayStories = showPlaceholders || !stories || stories.length === 0 
    ? placeholderStories 
    : stories;

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const storyDate = new Date(date);
    const diff = now.getTime() - storyDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return 'just now';
  };

  if (!displayStories || displayStories.length === 0) return null;

  return (
    <div className={cn(
      "w-full max-w-6xl mx-auto px-6 md:px-4",
      position === 'above' ? "mb-8 md:mb-12" : "mt-12 md:mt-16"
    )}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {displayStories.map((story) => (
          <div
            key={story._id}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-mono text-xs">{story.username}</span>
                <span>•</span>
                <span>{getTimeAgo(story.createdAt)}</span>
              </div>
            </div>
            
            <p className="text-gray-800 dark:text-gray-200 text-sm md:text-base leading-relaxed line-clamp-4">
              {story.contentSanitized}
            </p>
            
            {story.voiceSettings?.voiceName && (
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Voice: {story.voiceSettings.voiceName}
              </div>
            )}
            
            {story.audioUrl && (
              <AudioPlayer audioUrl={story.audioUrl} storyId={story._id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}