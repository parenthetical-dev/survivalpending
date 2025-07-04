'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, SkipForward, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RefineStageProps {
  originalContent: string;
  onComplete: (content: string) => void;
  onSkip: () => void;
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

export default function RefineStage({ originalContent, onComplete, onSkip }: RefineStageProps) {
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
      if (data.refinedVersion && data.refinedVersion !== originalContent) {
        setRefinedVersion(data.refinedVersion);
      }
    } catch (error) {
      toast.error('Failed to load suggestions. You can continue without them.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (index: number, suggestion: Suggestion) => {
    // Don't apply individual suggestions if using refined version
    if (showRefinedVersion) {
      toast.warning('Please revert to original before applying individual suggestions');
      return;
    }
    
    const newContent = content.replace(suggestion.original, suggestion.suggested);
    setContent(newContent);
    setAppliedSuggestions(new Set([...appliedSuggestions, index]));
    toast.success('Suggestion applied');
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'clarity': return '💡';
      case 'impact': return '⚡';
      case 'flow': return '🌊';
      default: return '✨';
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Let's make your story resonate</h2>
        <p className="text-muted-foreground">
          AI suggestions to enhance clarity and impact. Your voice remains authentic.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Story</CardTitle>
              <CardDescription>
                {editing ? 'Edit directly or apply suggestions' : 'Original version'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] text-base leading-relaxed"
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{content}</p>
                </div>
              )}
              
              {refinedVersion && !editing && (
                <div className="mt-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
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
            </CardContent>
          </Card>

          <div className="mt-4 flex gap-2">
            <Button
              variant={editing ? "default" : "outline"}
              onClick={() => setEditing(!editing)}
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Suggestions
              </CardTitle>
              <CardDescription>
                Optional enhancements for clarity and impact
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        "p-4 cursor-pointer transition-all",
                        appliedSuggestions.has(index) && "opacity-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getSuggestionIcon(suggestion.type)}</span>
                        <div className="flex-1 space-y-2">
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
                          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                          <div className="text-sm space-y-1">
                            <div className="line-through opacity-60">{suggestion.original}</div>
                            <div className="font-medium">{suggestion.suggested}</div>
                          </div>
                          {!appliedSuggestions.has(index) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => applySuggestion(index, suggestion)}
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
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onSkip}
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip Refinement
        </Button>
        <Button
          size="lg"
          onClick={() => onComplete(content)}
        >
          Continue to Voice Selection
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        These are just suggestions. Your authentic voice matters most.
      </p>
    </div>
  );
}