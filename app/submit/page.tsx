'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/logo';
import WriteStage from '@/components/story/WriteStage';
import RefineStage from '@/components/story/RefineStage';
import VoiceStage from '@/components/story/VoiceStage';
import PreviewStage from '@/components/story/PreviewStage';
import QuickExitButton from '@/components/safety/QuickExitButton';
import { toast } from 'sonner';

const STAGES = ['write', 'refine', 'voice', 'preview'] as const;
type Stage = typeof STAGES[number];

export default function SubmitStoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStage, setCurrentStage] = useState<Stage>('write');
  const [storyContent, setStoryContent] = useState('');
  const [refinedContent, setRefinedContent] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleWriteComplete = (content: string) => {
    setStoryContent(content);
    setRefinedContent(content); // Default to original if skipping refinement
    setCurrentStage('refine');
  };

  const handleRefineComplete = (content: string) => {
    setRefinedContent(content);
    setCurrentStage('voice');
  };

  const handleVoiceSelected = (voiceId: string) => {
    setSelectedVoice(voiceId);
    setCurrentStage('preview');
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/story/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          contentText: storyContent,
          contentSanitized: refinedContent,
          voiceId: selectedVoice?.voiceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit story');
      }

      toast.success('Your story has been submitted for review.');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to submit story. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <QuickExitButton />
      
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent z-10">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl">
              <Logo />
            </h1>
            <div className="text-sm text-muted-foreground">
              {currentStage === 'write' && 'Step 1 of 4: Write'}
              {currentStage === 'refine' && 'Step 2 of 4: Refine'}
              {currentStage === 'voice' && 'Step 3 of 4: Voice'}
              {currentStage === 'preview' && 'Step 4 of 4: Preview'}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-12">
        {currentStage === 'write' && (
          <WriteStage onComplete={handleWriteComplete} />
        )}
        
        {currentStage === 'refine' && (
          <RefineStage 
            originalContent={storyContent}
            onComplete={handleRefineComplete}
            onSkip={() => setCurrentStage('voice')}
          />
        )}
        
        {currentStage === 'voice' && (
          <VoiceStage 
            content={refinedContent}
            onComplete={(voiceSettings) => {
              setSelectedVoice(voiceSettings);
              setCurrentStage('preview');
            }}
          />
        )}
        
        {currentStage === 'preview' && selectedVoice && (
          <PreviewStage 
            content={refinedContent}
            voiceSettings={selectedVoice}
            onComplete={handleSubmit}
            onEdit={() => setCurrentStage('write')}
          />
        )}
      </div>
    </div>
  );
}