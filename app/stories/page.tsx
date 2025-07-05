'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';

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

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }

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

  const truncateText = (text: string, maxLength: number = 400) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto px-4 pt-[120px] md:pt-[140px] pb-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All Stories</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Voices creating an undeniable chorus. Each one different. All of them true. Together, impossible to ignore.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No stories yet. Be the first to share.</p>
            <Link href="/signup" className="mt-4 inline-block">
              <Button>Share Your Story</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {stories.map((story, index) => {
              const color = progressFlagColors[index % progressFlagColors.length];
              
              return (
                <div
                  key={story._id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
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
                  {/* Animated gradient rectangle using single color */}
                  <div 
                    className="w-full relative overflow-hidden"
                    style={{ 
                      height: '48px',
                      background: `linear-gradient(90deg, ${color}15, ${color}40, ${color}15)`,
                      backgroundSize: '200% 100%',
                      animation: 'gradientMove 15s linear infinite'
                    }}
                    aria-hidden="true"
                  />
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-mono text-xs">{story.username}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{getTimeAgo(story.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 dark:text-gray-200 text-sm md:text-base leading-relaxed mb-4">
                      {truncateText(story.contentSanitized)}
                    </p>
                    
                    {story.audioUrl && (
                      <AudioPlayer audioUrl={story.audioUrl} storyId={story._id} />
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link href={`/stories/${story._id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                          Read Full Story
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}