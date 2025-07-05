"use client";

import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, Menu, Share2 } from 'lucide-react';
import { useState } from 'react';
import ShareModal from '@/components/share/ShareModal';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function SignupPage() {
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

      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-[450px] space-y-4 md:space-y-6">
            <SignupForm />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="underline underline-offset-4 hover:text-primary"
              >
                Log in
              </Link>
            </p>
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