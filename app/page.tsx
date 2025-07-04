"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { useState } from "react";
import { WhatsThisModal } from "@/components/WhatsThisModal";

export default function HomePage() {
  const [showWhatsThisModal, setShowWhatsThisModal] = useState(false);
  return (
    <div>
      <div className="relative">
        {/* Header with gradient fade */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-50 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pb-16 pointer-events-none">
          <div className="px-24 py-6 flex justify-between items-center pointer-events-auto">
            <Logo className="text-2xl" />
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowWhatsThisModal(true)}
              >
                What's This?
              </Button>
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
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="max-w-6xl w-full space-y-12">
            {/* Hero section */}
            <div className="text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                Document your truth. Before they erase it.
              </h2>
              
              {/* Text blocks in grid */}
              <div className="grid md:grid-cols-3 gap-6 text-lg">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-left">
                  <p className="text-gray-700 dark:text-gray-300">
                    In this moment of unprecedented attacks on LGBTQ+ existence, your story matters. 
                    Your truth is evidence. Your voice is proof.
                  </p>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-left">
                  <p className="text-gray-700 dark:text-gray-300">
                    This is a safe space to document what you&apos;re experiencing right now — 
                    anonymously, securely, permanently.
                  </p>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-left">
                  <p className="text-gray-700 dark:text-gray-300">
                    Every story shared here becomes part of an undeniable record. A collective 
                    testimony that we are here, we survived this, and we will not be erased.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA buttons side by side */}
            <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
              <Link href="/signup">
                <Button size="lg" className="min-w-[200px] text-lg py-6">
                  Document Your Story
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                className="min-w-[200px] text-lg py-6 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
                disabled
              >
                Browse Stories (Coming Soon)
              </Button>
            </div>

            {/* Bottom info */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-8">
              <p>No email required. Complete anonymity. Your safety is our priority.</p>
            </div>
          </div>
        </div>
      </div>
      
      <WhatsThisModal 
        isOpen={showWhatsThisModal} 
        onClose={() => setShowWhatsThisModal(false)} 
      />
    </div>
  );
}