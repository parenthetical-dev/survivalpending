'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns-v4';

interface Story {
  storyId: string;
  username: string;
  content: string;
  contentSanitized?: string;
  audioUrl?: string;
  categories: string[];
  tags: string[];
  createdAt: string;
  sentimentFlags?: {
    positiveResilience: boolean;
  };
}

interface StoriesGridProps {
  stories: Story[];
}

export default function StoriesGrid({ stories }: StoriesGridProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Cleanup audio elements on unmount
    return () => {
      Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [audioElements]);

  const togglePlayPause = (storyId: string, audioUrl?: string) => {
    if (!audioUrl) return;

    if (playingId === storyId) {
      // Pause current audio
      audioElements[storyId]?.pause();
      setPlayingId(null);
    } else {
      // Pause any currently playing audio
      if (playingId && audioElements[playingId]) {
        audioElements[playingId].pause();
      }

      // Play new audio
      if (!audioElements[storyId]) {
        const audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => setPlayingId(null));
        setAudioElements(prev => ({ ...prev, [storyId]: audio }));
        audio.play();
      } else {
        audioElements[storyId].play();
      }
      setPlayingId(storyId);
    }
  };

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No stories to display yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <Card key={story.storyId} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-medium">
                  {story.username}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                </CardDescription>
              </div>
              {story.sentimentFlags?.positiveResilience && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Resilience
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <p className="text-sm leading-relaxed line-clamp-4">
              {story.contentSanitized || story.content}
            </p>

            {story.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {story.categories.map((category) => (
                  <Badge key={category} variant="outline" className="text-xs">
                    {category.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            )}

            {story.audioUrl && (
              <Button
                size="sm"
                variant={playingId === story.storyId ? 'default' : 'outline'}
                onClick={() => togglePlayPause(story.storyId, story.audioUrl)}
                className="w-full"
              >
                {playingId === story.storyId ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Listen
                  </>
                )}
              </Button>
            )}

            {story.tags.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Tag className="w-3 h-3" />
                {story.tags.slice(0, 3).join(', ')}
                {story.tags.length > 3 && ` +${story.tags.length - 3} more`}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}