'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Lightbulb, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import StoryPrompts from './StoryPrompts';
import StepHeader from './StepHeader';
import ProgressDots from './ProgressDots';
import { toast } from 'sonner';
import { trackStoryProgress, trackEvent } from '@/lib/analytics';

interface WriteStageProps {
  onComplete: (content: string) => void;
}

const CHARACTER_LIMIT = 1000; // ~90 seconds of speech
const IDLE_PROMPT_DELAY = 30000; // 30 seconds

export default function WriteStage({ onComplete }: WriteStageProps) {
  const [content, setContent] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const idleTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const remainingChars = CHARACTER_LIMIT - content.length;
  const progress = (content.length / CHARACTER_LIMIT) * 100;

  useEffect(() => {
    // Auto-save logic
    if (content) {
      setAutoSaved(false);
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('draft_story', content);
        setAutoSaved(true);
        
        // Track draft save
        trackEvent('STORY_DRAFT_SAVED', 'STORY', {
          contentLength: content.length,
          progress: Math.round((content.length / CHARACTER_LIMIT) * 100)
        });
      }, 1000);
    }

    return () => clearTimeout(saveTimeoutRef.current);
  }, [content]);

  useEffect(() => {
    // Track story start
    trackStoryProgress('start');
    
    // Load draft if exists
    const draft = localStorage.getItem('draft_story');
    if (draft) {
      setContent(draft);
      toast.info('Draft restored');
    }
  }, []);

  useEffect(() => {
    // Idle prompt logic
    clearTimeout(idleTimeoutRef.current);
    if (!content && !showPrompts) {
      idleTimeoutRef.current = setTimeout(() => {
        setShowIdlePrompt(true);
        
        // Track idle prompt shown
        trackEvent('STORY_IDLE_PROMPT_SHOWN', 'STORY', {
          timeIdle: IDLE_PROMPT_DELAY / 1000 // in seconds
        });
      }, IDLE_PROMPT_DELAY);
    }

    return () => clearTimeout(idleTimeoutRef.current);
  }, [content, showPrompts, lastActivity]);

  const handleContentChange = (value: string) => {
    if (value.length <= CHARACTER_LIMIT) {
      setContent(value);
      setLastActivity(Date.now());
      setShowIdlePrompt(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newContent = content ? `${content}\n\n${prompt}` : prompt;
      if (newContent.length <= CHARACTER_LIMIT) {
        setContent(newContent);
      }
    }
    setShowPrompts(false);
  };

  const canContinue = content.trim().length >= 50; // Minimum 50 chars

  return (
    <div className="container max-w-full md:max-w-6xl mx-auto px-4">
      <ProgressDots currentStep={1} />
      
      <div className="flex gap-6">
        <div className="flex-1">
          <Card className="p-0 overflow-hidden">
            <StepHeader
              currentStep={1}
              title="Write Your Story"
              description="Share your experience in your own words"
            />
            <div className="p-4 md:p-6 pb-3 md:pb-4">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onPaste={(e) => {
              // Explicitly allow paste and handle it
              e.stopPropagation();
              const pastedText = e.clipboardData.getData('text/plain');
              const currentValue = e.currentTarget.value;
              const selectionStart = e.currentTarget.selectionStart;
              const selectionEnd = e.currentTarget.selectionEnd;
              
              const newValue = 
                currentValue.substring(0, selectionStart) + 
                pastedText + 
                currentValue.substring(selectionEnd);
              
              if (newValue.length <= CHARACTER_LIMIT) {
                e.preventDefault();
                handleContentChange(newValue);
                // Restore cursor position after paste
                setTimeout(() => {
                  if (textareaRef.current) {
                    const newCursorPos = selectionStart + pastedText.length;
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                  }
                }, 0);
              } else {
                // If pasted content would exceed limit, truncate it
                e.preventDefault();
                const remainingSpace = CHARACTER_LIMIT - currentValue.length + (selectionEnd - selectionStart);
                const truncatedPaste = pastedText.substring(0, Math.max(0, remainingSpace));
                const truncatedValue = 
                  currentValue.substring(0, selectionStart) + 
                  truncatedPaste + 
                  currentValue.substring(selectionEnd);
                handleContentChange(truncatedValue);
                toast.warning('Content was truncated to fit the character limit');
              }
            }}
            placeholder="Start typing your story here... Take your time. Every word matters."
            className="min-h-[250px] md:min-h-[350px] text-base md:text-lg leading-relaxed border-0 focus:ring-0 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            autoFocus
          />
        </div>

        <div className="border-t bg-gray-50 dark:bg-gray-900 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant={showPrompts || showIdlePrompt ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowPrompts(!showPrompts)}
                className={cn(
                  showIdlePrompt && "animate-pulse"
                )}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showIdlePrompt ? "Need a starting point?" : "Need inspiration?"}
              </Button>
              
              {autoSaved && (
                <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                  <Save className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-xs md:text-sm text-muted-foreground">
                <span className={cn(
                  "font-mono",
                  remainingChars < 100 && "text-orange-600",
                  remainingChars < 50 && "text-red-600"
                )}>
                  {remainingChars}
                </span>
                <span className="text-muted-foreground"> / {CHARACTER_LIMIT}</span>
              </div>
              
              <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                ~90 seconds
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300",
                progress < 80 && "bg-blue-500",
                progress >= 80 && progress < 95 && "bg-orange-500",
                progress >= 95 && "bg-red-500"
              )}
              style={{ width: `${progress}%` }}
            />
              </div>
            </div>
          </Card>

          {/* Mobile: Show prompts below */}
          {showPrompts && (
            <div className="md:hidden">
              <StoryPrompts 
                onSelectPrompt={handlePromptSelect}
                onClose={() => setShowPrompts(false)}
              />
            </div>
          )}

          <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
            <p className="text-center text-xs md:text-sm text-muted-foreground px-4">
              Your story will be transformed into audio to preserve your voice anonymously
            </p>

            <div className="flex justify-center">
              <Button
                size="default"
                onClick={() => {
                  trackStoryProgress('write', {
                    contentLength: content.length,
                    usedPrompts: showPrompts
                  });
                  onComplete(content);
                }}
                disabled={!canContinue}
              >
                Continue to Refine
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop: Show prompts on the right */}
        {showPrompts && (
          <div className="hidden md:block md:w-96">
            <StoryPrompts 
              onSelectPrompt={handlePromptSelect}
              onClose={() => setShowPrompts(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}