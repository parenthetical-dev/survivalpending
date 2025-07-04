"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { useState } from "react";
import { WhatsThisModal } from "@/components/WhatsThisModal";
import { ScrollingStories } from "@/components/ScrollingStories";
import { PenTool, Sparkles, Mic, Play } from "lucide-react";

export default function HomePage() {
  const [showWhatsThisModal, setShowWhatsThisModal] = useState(false);
  
  return (
    <>
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
            <Button 
              size="sm" 
              className="bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
              disabled
            >
              Browse Stories (Coming Soon)
            </Button>
          </div>
        </div>
      </div>

      {/* Main content sections */}
      {/* Hero Section - 2/3 height */}
      <div className="h-[66vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
        <ScrollingStories />
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Document your truth. Before they erase it.
          </h2>
        </div>
      </div>

        {/* Value Props - All on one card */}
        <div className="bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 py-24">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Your Story Matters</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  In this moment of unprecedented attacks on LGBTQ+ existence, your story matters. 
                  Your truth is evidence. Your voice is proof.
                </p>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Complete Safety</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This is a safe space to document what you're experiencing right now — 
                  anonymously, securely, permanently.
                </p>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Collective Resistance</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Every story shared here becomes part of an undeniable record. A collective 
                  testimony that we are here, we survived this, and we will not be erased.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - All steps on one card */}
        <div className="bg-gray-50 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-24">
            <h3 className="text-3xl font-bold text-center mb-16">How It Works</h3>
            
            <div className="grid md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">1. Write</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Share your story. 1000 characters. Complete anonymity.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">2. Refine</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Optional AI help to clarify your message.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">3. Voice</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Choose from 8 AI voices. No human recordings.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">4. Publish</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Preview and share. Forever preserved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 py-24">
            <div className="flex flex-col md:flex-row gap-4 justify-center">
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

            <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-8">
              <p>No email required. Complete anonymity. Your safety is our priority.</p>
            </div>
          </div>
        </div>
      
      <WhatsThisModal 
        isOpen={showWhatsThisModal} 
        onClose={() => setShowWhatsThisModal(false)} 
      />
    </>
  );
}