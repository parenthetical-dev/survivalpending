'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ScrollingStories } from '@/components/ScrollingStories';
import { FeaturedStories } from '@/components/FeaturedStories';
import { AnimatedHowItWorks } from '@/components/AnimatedHowItWorks';
import ShareModal from '@/components/share/ShareModal';
import { Heart, Shield, Users, Share2, Clock } from 'lucide-react';
import type { FeaturedStory } from '@/lib/sanity-homepage';
import Navbar from '@/components/layout/Navbar';

export default function HomePage() {
  const [storyCount, setStoryCount] = useState(23);
  const [lastStoryTime, setLastStoryTime] = useState<Date | null>(null);
  const [featuredStories, setFeaturedStories] = useState<FeaturedStory[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Set initial time to 2 hours ago if no stories loaded yet
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    setLastStoryTime(twoHoursAgo);
  }, []);

  // Fetch featured stories from Sanity
  useEffect(() => {
    async function fetchFeaturedStories() {
      try {
        const response = await fetch('/api/featured-stories', {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFeaturedStories(data.stories);

          // Update last story time from the most recent story
          if (data.stories && data.stories.length > 0) {
            const mostRecentStory = data.stories[0]; // Stories are ordered by createdAt desc
            setLastStoryTime(new Date(mostRecentStory.createdAt));
          }
        }
      } catch (error) {
        // Only log non-network errors
        if (error instanceof Error && !error.message.includes('Failed to fetch')) {
          console.error('Error fetching featured stories:', error);
        }
        // Set empty array to prevent undefined errors
        setFeaturedStories([]);
      }
    }
    fetchFeaturedStories();
  }, []);

  const getTimeAgo = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    return 'just now';
  };

  return (
    <>
      <Navbar />

      {/* Main content sections */}
      {/* Hero Section - 2/3 height */}
      <div className="min-h-[50vh] md:min-h-[66vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
        <ScrollingStories />
        <div className="max-w-6xl mx-auto px-6 md:px-4 text-center relative z-10 pt-[15vh] pb-[10vh] md:pt-[25vh] md:pb-[15vh]">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="block md:inline">Document your truth.</span>{' '}
            <span className="block md:inline">Before they erase it.</span>
          </h2>
          <p className="mt-6 md:mt-8 text-lg md:text-xl text-gray-700 dark:text-gray-300">
            A living, real-time archive of LGBTQ+ resilience in the United States.
          </p>
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm md:text-base text-gray-600 dark:text-gray-400">
            {/* <div className="flex items-center gap-2">
              <span className="font-semibold">{storyCount}</span>
              <span>stories shared</span>
            </div>
            <span className="hidden sm:inline text-gray-400 dark:text-gray-600">•</span> */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Last story shared</span>
              <span className="font-semibold">{getTimeAgo(lastStoryTime)}</span>
            </div>
          </div>
          <div className="mt-6 md:mt-8">
            <Link href="/signup">
              <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                Share Your Truth →
              </Button>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              No email required. Complete anonymity. Your safety is our priority.
            </p>
          </div>

          {/* Featured Stories Below Hero Content */}
          <FeaturedStories
            stories={featuredStories}
            position="below"
          />

          {/* Browse Stories Button */}
          {featuredStories.length > 0 && (
            <div className="mt-12 md:mt-16 -mb-8 md:-mb-12">
              <Link href="/stories">
                <Button
                  size="lg"
                  className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                >
                  Browse All Stories
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

        {/* Value Props - All on one card */}
        <div className="bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-6 md:px-4 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
              <div className="text-center px-4 md:px-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Heart className="w-6 h-6 md:w-7 md:h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Your Story Matters</h3>
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                  Your experiences deserve to be witnessed. In times of change and challenge, personal stories become historical record. Your truth adds to our collective understanding.
                </p>
                <Link href="/why" className="inline-flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-4">
                  See Why
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="text-center px-4 md:px-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Shield className="w-6 h-6 md:w-7 md:h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Complete Safety</h3>
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                  Share your story in a space designed with your privacy at the center. Anonymous, encrypted, and permanent—because some truths need protection to be told.
                </p>
                <Link href="/how" className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 mt-4">
                  See How
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="text-center px-4 md:px-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Users className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Collective Resilience</h3>
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                  Every story shared strengthens our community's voice. Together, we're creating a living archive of how we navigate difficult times, support each other, and persist.
                </p>
                <Link href="/community" className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mt-4">
                  Learn More
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - Dynamic animated version */}
        <div className="bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-6 md:px-4 py-16 md:py-24">
            <h3 className="text-xl md:text-3xl font-bold text-center mb-3 md:mb-4">How It Works</h3>
            <p className="text-center text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 md:mb-16 px-4 md:px-0">
              Share your story in four simple steps. Write your experience, optionally refine it with AI assistance, choose a voice for your testimony, and submit it anonymously to join others in our living archive.
            </p>
            <AnimatedHowItWorks />
          </div>
        </div>

        {/* CTA section with animated background */}
        <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden pb-0 md:pb-20">
          <ScrollingStories />
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-4 py-24 md:py-32">
            <div className="text-center mb-8 md:mb-12">
              <h3 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Your Story Is Waiting</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4 md:px-0">
                Every story shared makes us stronger. Every voice added makes us harder to silence. Your experiences matter, and this is your space to share them—safely, anonymously, permanently.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/signup" className="w-full md:w-auto">
                <Button size="lg" className="w-full md:w-auto md:min-w-[200px] text-base md:text-lg py-5 md:py-6">
                  Document Your Story
                </Button>
              </Link>

              <Link href="/stories" className="w-full md:w-auto">
                <Button
                  size="lg"
                  className="w-full md:w-auto md:min-w-[200px] text-base md:text-lg py-5 md:py-6 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                >
                  Browse Stories
                </Button>
              </Link>
            </div>

            <div className="text-center text-xs md:text-sm text-gray-600 dark:text-gray-400 pt-6 md:pt-8 px-4 md:px-0">
              <p>No email required. Complete anonymity. Your safety is our priority.</p>
            </div>

            {/* Grow the Movement block */}
            <div className="mt-12 md:mt-16 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 md:p-12 text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-4">Grow the Movement</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Help us reach those who need to know they're not alone. Every share connects someone to this community. Every new voice makes our archive stronger. Spread the word wherever you feel safe to do so.
              </p>
              <Button
                size="lg"
                className="w-full md:w-auto md:min-w-[200px] text-base md:text-lg py-5 md:py-6 bg-black hover:bg-gray-800 text-white"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share the Platform
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

    </>
  );
}