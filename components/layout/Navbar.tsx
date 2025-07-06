"use client";

import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ShareModal from "@/components/share/ShareModal";
import { ArrowLeft, Menu, Share2, LogOut, Code2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import QuickExitButton from "@/components/safety/QuickExitButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const isOnboarding = pathname === '/onboarding';
  const isSubmit = pathname === '/submit';
  const isLoggedIn = !!user;

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      {/* Header with gradient fade */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-50 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pb-8 md:pb-16 pointer-events-none">
        <div className="px-4 md:px-12 py-4 md:py-6 flex justify-between items-center pointer-events-auto">
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="hover:opacity-80 transition-opacity">
            <Logo className="text-xl md:text-2xl" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {!isLoggedIn && (
              <Link href="/about" className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                What's This?
              </Link>
            )}
            
            {isLoggedIn && (
              <Link href="/dashboard">
                <Button 
                  size="sm"
                  className="bg-purple-400/30 hover:bg-purple-400/40 dark:bg-purple-600/30 dark:hover:bg-purple-600/40 text-purple-900 dark:text-purple-100"
                >
                  Dashboard
                </Button>
              </Link>
            )}
            
            {!isLoggedIn && (
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  Login
                </Button>
              </Link>
            )}
            
            {!isOnboarding && !isSubmit && (
              <>
                {!isLoggedIn && (
                  <Link href="/signup">
                    <Button size="sm">
                      Document Your Story
                    </Button>
                  </Link>
                )}
                <Link href="/stories">
                  <Button 
                    size="sm" 
                    className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                  >
                    Browse Stories
                  </Button>
                </Link>
              </>
            )}
            
            {isLoggedIn && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Safely
              </Button>
            )}
            
            <QuickExitButton />
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-2 ml-4 border-l border-gray-300 dark:border-gray-600 pl-4">
              <a
                href="https://www.facebook.com/survivalpending"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com/survivalpending"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-2">
            {!isOnboarding && !isSubmit && !isLoggedIn && (
              <Link href="/signup">
                <Button size="sm" className="text-xs">
                  Share Story
                </Button>
              </Link>
            )}
            <QuickExitButton />
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
                    <Link href={isLoggedIn ? "/dashboard" : "/"} className="hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
                      <Logo className="text-2xl" />
                    </Link>
                  </div>
                </div>
                <nav className="flex flex-col gap-3">
                  {/* Main action buttons at the top */}
                  {!isLoggedIn && (
                    <Link 
                      href="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="w-full h-12"
                      >
                        Login
                      </Button>
                    </Link>
                  )}
                  
                  {!isOnboarding && !isSubmit && (
                    <>
                      {!isLoggedIn && (
                        <Link 
                          href="/signup" 
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            size="sm"
                            className="w-full h-12"
                          >
                            Document Your Story
                          </Button>
                        </Link>
                      )}
                      <Link 
                        href="/stories" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          size="sm"
                          className="w-full h-12 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                        >
                          Browse Stories
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {isLoggedIn && (
                    <>
                      <Link 
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          size="sm"
                          className="w-full h-12 bg-purple-400/30 hover:bg-purple-400/40 dark:bg-purple-600/30 dark:hover:bg-purple-600/40 text-purple-900 dark:text-purple-100"
                        >
                          Dashboard
                        </Button>
                      </Link>
                      <Button 
                        variant="secondary"
                        size="sm"
                        className="w-full h-12 flex items-center gap-2 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleSignOut();
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out Safely
                      </Button>
                    </>
                  )}
                  
                  {/* What's This link */}
                  {!isLoggedIn && (
                    <Link 
                      href="/about"
                      className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2 mt-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      What's This?
                    </Link>
                  )}
                  
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
                  {/* Developer and Contact buttons */}
                  <div className="flex gap-3">
                    <Link href="/developer" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <Code2 className="h-4 w-4 mr-2" />
                        Developers
                      </Button>
                    </Link>
                    <a href="mailto:contact@survivalpending.com" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </a>
                  </div>
                  
                  {/* Social Media Icons */}
                  <div className="flex items-center justify-start gap-4 py-2">
                    <a
                      href="https://www.facebook.com/survivalpending"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300 transition-colors"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a
                      href="https://instagram.com/survivalpending"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300 transition-colors"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                      </svg>
                    </a>
                  </div>
                  
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