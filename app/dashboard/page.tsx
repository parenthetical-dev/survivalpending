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
  Share2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/logo';
import ShareModal from '@/components/share/ShareModal';
import Navbar from '@/components/layout/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stories, setStories] = useState<number>(0);
  const [lastStoryDate, setLastStoryDate] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Fetch user's actual story count
    const fetchStoryCount = async () => {
      try {
        const response = await fetch('/api/user/stories/count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStories(data.count);
          if (data.lastStoryDate) {
            setLastStoryDate(data.lastStoryDate);
          }
        }
      } catch (error) {
        console.error('Failed to fetch story count:', error);
      }
    };

    if (user) {
      fetchStoryCount();
    }
  }, [user]);

  const handleNewStory = () => {
    router.push('/submit');
  };

  const handleLogout = () => {
    logout();
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
                <p className="text-4xl md:text-5xl font-bold text-primary">{stories}</p>
                <p className="text-sm md:text-base font-medium text-muted-foreground mt-1 md:mt-2">
                  {stories === 1 ? 'Story Documented' : 'Stories Documented'}
                </p>
              </div>
              {stories === 0 ? (
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