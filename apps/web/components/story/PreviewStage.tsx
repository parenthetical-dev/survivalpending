'use client';

import { useState, useEffect, useCallback } from 'react';
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
  RotateCcw,
  Shield,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { VoiceSettings } from './VoiceStage';
import PlyrPlayer from '@/components/audio/PlyrPlayer';
import StepHeader from './StepHeader';
import ProgressDots from './ProgressDots';
import { trackStoryProgress } from '@/lib/analytics';

interface PreviewStageProps {
  content: string;
  voiceSettings: VoiceSettings;
  onComplete: () => void;
  onEdit: () => void;
  onBack: () => void;
}

export default function PreviewStage({
  content,
  voiceSettings,
  onComplete,
  onEdit,
  onBack,
}: PreviewStageProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateAudio = useCallback(async () => {
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
  }, [content, voiceSettings.voiceId]);

  useEffect(() => {
    generateAudio();
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [generateAudio]);

  return (
    <div className="container max-w-full md:max-w-6xl mx-auto px-3 sm:px-4">
      <ProgressDots currentStep={4} />

      <Card className="mb-4 sm:mb-6 p-0 overflow-hidden">
        <StepHeader
          currentStep={4}
          title="Review & Submit"
          description="Preview your story before sharing"
        />
        <CardContent className="p-4 sm:p-6 pt-3 sm:pt-4">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Your Story</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Voice: {voiceSettings.name} • {Math.ceil(content.length / 13)} seconds (estimated)
            </p>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{content}</p>
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

              <div className="space-y-3">
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                    <strong>Your identity is protected.</strong> Your story will be published with your anonymous username only. No personal information will ever be revealed.
                  </AlertDescription>
                </Alert>

                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                  <Info className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong> Once published, stories cannot be deleted to preserve the historical record. However, your anonymity is guaranteed—only your anonymous username will ever be shown.
                  </AlertDescription>
                </Alert>
              </div>
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
            trackStoryProgress('preview');
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

      <div className="text-center mt-4 sm:mt-6 space-y-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          By publishing, you're helping preserve our collective truth. Thank you for your courage.
        </p>
        <p className="text-xs text-muted-foreground/70">
          Your story will be permanently archived for historical preservation.
        </p>
      </div>
    </div>
  );
}