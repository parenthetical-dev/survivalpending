'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Lightbulb, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import StoryPrompts from './StoryPrompts';
import { toast } from 'sonner';

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
      }, 1000);
    }

    return () => clearTimeout(saveTimeoutRef.current);
  }, [content]);

  useEffect(() => {
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
    <div className="container max-w-4xl mx-auto px-4">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">What's your story?</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Take your time. Every word matters.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
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
            placeholder="Start typing... Your words will become a voice for others to hear."
            className="min-h-[300px] md:min-h-[400px] text-base md:text-lg leading-relaxed border-0 focus:ring-0 resize-none"
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

      {showPrompts && (
        <StoryPrompts 
          onSelectPrompt={handlePromptSelect}
          onClose={() => setShowPrompts(false)}
        />
      )}

      <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
        <p className="text-center text-xs md:text-sm text-muted-foreground px-4">
          Your story will be transformed into audio to preserve your voice anonymously
        </p>

        <div className="flex justify-center">
          <Button
            size="default"
            onClick={() => onComplete(content)}
            disabled={!canContinue}
          >
            Continue to Refine
          </Button>
        </div>
      </div>
    </div>
  );
}