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
}


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

// Progress Pride flag colors for the gradient
const progressFlagColors = [
  '#E40303', // Red
  '#FF8C00', // Orange
  '#FFED00', // Yellow
  '#008026', // Green
  '#24408E', // Blue
  '#732982', // Purple
  '#5BCEFA', // Light Blue
  '#F5A9B8', // Pink
  '#FFFFFF', // White
  '#613915', // Brown
];

export function FeaturedStories({ stories, position = 'below' }: FeaturedStoriesProps) {
  // Only use provided stories
  const displayStories = stories || [];

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const storyDate = new Date(date);
    const diff = now.getTime() - storyDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    return 'just now';
  };

  if (!displayStories || displayStories.length === 0) return null;

  return (
    <div className={cn(
      'w-full max-w-6xl mx-auto px-6 md:px-4',
      position === 'above' ? 'mb-8 md:mb-12' : 'mt-12 md:mt-16',
    )}>
      <style jsx>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {displayStories.map((story, index) => {
          // Select a color from the progress flag based on the story index
          const color = progressFlagColors[index % progressFlagColors.length];

          return (
            <div
              key={story._id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Animated gradient rectangle using single color */}
              <div
                className="w-full relative overflow-hidden"
                style={{
                  height: '48px',
                  background: `linear-gradient(90deg, ${color}15, ${color}40, ${color}15)`,
                  backgroundSize: '200% 100%',
                  animation: 'gradientMove 15s linear infinite',
                }}
                aria-hidden="true"
              />
            <div className="p-6">
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

              {story.audioUrl && (
                <AudioPlayer audioUrl={story.audioUrl} storyId={story._id} />
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}