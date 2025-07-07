'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Clock, ArrowRight, Filter, X, Map } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StoriesMap from '@/components/StoriesMap';
import { getStoryColor } from '@/lib/utils/storyColors';

interface Story {
  _id: string;
  storyId: string; // This is the database ID we need for filtering
  username: string;
  contentSanitized: string;
  audioUrl?: string;
  createdAt: string;
  categories?: string[];
  color?: string;
  voiceSettings?: {
    voiceName: string;
  };
  demographics?: {
    state?: string;
  };
}

// Predefined story categories
const STORY_CATEGORIES = [
  'Coming Out',
  'Identity',
  'Family',
  'Relationships',
  'Discrimination',
  'Healthcare',
  'Work/School',
  'Community',
  'Resilience',
  'Support'
];


function FilterModal({ 
  filters, 
  onApply, 
  onClear, 
  onClose
}: { 
  filters: any; 
  onApply: (filters: any) => void; 
  onClear: () => void; 
  onClose: () => void; 
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter((c: string) => c !== category)
      : [...localFilters.categories, category];
    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={localFilters.hasAudio}
            onChange={(e) => setLocalFilters({ ...localFilters, hasAudio: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Stories with audio only</span>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Time Range</label>
        <select
          value={localFilters.timeRange}
          onChange={(e) => setLocalFilters({ ...localFilters, timeRange: e.target.value })}
          className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">Past week</option>
          <option value="month">Past month</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-3">Categories</label>
        <div className="max-h-32 overflow-y-auto space-y-2">
          {STORY_CATEGORIES.map((category) => (
            <label key={category} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localFilters.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="rounded"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={onClear}>
          Clear All
        </Button>
      </div>
    </div>
  );
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

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    hasAudio: false,
    timeRange: 'all', // 'all', 'today', 'week', 'month'
    categories: [] as string[], // Selected categories
    selectedState: null as string | null, // For geographic filtering
  });
  const [showMap, setShowMap] = useState(false);
  const [mapData, setMapData] = useState<{ statesWithData: number; totalStories: number } | null>(null);

  useEffect(() => {
    fetchStories();
    fetchMapData();
  }, []);

  async function fetchStories() {
    try {
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched stories:', data.stories);
        console.log('Stories with states:', data.stories.filter((s: any) => s.demographics?.state).map((s: any) => ({
          id: s._id,
          storyId: s.storyId,
          state: s.demographics.state
        })));
        setStories(data.stories);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMapData() {
    try {
      const response = await fetch('/api/stories/map-data-synced');
      if (response.ok) {
        const data = await response.json();
        setMapData({
          statesWithData: data.statesWithData || 0,
          totalStories: data.totalStories || 0
        });
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
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

  const sortedAndFilteredStories = () => {
    let filtered = [...stories];
    
    // Apply filters
    if (filters.hasAudio) {
      filtered = filtered.filter(story => story.audioUrl);
    }
    
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.timeRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(story => new Date(story.createdAt) >= cutoffDate);
    }
    
    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(story => 
        story.categories && story.categories.some(category => filters.categories.includes(category))
      );
    }
    
    // Apply state filter
    if (filters.selectedState) {
      filtered = filtered.filter(story => 
        story.demographics?.state === filters.selectedState
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({
      hasAudio: false,
      timeRange: 'all',
      categories: [],
      selectedState: null,
    });
  };

  const handleStateSelect = (state: string | null) => {
    setFilters(prev => ({ ...prev, selectedState: state }));
  };

  const displayStories = sortedAndFilteredStories();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto px-4 pt-[120px] md:pt-[140px] pb-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All Stories</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Voices creating an undeniable chorus. Each one different. All of them true. Together, impossible to ignore.
          </p>
          
          {/* Early stage message */}
          {mapData && mapData.statesWithData < 10 && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">We're Just Getting Started</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Survival Pending is in its early stages. As more stories are shared, our geographic view will become available 
                    while maintaining strict privacy protections. Every story matters in building this collective testimony.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Filter and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-6">
            <div className="flex gap-3">
              <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                    {(filters.hasAudio || filters.timeRange !== 'all' || filters.categories.length > 0 || filters.selectedState) && (
                      <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Filter Stories</DialogTitle>
                  </DialogHeader>
                  <FilterModal 
                    filters={filters} 
                    onApply={applyFilters} 
                    onClear={clearFilters}
                    onClose={() => setShowFilterModal(false)}
                  />
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowMap(!showMap)}
                className={showMap ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300' : ''}
              >
                <Map className="w-4 h-4 mr-2" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
              
              {(filters.hasAudio || filters.timeRange !== 'all' || filters.categories.length > 0 || filters.selectedState) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort:</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSort}
                className="min-w-[80px]"
              >
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </Button>
            </div>
          </div>
        </div>

        {/* Map Component */}
        {showMap && (
          <div className="mb-8">
            <StoriesMap 
              onStateSelect={handleStateSelect}
              selectedState={filters.selectedState}
            />
          </div>
        )}

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
        ) : displayStories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {stories.length === 0 ? "No stories yet. Be the first to share." : "No stories match your filters."}
            </p>
            {stories.length === 0 ? (
              <Link href="/signup" className="mt-4 inline-block">
                <Button>Share Your Story</Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {displayStories.map((story) => {
              const color = story.color || getStoryColor(story._id);
              
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
                      backgroundImage: `linear-gradient(90deg, ${color}15, ${color}40, ${color}15)`,
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