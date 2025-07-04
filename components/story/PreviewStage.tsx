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
    <div className="container max-w-3xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Preview your story</h2>
        <p className="text-muted-foreground">
          Listen to how your story sounds. Make sure you're happy before publishing.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Story</CardTitle>
          <CardDescription>
            Voice: {voiceSettings.name} • {Math.ceil(content.length / 13)} seconds (estimated)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating audio...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating audio...</p>
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
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your story will be anonymous. Both the audio and text will be preserved to share your truth, but your identity remains protected.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={onEdit}
          disabled={loading}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Story
        </Button>
        <Button
          size="lg"
          onClick={onComplete}
          disabled={loading || !!error}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Publish Story
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        By publishing, you're helping preserve our collective truth. Thank you for your courage.
      </p>
    </div>
  );
}