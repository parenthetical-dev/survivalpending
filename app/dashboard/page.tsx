'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  AlertTriangle, 
  PenSquare, 
  Clock, 
  Users,
  Heart,
  ArrowRight,
  LogOut,
  Share2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/logo';
import ShareModal from '@/components/share/ShareModal';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

// Progress Pride flag colors for the gradient (matching stories page)
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

interface Story {
  _id: string;
  username: string;
  contentSanitized: string;
  audioUrl?: string;
  createdAt: string;
  status?: string;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
      <audio ref={audioRef} src={audioUrl} />
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        
        <div className="flex-1">
          <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full">
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [storyCount, setStoryCount] = useState<number>(0);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [lastStoryDate, setLastStoryDate] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        // Fetch user's stories
        const response = await fetch('/api/user/stories', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserStories(data.stories || []);
          setStoryCount(data.stories?.length || 0);
          if (data.stories?.length > 0) {
            setLastStoryDate(data.stories[0].createdAt);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user stories:', error);
      } finally {
        setLoadingStories(false);
      }
    };

    if (user) {
      fetchUserStories();
    }
  }, [user]);

  const handleNewStory = () => {
    router.push('/submit');
  };

  const handleLogout = () => {
    logout();
  };

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

  const safetyTips = [
    {
      icon: Shield,
      title: "Private Browsing",
      description: "Always use incognito/private mode when accessing this site"
    },
    {
      icon: AlertTriangle,
      title: "Quick Exit",
      description: "Press ESC 3 times or click the X button to quickly leave"
    },
    {
      icon: Clock,
      title: "Clear History",
      description: "Remember to clear your browser history after each session"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto px-4 pb-6 md:pb-8 pt-[60px] md:pt-[80px]">
        {/* Welcome Back Section */}
        <div className="mb-6 md:mb-8 pt-12 md:pt-16">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">
          Welcome back, {user?.username}
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg">
          Document your truth. Before they erase it.
        </p>
      </div>

      {/* Safety Reminder Alert */}
      <Alert className="mb-6 md:mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950/20 p-3 md:p-4">
        <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
        <AlertTitle className="text-sm md:text-base">Safety Reminder</AlertTitle>
        <AlertDescription className="text-xs md:text-sm mt-1">
          For your protection, always browse in private/incognito mode and clear your history when done.
          You can quickly exit at any time by pressing ESC 3 times.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Quick Actions */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-lg md:text-xl">What would you like to do?</CardTitle>
            <CardDescription className="text-sm">Choose an action to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 pt-0">
            <Button 
              size="lg" 
              className="w-full justify-between"
              onClick={handleNewStory}
            >
              <div className="flex items-center gap-3">
                <PenSquare className="w-5 h-5" />
                <span>Share a New Story</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowShareModal(true)}
            >
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5" />
                <span>Share the Word</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="w-full justify-between"
              onClick={() => router.push('/stories')}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Browse Stories</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <Separator className="my-4" />
            
            <Button 
              size="sm" 
              variant="ghost"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out Safely
            </Button>
          </CardContent>
        </Card>

        {/* Your Impact */}
        <Card>
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              Your Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary">{storyCount}</p>
                <p className="text-sm md:text-base font-medium text-muted-foreground mt-1 md:mt-2">
                  {storyCount === 1 ? 'Story Documented' : 'Stories Documented'}
                </p>
              </div>
              {storyCount === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  Ready to share your first story? Your truth matters and deserves to be preserved.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Thank you for documenting your truth. Every story helps build our collective archive.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Stories */}
      {userStories.length > 0 && (
        <div className="mb-6 md:mb-8">
          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-bold mb-2">Your Stories</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-1"><Timer className="w-3 h-3" /> Pending</span> stories are under review. 
              <span className="inline-flex items-center gap-1 ml-2"><CheckCircle className="w-3 h-3" /> Approved</span> stories are visible to everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {userStories.map((story, index) => {
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
                      backgroundImage: `linear-gradient(90deg, ${color}15, ${color}40, ${color}15)`,
                      backgroundSize: '200% 100%',
                      animation: 'gradientMove 15s linear infinite'
                    }}
                    aria-hidden="true"
                  />
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-mono text-xs">{story.username}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeAgo(story.createdAt)}</span>
                          </div>
                        </div>
                        {story.status && (
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            story.status === 'approved' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                            story.status === 'pending' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                            story.status === 'rejected' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          )}>
                            {story.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                            {story.status === 'pending' && <Timer className="w-3 h-3" />}
                            {story.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            <span className="capitalize">{story.status}</span>
                          </div>
                        )}
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
        </div>
      )}

      {/* Safety Tips */}
      <Card>
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Safety Tips</CardTitle>
          <CardDescription className="text-sm">
            Important reminders to keep you protected
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {safetyTips.map((tip, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0">
                  <tip.icon className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm md:text-base mb-0.5 md:mb-1">{tip.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {tip.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

        {/* Crisis Resources */}
        <div className="mt-6 md:mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
            <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
            <p className="text-xs md:text-sm font-medium text-red-600 dark:text-red-400">
              Emergency? Dial 911
            </p>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mb-2">
            If you're in crisis or need immediate support:
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 sm:gap-4 text-xs md:text-sm">
            <div className="flex items-center justify-center gap-2">
              <a 
                href="https://translifeline.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Trans Lifeline:
              </a>
              <a 
                href="tel:8775658860"
                className="text-primary hover:underline font-mono"
              >
                877-565-8860
              </a>
            </div>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <div className="flex items-center justify-center gap-2">
              <a 
                href="https://www.thetrevorproject.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Trevor Project:
              </a>
              <a 
                href="tel:18664887386"
                className="text-primary hover:underline font-mono"
              >
                1-866-488-7386
              </a>
            </div>
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