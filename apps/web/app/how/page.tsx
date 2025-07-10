'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Server, Key, AlertCircle, UserX, RefreshCwOff, LogOut, Database, Archive } from 'lucide-react';
import { InfoPagesNav } from '@/components/InfoPagesNav';
import Navbar from '@/components/layout/Navbar';

export default function CompleteSafetyPage() {
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
                  Safety by Design
                </h1>
              </div>

              {/* Main content */}
              <div className="space-y-8">
            {/* Introduction */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8">
              <p className="text-base sm:text-lg leading-relaxed">
                Share your story in a space designed with your privacy at the center. Anonymous, encrypted, and permanent—because some truths need protection to be told.
              </p>
            </div>

            {/* Core principle */}
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <h2 className="font-bold text-lg">A Fundamental Requirement</h2>
              </div>
              <p className="text-base leading-relaxed">
                We built this platform understanding that safety isn't just a feature—it's a fundamental requirement. For many in our community, anonymity isn't a preference; it's a necessity.
              </p>
              <p className="text-base leading-relaxed mt-4">
                That's why we've made choices that put your security first:
              </p>
            </div>

            {/* Security features grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserX className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold">No Personal Information</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  No email required. No phone number. No real name. We don't want to know who you are, and we've built our system so we can't know even if we wanted to.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCwOff className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold">No Account Recovery</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  This might seem extreme, but it's intentional. If we can't recover your account, neither can anyone else. Your anonymity is absolute.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-bold">Quick Exit Built In</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  Press ESC three times or click the escape button, and you're immediately redirected away. No browser history. No trace.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-bold">Your Data, Protected</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  Optional demographics help us understand trends, but they're never connected to individual stories. We see patterns, not people.
                </p>
              </div>
            </div>

            {/* Permanent archive */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-1" />
                <h2 className="font-bold text-lg">Permanent Archive</h2>
              </div>
              <p className="text-base leading-relaxed">
                Your story isn't stored on social media platforms that can change policies or be pressured. It's preserved here, protected and permanent.
              </p>
            </div>

            {/* Closing message */}
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6 sm:p-8">
              <p className="text-base sm:text-lg leading-relaxed">
                We know that sharing your truth requires courage. We've done everything possible to make sure that courage isn't met with consequences. This is your space to speak freely, without fear, knowing that your safety is our highest priority.
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