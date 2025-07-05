"use client";

import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import ShareModal from "@/components/share/ShareModal";
import { ArrowLeft, Users, Heart, Zap, TrendingUp, Globe, HeartHandshake, MapPin, BookOpen, Sparkles, Clock, Menu, Share2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function CollectiveResiliencePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <>
      {/* Header with gradient fade */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-50 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pb-8 md:pb-16 pointer-events-none">
        <div className="px-4 md:px-24 py-4 md:py-6 flex justify-between items-center pointer-events-auto">
          <Logo className="text-xl md:text-2xl" />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/about">
              <Button variant="ghost" size="sm">
                What's This?
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Document Your Story
              </Button>
            </Link>
            <Link href="/stories">
              <Button 
                size="sm" 
                className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
              >
                Browse Stories
              </Button>
            </Link>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/signup">
              <Button size="sm" className="text-xs">
                Share Story
              </Button>
            </Link>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] px-8 pt-12" showClose={false}>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute left-8 top-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Close</span>
                </button>
                <div className="mb-8 mt-12">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex justify-start">
                    <Logo className="text-2xl" />
                  </div>
                </div>
                <nav className="flex flex-col gap-3">
                  <Link 
                    href="/about"
                    className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    What's This?
                  </Link>
                  <Link 
                    href="/login" 
                    className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Document Your Story
                  </Link>
                  <Link 
                    href="/stories" 
                    className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Browse Stories
                  </Link>
                  
                  {/* Divider */}
                  <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
                  
                  {/* Value Prop Links */}
                  <Link 
                    href="/why" 
                    className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    The Power of Being Witnessed
                  </Link>
                  <Link 
                    href="/how" 
                    className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Safety by Design
                  </Link>
                  <Link 
                    href="/community" 
                    className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Building Our Archive
                  </Link>
                  
                  {/* Divider */}
                  <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
                  
                  {/* Share Link */}
                  <button
                    className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2 text-left w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowShareModal(true);
                    }}
                  >
                    Grow the Movement
                  </button>
                </nav>
                <div className="absolute bottom-8 left-8 right-8 space-y-4">
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <a 
                      href="https://app.termly.io/policy-viewer/policy.html?policyUUID=61228498-eb21-4048-bf3a-00a9518e88c3"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      Privacy
                    </a>
                    <a 
                      href="https://app.termly.io/policy-viewer/policy.html?policyUUID=69f226cd-4d1f-4513-b13e-7b7060379aac"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      Terms
                    </a>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>MMXXV</span>
                      <span 
                        className="inline-flex items-center font-black tracking-tight"
                        style={{ fontFamily: 'Satoshi, sans-serif' }}
                      >
                        Survival Pending
                        <span className="inline-block w-[2px] h-[0.6em] bg-current ml-[2px] animate-blink" />
                      </span>
                    </div>
                    <div className="mt-1">All Rights Reserved.</div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[60px] md:pt-[80px]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="space-y-4 mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
              Building Our Archive
            </h1>
          </div>
        
          {/* Main content */}
          <div className="space-y-8">
            {/* Introduction */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8">
              <p className="text-base sm:text-lg leading-relaxed">
                Every story shared strengthens our community's voice. Together, we're creating a living archive of how we navigate difficult times, support each other, and persist.
              </p>
            </div>

            {/* The power of collective storytelling */}
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                <h2 className="font-bold text-lg">Something Powerful Happens</h2>
              </div>
              <p className="text-base leading-relaxed">
                When you share your story here, something powerful happens. Your individual experience becomes part of a larger tapestry—a collective record of resilience that no single voice could create alone.
              </p>
            </div>

            {/* Stories from everywhere */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <h2 className="font-bold text-lg">Threads From Everywhere</h2>
              </div>
              <p className="text-base leading-relaxed">
                Each story adds another thread: the teenager in Texas finding hope. The parent in Florida making impossible choices. The elder in Tennessee sharing decades of survival wisdom. The young professional in Ohio navigating workplace challenges. Together, these threads weave an undeniable truth: we are everywhere, we are diverse, and we are strong.
              </p>
            </div>

            {/* Full spectrum grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-bold">The Full Spectrum</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  This isn't just about documenting hardship. It's about capturing the full spectrum of our experiences—the fear and the joy, the struggles and the celebrations, the isolation and the connection.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-bold">Creating Beauty</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  It's about showing how we find light in darkness, how we create family where we find it, how we build lives worth living even when the world tells us we shouldn't exist.
                </p>
              </div>
            </div>

            {/* Future generations */}
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                <h2 className="font-bold text-lg">For Future Generations</h2>
              </div>
              <p className="text-base leading-relaxed">
                Future generations will look back at this archive and see more than just survival. They'll see how we loved, how we fought, how we created beauty in the midst of chaos. They'll see that we refused to be silenced, that we insisted on being witnessed, that we wrote our own stories when others tried to write them for us.
              </p>
            </div>

            {/* Who needs your story */}
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Heart className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <h2 className="font-bold text-lg">Your Story Matters Beyond You</h2>
              </div>
              <p className="text-base leading-relaxed">
                Your story doesn't just matter for you. It matters for the questioning kid who will find this archive five years from now and realize they're not alone. It matters for the researcher documenting our history. It matters for the person reading it tomorrow who needs to hear exactly what you have to say.
              </p>
            </div>

            {/* How we survive */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8">
              <p className="text-base sm:text-lg leading-relaxed font-semibold">
                This is how we survive: together. This is how we thrive: by refusing to let our stories go untold.
              </p>
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
    </>
  );
}