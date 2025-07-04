'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Volume2, 
  Loader2, 
  CheckCircle, 
  Edit3, 
  Share2, 
  AlertTriangle,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { VoiceSettings } from './VoiceStage';
import PlyrPlayer from '@/components/audio/PlyrPlayer';

interface PreviewStageProps {
  content: string;
  voiceSettings: VoiceSettings;
  onComplete: () => void;
  onEdit: () => void;
}

export default function PreviewStage({ 
  content, 
  voiceSettings, 
  onComplete, 
  onEdit 
}: PreviewStageProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    generateAudio();
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const generateAudio = async () => {
    try {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          text: content,
          voiceId: voiceSettings.voiceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      let url: string;
      
      // Check if response is JSON (new format) or blob (fallback format)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        url = data.url;
        setAudioUrl(url);
      } else {
        // Fallback: handle direct audio response
        const blob = await response.blob();
        url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }

      // Audio is handled by Plyr
    } catch (err) {
      setError('Failed to generate audio. Please try again.');
      console.error('Audio generation error:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container max-w-3xl mx-auto px-3 sm:px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold mb-2">Preview your story</h2>
        <p className="text-xs sm:text-base text-muted-foreground">
          Listen to how your story sounds. Make sure you're happy before publishing.
        </p>
      </div>

      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Your Story</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Voice: {voiceSettings.name} • {Math.ceil(content.length / 13)} seconds (estimated)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3 sm:pt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none mb-4 sm:mb-6">
            <p className="whitespace-pre-wrap text-sm sm:text-base md:text-lg leading-relaxed">{content}</p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-3 sm:space-y-4">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
              <p className="text-xs sm:text-sm text-muted-foreground">Generating audio...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-3 sm:space-y-4">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
              <p className="text-xs sm:text-sm text-muted-foreground">Generating audio...</p>
            </div>
          )}

          {!loading && !error && audioUrl && (
            <div className="space-y-4">
              <PlyrPlayer 
                audioUrl={audioUrl}
                onEnd={() => setIsPlaying(false)}
                className="mb-4"
              />

              <Alert>
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  Your story will be anonymous. Both the audio and text will be preserved to share your truth, but your identity remains protected.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          variant="outline"
          size="default"
          onClick={onEdit}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Edit Story
        </Button>
        <Button
          size="default"
          onClick={async () => {
            setIsSubmitting(true);
            await onComplete();
            setIsSubmitting(false);
          }}
          disabled={loading || !!error || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Publish Story
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
        By publishing, you're helping preserve our collective truth. Thank you for your courage.
      </p>
    </div>
  );
}