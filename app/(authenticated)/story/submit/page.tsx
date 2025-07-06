'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WriteStage from '@/components/story/WriteStage';
import RefineStage from '@/components/story/RefineStage';
import VoiceStage, { VoiceSettings } from '@/components/story/VoiceStage';
import PreviewStage from '@/components/story/PreviewStage';
import QuickExitButton from '@/components/safety/QuickExitButton';
import { toast } from 'sonner';
import { trackStoryProgress } from '@/lib/analytics';

type Stage = 'write' | 'refine' | 'voice' | 'preview';

export default function SubmitStoryPage() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState<Stage>('write');
  const [storyContent, setStoryContent] = useState('');
  const [refinedContent, setRefinedContent] = useState('');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings | null>(null);


  const handleWriteComplete = (content: string) => {
    setStoryContent(content);
    setRefinedContent(content); // Default to original if skipping refinement
    setCurrentStage('refine');
  };

  const handleRefineComplete = (content: string) => {
    setRefinedContent(content);
    trackStoryProgress('refine');
    setCurrentStage('voice');
  };

  const handleRefineSkip = () => {
    trackStoryProgress('refine');
    setCurrentStage('voice');
  };

  const handleVoiceComplete = (settings: VoiceSettings) => {
    setVoiceSettings(settings);
    setCurrentStage('preview');
  };

  const handleEdit = () => {
    setCurrentStage('write');
  };

  const handlePublish = async () => {
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
          voiceId: voiceSettings?.voiceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit story');
      }

      toast.success('Your story has been submitted');
      
      // Clear local storage
      localStorage.removeItem('draft_story');
      
      // Emit event for homepage to update story count
      window.dispatchEvent(new Event('storySubmitted'));
      
      // Redirect to success page or dashboard
      router.push('/story/success');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit story. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <QuickExitButton />
      
      <div className="py-4 md:py-8">
        <div className="container max-w-5xl mx-auto px-4 mb-6 md:mb-8">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold text-center">Share Your Story</h1>
          </div>
        </div>

        <div className="container max-w-5xl mx-auto px-4">
          {currentStage === 'write' && (
            <WriteStage onComplete={handleWriteComplete} />
          )}
          
          {currentStage === 'refine' && (
            <RefineStage 
              originalContent={storyContent}
              onComplete={handleRefineComplete}
              onSkip={handleRefineSkip}
              onBack={() => setCurrentStage('write')}
            />
          )}
          
          {currentStage === 'voice' && (
            <VoiceStage 
              content={refinedContent}
              onComplete={handleVoiceComplete}
              onBack={() => setCurrentStage('refine')}
            />
          )}
          
          {currentStage === 'preview' && voiceSettings && (
            <PreviewStage 
              content={refinedContent}
              voiceSettings={voiceSettings}
              onComplete={handlePublish}
              onEdit={handleEdit}
              onBack={() => setCurrentStage('voice')}
            />
          )}
        </div>
      </div>
    </div>
  );
}