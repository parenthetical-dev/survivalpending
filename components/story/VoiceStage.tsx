'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Volume2, Mic, User, Globe, Heart } from 'lucide-react';
import StepHeader from './StepHeader';
import ProgressDots from './ProgressDots';
import { cn } from '@/lib/utils';
import { trackStoryProgress } from '@/lib/analytics';

interface VoiceStageProps {
  content: string;
  onComplete: (voiceSettings: VoiceSettings) => void;
  onBack: () => void;
}

export interface VoiceSettings {
  voiceId: string;
  name: string;
  description: string;
  accent: string;
  style: string;
}

// ElevenLabs voices that work well for personal stories
const VOICE_OPTIONS: VoiceSettings[] = [
  {
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    description: 'Warm and conversational',
    accent: 'American',
    style: 'Gentle, empathetic tone perfect for personal stories'
  },
  {
    voiceId: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Emily',
    description: 'Young and expressive',
    accent: 'American',
    style: 'Clear and emotional, good for impactful moments'
  },
  {
    voiceId: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    description: 'Friendly and authentic',
    accent: 'American',
    style: 'Natural speaking style with good emotional range'
  },
  {
    voiceId: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    description: 'Deep and thoughtful',
    accent: 'American',
    style: 'Measured pace, good for serious topics'
  },
  {
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    description: 'Clear and articulate',
    accent: 'American',
    style: 'Professional yet personal, versatile'
  },
  {
    voiceId: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    description: 'Young and relatable',
    accent: 'American',
    style: 'Energetic and engaging, good for hopeful stories'
  },
  {
    voiceId: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    description: 'Soft and contemplative',
    accent: 'American',
    style: 'Gentle delivery, perfect for vulnerable moments'
  },
  {
    voiceId: 'ThT5KcBeYPX3keUQqHPh',
    name: 'Bella',
    description: 'Warm and supportive',
    accent: 'American',
    style: 'Compassionate tone, great for community stories'
  }
];

export default function VoiceStage({ content, onComplete, onBack }: VoiceStageProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICE_OPTIONS[0].voiceId);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);

  const handlePreview = async (voiceId: string) => {
    setPreviewLoading(voiceId);
    
    // Preview the first sentence
    const firstSentence = content.split(/[.!?]/)[0] + '.';
    
    try {
      const response = await fetch('/api/voice/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          text: firstSentence.slice(0, 100), // Limit preview length
          voiceId
        }),
      });

      if (!response.ok) throw new Error('Preview failed');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();

      // Clean up
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setPreviewLoading(null);
    }
  };

  const getVoiceIcon = (name: string) => {
    // Return different icons based on voice characteristics
    if (['Sarah', 'Emily', 'Bella', 'Domi'].includes(name)) return <Heart className="w-3 h-3 sm:w-4 sm:h-4" />;
    if (['Josh', 'Adam'].includes(name)) return <User className="w-3 h-3 sm:w-4 sm:h-4" />;
    if (['Arnold'].includes(name)) return <Globe className="w-3 h-3 sm:w-4 sm:h-4" />;
    return <Mic className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  const selectedVoiceData = VOICE_OPTIONS.find(v => v.voiceId === selectedVoice)!;

  return (
    <div className="container max-w-full md:max-w-6xl mx-auto px-3 sm:px-4">
      <ProgressDots currentStep={3} />
      
      <Card className="p-0 overflow-hidden">
        <StepHeader
          currentStep={3}
          title="Choose Your Voice"
          description="Select a voice for your audio testimony"
        />
        <CardContent className="p-4 sm:p-6">
          <RadioGroup value={selectedVoice} onValueChange={setSelectedVoice}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {VOICE_OPTIONS.map((voice) => (
                <div
                  key={voice.voiceId}
                  className={cn(
                    "relative rounded-lg border p-3 sm:p-4 cursor-pointer transition-all hover:border-primary",
                    selectedVoice === voice.voiceId && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedVoice(voice.voiceId)}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={voice.voiceId} className="mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm sm:text-base font-semibold flex items-center gap-1 sm:gap-2 cursor-pointer">
                          {getVoiceIcon(voice.name)}
                          {voice.name}
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          {voice.accent}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {voice.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {voice.style}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs sm:text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(voice.voiceId);
                      }}
                      disabled={previewLoading === voice.voiceId}
                    >
                      {previewLoading === voice.voiceId ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Preview</span>
                          <span className="sm:hidden">Play</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
          
          <div className="mt-6 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-xs sm:text-sm text-center text-muted-foreground">
              <strong>Note:</strong> All voices are AI-generated to protect your anonymity. 
              No human voice recordings are used or stored.
            </p>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="ghost"
              size="default"
              className="w-full sm:w-auto"
              onClick={onBack}
            >
              Back
            </Button>
            <Button
              size="default"
              className="w-full sm:w-auto"
              onClick={() => {
                trackStoryProgress('voice');
                onComplete(selectedVoiceData);
              }}
            >
              Continue to Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}