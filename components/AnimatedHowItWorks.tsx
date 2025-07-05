'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PenTool, Sparkles, Mic, Send, Check, RefreshCw } from 'lucide-react';

interface Stage {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const sampleStory = "Coming out wasn't just about telling people who I am. It was about finally being able to breathe. To walk into a room without calculating every gesture, every word. My family's reaction was mixed - some embraced me immediately, others needed time. But here I am, living my truth, and that freedom is worth everything.";

const refinedStory = "Coming out wasn't merely an announcement—it was permission to finally breathe. No more calculating every gesture or word before entering a room. My family's reactions varied: some offered immediate embraces while others needed time to process. Yet here I stand, living authentically, and this freedom surpasses any challenge faced along the way.";

export function AnimatedHowItWorks() {
  const [currentStage, setCurrentStage] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showRefinement, setShowRefinement] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-advance through stages
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStage < 3) {
        setCurrentStage(prev => prev + 1);
      } else {
        // Reset after completion
        setTimeout(() => {
          setCurrentStage(0);
          setTypedText('');
          setShowRefinement(false);
          setSelectedVoice(null);
          setIsPlaying(false);
          setShowSuccess(false);
        }, 2000);
      }
    }, currentStage === 0 ? 5000 : currentStage === 1 ? 4000 : currentStage === 2 ? 4000 : 2000);

    return () => clearTimeout(timer);
  }, [currentStage]);

  // Typing animation for Write stage
  useEffect(() => {
    if (currentStage === 0) {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < sampleStory.length) {
          setTypedText(sampleStory.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
        }
      }, 30);
      return () => clearInterval(typeInterval);
    }
  }, [currentStage]);

  // Show refinement animation
  useEffect(() => {
    if (currentStage === 1) {
      setTimeout(() => setShowRefinement(true), 1500);
    }
  }, [currentStage]);

  // Voice selection animation
  useEffect(() => {
    if (currentStage === 2) {
      setTimeout(() => setSelectedVoice('River'), 1000);
      setTimeout(() => setIsPlaying(true), 2000);
      setTimeout(() => setIsPlaying(false), 3500);
    }
  }, [currentStage]);

  // Submit animation
  useEffect(() => {
    if (currentStage === 3) {
      setTimeout(() => setShowSuccess(true), 1000);
    }
  }, [currentStage]);

  const stages: Stage[] = [
    {
      id: 'write',
      title: 'Write Your Story',
      icon: <PenTool className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="min-h-[120px] text-sm leading-relaxed">
              {typedText}
              {currentStage === 0 && typedText.length < sampleStory.length && (
                <span className="inline-block w-0.5 h-4 bg-gray-900 dark:bg-gray-100 animate-blink ml-0.5" />
              )}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {typedText.length}/1000 characters
            </div>
          </div>
          {typedText.length > 50 && (
            <p className="text-xs text-gray-600 dark:text-gray-400 animate-fade-in">
              Your story auto-saves as you type
            </p>
          )}
        </div>
      )
    },
    {
      id: 'refine',
      title: 'Optional AI Refinement',
      icon: <Sparkles className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className={cn("w-4 h-4", showRefinement ? "" : "animate-spin")} />
              <span className="text-sm font-medium">
                {showRefinement ? "Suggested refinement:" : "Analyzing your story..."}
              </span>
            </div>
            {showRefinement && (
              <div className="text-sm leading-relaxed animate-fade-in">
                {refinedStory}
              </div>
            )}
          </div>
          {showRefinement && (
            <div className="flex gap-2 animate-fade-in">
              <Button size="sm" variant="outline">Keep Original</Button>
              <Button size="sm">Use Refined Version</Button>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'voice',
      title: 'Choose Your Voice',
      icon: <Mic className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {['River', 'Sage', 'Sky', 'Phoenix'].map((voice) => (
              <button
                key={voice}
                className={cn(
                  "p-3 rounded-lg border text-sm transition-all",
                  selectedVoice === voice
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                {voice}
              </button>
            ))}
          </div>
          {selectedVoice && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  {isPlaying ? (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-0.5">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-blue-500 animate-pulse"
                            style={{
                              height: isPlaying ? `${Math.random() * 12 + 4}px` : '4px',
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-0 h-0 border-l-[8px] border-l-gray-600 dark:border-l-gray-400 border-y-[5px] border-y-transparent ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
                    {isPlaying && (
                      <div className="h-full bg-blue-500 rounded-full animate-grow" />
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {isPlaying ? "0:03" : "Preview"}
                </span>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'submit',
      title: 'Share Anonymously',
      icon: <Send className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <Button 
            className={cn(
              "w-full transition-all",
              showSuccess && "bg-green-600 hover:bg-green-600"
            )}
          >
            {showSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Story Submitted Successfully
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Your Story
              </>
            )}
          </Button>
          {showSuccess && (
            <div className="text-center space-y-2 animate-fade-in">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your story has been added to the archive
              </p>
              <p className="text-xs text-gray-500">
                Username: resilient_phoenix_4823
              </p>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Progress indicators */}
      <div className="flex items-center justify-center gap-2">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-500",
              index === currentStage
                ? "w-8 bg-blue-600 dark:bg-blue-400"
                : index < currentStage
                ? "bg-blue-600 dark:bg-blue-400"
                : "bg-gray-300 dark:bg-gray-700"
            )}
          />
        ))}
      </div>

      {/* Stage content */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg transition-all",
                "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
              )}>
                {stages[currentStage].icon}
              </div>
              <div>
                <h3 className="font-semibold">Step {currentStage + 1}: {stages[currentStage].title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {currentStage === 0 && "Share your experience in your own words"}
                  {currentStage === 1 && "AI helps polish while preserving your voice"}
                  {currentStage === 2 && "Select a voice for your audio testimony"}
                  {currentStage === 3 && "Your story joins thousands of others"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {stages[currentStage].content}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes grow {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-grow {
          animation: grow 1.5s ease-out;
        }
      `}</style>
    </div>
  );
}