'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, Play, Pause, ArrowLeft, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import ShareModal from '@/components/share/ShareModal';
import { getStoryColor } from '@/lib/utils/storyColors';

interface Story {
  _id: string;
  username: string;
  contentSanitized: string;
  audioUrl?: string;
  createdAt: string;
  color?: string;
  voiceSettings?: {
    voiceName: string;
  };
}

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loadingNextStory, setLoadingNextStory] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchStory(params.id as string);
    }
  }, [params.id]);

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
  }, [story]);

  async function fetchStory(id: string) {
    try {
      const response = await fetch(`/api/stories/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStory(data.story);
      } else {
        router.push('/stories');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      router.push('/stories');
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

  const loadRandomStory = async () => {
    setLoadingNextStory(true);
    try {
      const response = await fetch(`/api/stories/random?exclude=${story?._id}`);
      if (response.ok) {
        const data = await response.json();
        router.push(`/stories/${data.storyId}`);
      }
    } catch (error) {
      console.error('Error loading random story:', error);
    } finally {
      setLoadingNextStory(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container max-w-4xl mx-auto px-4 pt-[100px] md:pt-[120px]">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container max-w-4xl mx-auto px-4 pt-[80px] md:pt-[100px] pb-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/stories">
              <Button
                variant="ghost"
                size="sm"
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Stories
              </Button>
            </Link>

            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="flex items-center gap-3">
              <span className="font-mono">{story.username}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{getTimeAgo(story.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
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
          {/* Animated gradient rectangle using consistent color based on story ID */}
          <div
            className="w-full relative overflow-hidden"
            style={{
              height: '72px',
              backgroundImage: `linear-gradient(90deg, ${story.color || getStoryColor(story._id)}15, ${story.color || getStoryColor(story._id)}40, ${story.color || getStoryColor(story._id)}15)`,
              backgroundSize: '200% 100%',
              animation: 'gradientMove 15s linear infinite',
            }}
            aria-hidden="true"
          />
          <div className="px-8 pt-6 pb-8 md:px-12 md:pt-8 md:pb-12">
            <div className="prose prose-base dark:prose-invert max-w-none">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {story.contentSanitized}
              </p>
            </div>

          {story.audioUrl && (
            <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <audio ref={audioRef} src={story.audioUrl} />
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
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

                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Every story shared makes our collective voice stronger.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Platform
              </Button>
            </div>
          </div>
          </div>
        </div>

        {/* Next Story Section */}
        <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Every story matters
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Continue listening to voices from our community
            </p>
            <Button
              onClick={loadRandomStory}
              disabled={loadingNextStory}
              size="lg"
              className="group"
            >
              {loadingNextStory ? (
                'Loading...'
              ) : (
                <>
                  Next Story
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={() => {
          // Could track sharing analytics here if needed
        }}
      />
    </div>
  );
}