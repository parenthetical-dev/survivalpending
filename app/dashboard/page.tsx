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
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import QuickExitButton from '@/components/safety/QuickExitButton';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stories, setStories] = useState<number>(0);
  const [lastStoryDate, setLastStoryDate] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, fetch user's stories count and last story date
    // For now, we'll use localStorage to check if they have any drafts
    const draft = localStorage.getItem('draft_story');
    if (draft) {
      setStories(1);
    }
  }, []);

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
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <QuickExitButton />
      
      {/* Welcome Back Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.username}
        </h1>
        <p className="text-muted-foreground text-lg">
          Your voice matters. Your truth is important.
        </p>
      </div>

      {/* Safety Reminder Alert */}
      <Alert className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Safety Reminder</AlertTitle>
        <AlertDescription>
          For your protection, always browse in private/incognito mode and clear your history when done.
          You can quickly exit at any time by pressing ESC 3 times.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>What would you like to do?</CardTitle>
            <CardDescription>Choose an action to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              onClick={() => router.push('/stories')}
              disabled
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Browse Stories (Coming Soon)</span>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Your Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{stories}</p>
                <p className="text-sm text-muted-foreground">
                  {stories === 1 ? 'Story shared' : 'Stories shared'}
                </p>
              </div>
              {stories === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ready to share your first story? Your voice can help others feel less alone.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Tips</CardTitle>
          <CardDescription>
            Important reminders to keep you protected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {safetyTips.map((tip, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0">
                  <tip.icon className="w-5 h-5 text-primary mt-0.5" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {tip.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crisis Resources */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          If you're in crisis or need immediate support:
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a 
            href="https://translifeline.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Trans Lifeline: 877-565-8860
          </a>
          <span className="text-muted-foreground">•</span>
          <a 
            href="https://www.thetrevorproject.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Trevor Project: 1-866-488-7386
          </a>
        </div>
      </div>
    </div>
  );
}