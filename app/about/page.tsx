"use client";

import Link from "next/link";
import { Shield, Users, Clock, Lock, ArrowLeft } from "lucide-react";
import { InfoPagesNav } from "@/components/InfoPagesNav";
import Navbar from "@/components/layout/Navbar";

export default function AboutPage() {
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
                  A living archive of LGBTQ+ resilience in real time.
                </h1>
              </div>
            
              {/* Main content */}
              <div className="space-y-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8 space-y-4">
              <p className="text-base sm:text-lg leading-relaxed">
                Survival Pending is an anonymous platform documenting the experiences of LGBTQ+ 
                people as we navigate unprecedented political and social attacks on our existence. 
                This isn't just another website. It's an act of collective resistance. 
                Every story shared makes us harder to ignore, impossible to erase.
              </p>
              <p className="text-lg sm:text-xl font-bold">
                Document your truth. Add your voice.
              </p>
            </div>

            {/* Why we built this */}
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-6 sm:p-8 space-y-4 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h2 className="font-bold text-lg">Why we built this</h2>
              </div>
              <p className="text-base leading-relaxed">
                After the 2024 United States presidential election, crisis calls spiked 700%. Friends were fleeing states. Stories were being silenced. We built this platform because our truths deserve to be documented before they're erased. Started by LGBTQ+ community members who understand the urgency of this moment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Why this matters */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="font-bold text-lg">Why this matters</h2>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span className="text-base">Our rights and recognition are under unprecedented pressure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span className="text-base">Our stories are being silenced and erased</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span className="text-base">History needs our testimony</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span className="text-base">You need to know you're not alone</span>
                  </li>
                </ul>
              </div>

              {/* How it works - moved from below */}
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h2 className="font-bold text-lg">How it works</h2>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span className="text-base">Share your story completely anonymously</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span className="text-base">No emails, no tracking, no real names</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span className="text-base">Optional demographics help identify trends</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span className="text-base">Stories become audio testimonies through voice synthesis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span className="text-base">Everything is preserved as historical record</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Your privacy */}
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="font-bold text-lg">Your privacy is absolute</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span className="text-base">No account recovery (protects your anonymity)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span className="text-base">Quick exit button on every page (ESC 3x)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span className="text-base">Crisis resources always available</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span className="text-base">We can't see who you are, ever</span>
                </div>
              </div>
            </div>

              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}