'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, SkipForward, Edit2, Check } from 'lucide-react';
import StepHeader from './StepHeader';
import ProgressDots from './ProgressDots';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RefineStageProps {
  originalContent: string;
  onComplete: (content: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

interface Suggestion {
  type: 'clarity' | 'impact' | 'flow';
  original: string;
  suggested: string;
  reason: string;
}

interface RefineResponse {
  refinedVersion?: string;
  suggestions: Suggestion[];
}

export default function RefineStage({ originalContent, onComplete, onSkip, onBack }: RefineStageProps) {
  const [content, setContent] = useState(originalContent);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [refinedVersion, setRefinedVersion] = useState<string | null>(null);
  const [showRefinedVersion, setShowRefinedVersion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: originalContent }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');

      const data: RefineResponse = await response.json();
      setSuggestions(data.suggestions || []);
      setRefinedVersion(data.refinedVersion || null);
    } catch (error) {
      console.error('Refinement error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (index: number, suggestion: Suggestion) => {
    const newContent = content.replace(suggestion.original, suggestion.suggested);
    setContent(newContent);
    setAppliedSuggestions(new Set([...appliedSuggestions, index]));
    toast.success('Suggestion applied');
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'clarity': return '💎';
      case 'impact': return '⚡';
      case 'flow': return '🌊';
      default: return '✨';
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <ProgressDots currentStep={2} />
      
      <Card className="mb-6 p-0 overflow-hidden">
        <StepHeader
          currentStep={2}
          title="Optional AI Refinement"
          description="AI helps polish while preserving your voice"
        />
        
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Left column - Story editor */}
            <div className="flex flex-col">
              <div className="mb-4">
                <h3 className="text-base md:text-lg font-semibold">Your Story</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {editing ? 'Edit directly or apply suggestions' : 'Original version'}
                </p>
              </div>
              
              <div className="flex-1 flex flex-col">
                {editing ? (
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 min-h-[300px] md:min-h-[400px] text-sm md:text-base leading-relaxed"
                  />
                ) : (
                  <div className="flex-1 prose prose-xs md:prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm md:text-base">{content}</p>
                  </div>
                )}
              </div>
              
              {refinedVersion && !editing && (
                <div className="mt-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs md:text-sm font-medium text-blue-900 dark:text-blue-100">
                        AI Suggested Complete Rewrite
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={showRefinedVersion ? "default" : "outline"}
                      onClick={() => {
                        if (!showRefinedVersion) {
                          setContent(refinedVersion);
                          setShowRefinedVersion(true);
                          toast.success('Applied refined version');
                        } else {
                          setContent(originalContent);
                          setShowRefinedVersion(false);
                          setAppliedSuggestions(new Set());
                          toast.info('Reverted to original');
                        }
                      }}
                    >
                      {showRefinedVersion ? 'Revert to Original' : 'Try This Version'}
                    </Button>
                  </div>
                  {!showRefinedVersion && (
                    <p className="text-xs text-muted-foreground">
                      The AI has suggested a restructured version for better flow
                    </p>
                  )}
                </div>
              )}
              
              <div className="mt-4">
                <Button
                  variant={editing ? "default" : "outline"}
                  onClick={() => setEditing(!editing)}
                  className="w-full"
                >
                  {editing ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Done Editing
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Manually
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right column - AI suggestions */}
            <div className="flex flex-col">
              <div className="mb-4">
                <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                  AI Suggestions
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Optional enhancements for clarity and impact
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Your story is already powerful as written!</p>
                    {refinedVersion && (
                      <p className="text-sm mt-2">
                        Check the complete rewrite option on the left for structural improvements.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <Card 
                        key={index}
                        className={cn(
                          "p-3 md:p-4 cursor-pointer transition-all",
                          appliedSuggestions.has(index) && "opacity-50"
                        )}
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <span className="text-lg md:text-2xl">{getSuggestionIcon(suggestion.type)}</span>
                          <div className="flex-1 space-y-1.5 md:space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.type}
                              </Badge>
                              {appliedSuggestions.has(index) && (
                                <Badge variant="default" className="text-xs">
                                  Applied
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground">{suggestion.reason}</p>
                            <div className="text-xs md:text-sm space-y-1">
                              <div className="line-through opacity-60">{suggestion.original}</div>
                              <div className="font-medium">{suggestion.suggested}</div>
                            </div>
                            {!appliedSuggestions.has(index) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applySuggestion(index, suggestion)}
                                disabled={editing}
                              >
                                Apply
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
        <Button
          variant="ghost"
          size="default"
          onClick={onBack}
          className="w-full sm:w-auto"
        >
          Back
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={onSkip}
          className="w-full sm:w-auto"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip Refinement
        </Button>
        <Button
          size="default"
          onClick={() => onComplete(content)}
          className="w-full sm:w-auto"
        >
          Continue to Voice Selection
        </Button>
      </div>

      <p className="text-center text-xs md:text-sm text-muted-foreground mt-3 md:mt-4 px-4">
        These are just suggestions. Your authentic voice matters most.
      </p>
    </div>
  );
}