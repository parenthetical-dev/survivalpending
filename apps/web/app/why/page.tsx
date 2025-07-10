'use client';

import Link from 'next/link';
import { ArrowLeft, Heart, BookOpen, Clock, Globe } from 'lucide-react';
import { InfoPagesNav } from '@/components/InfoPagesNav';
import Navbar from '@/components/layout/Navbar';

export default function YourStoryMattersPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[60px] md:pt-[80px]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex gap-8">
            {/* Left navigation */}
            <InfoPagesNav />

            {/* Main content */}
            <div className="flex-1">
              {/* Header */}
              <div className="space-y-4 mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
                  The Power of Being Witnessed
                </h1>
              </div>

              {/* Main content */}
              <div className="space-y-8">
            {/* Introduction */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8">
              <p className="text-base sm:text-lg leading-relaxed">
                Your experiences deserve to be witnessed. In times of change and challenge, personal stories become historical record. Your truth adds to our collective understanding.
              </p>
            </div>

            {/* Why your voice matters */}
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Heart className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <h2 className="font-bold text-lg">Is My Story Important Enough?</h2>
              </div>
              <p className="text-base leading-relaxed">
                Right now, you might be wondering if your story is "important enough" to share. Maybe you think you need to have faced something dramatic, or that your daily struggles don't measure up. But that's exactly why we need your voice.
              </p>
            </div>

            {/* Small moments matter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold">The Small Moments</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  The small moments matter just as much as the big ones. The quiet fears you carry. The tiny victories no one sees. The ordinary Tuesday when everything felt impossible. The unexpected kindness from a stranger. The moment you chose to keep going.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold">Just Be True</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  Your story doesn't need to be perfect or polished. It doesn't need a beginning, middle, and end. It just needs to be true. Because someone, somewhere, needs to hear exactly what you have to say. They need to know they're not the only one feeling what you're feeling.
                </p>
              </div>
            </div>

            {/* Creating connections */}
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6 sm:p-8">
              <p className="text-base sm:text-lg leading-relaxed">
                When you share your truth, you create a mirror for others to see themselves. You build a bridge across isolation. You leave proof that we were here, we felt this, we survived it.
              </p>
            </div>

            {/* Revolutionary act */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8">
              <p className="text-base sm:text-lg leading-relaxed">
                Your story matters because you matter. And in this moment, being witnessed might be the most revolutionary act of all.
              </p>
            </div>

              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}