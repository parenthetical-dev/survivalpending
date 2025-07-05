'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/logo';
import WriteStage from '@/components/story/WriteStage';
import RefineStage from '@/components/story/RefineStage';
import VoiceStage from '@/components/story/VoiceStage';
import PreviewStage from '@/components/story/PreviewStage';
import CrisisInterventionModal from '@/components/safety/CrisisInterventionModal';
import Navbar from '@/components/layout/Navbar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { trackCrisisResource } from '@/lib/analytics';

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
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisInterventionLogId, setCrisisInterventionLogId] = useState<string | null>(null);

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

      const data = await response.json();
      
      // Clear the draft from localStorage after successful submission
      localStorage.removeItem('draft_story');
      
      if (data.hasCrisisContent) {
        // Show crisis intervention modal
        setShowCrisisModal(true);
        setCrisisInterventionLogId(data.storyId); // Store for tracking resource clicks
        
        // Track that the intervention was shown
        try {
          await fetch('/api/crisis/intervention-shown', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              storyId: data.storyId,
            }),
          });
        } catch (error) {
          console.error('Failed to track intervention shown:', error);
        }
      } else {
        toast.success('Your story has been submitted for review.');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error) {
      toast.error('Failed to submit story. Please try again.');
    }
  };

  if (!user) return null;

  const currentStageIndex = STAGES.indexOf(currentStage) + 1;
  const progress = (currentStageIndex / STAGES.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="fixed top-[60px] md:top-[80px] left-0 right-0 bg-gray-50 dark:bg-gray-900 z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <Progress value={progress} className="h-2 mb-2 [&>div]:bg-gray-900 dark:[&>div]:bg-gray-100" />
          <div className="text-sm text-muted-foreground text-center">
            {currentStage === 'write' && 'Step 1 of 4: Write'}
            {currentStage === 'refine' && 'Step 2 of 4: Refine'}
            {currentStage === 'voice' && 'Step 3 of 4: Voice'}
            {currentStage === 'preview' && 'Step 4 of 4: Preview'}
          </div>
        </div>
      </div>

      <div className="pt-44 md:pt-52 pb-12">
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
      
      <CrisisInterventionModal
        open={showCrisisModal}
        onClose={() => {
          setShowCrisisModal(false);
          toast.success('Your story has been submitted for review.');
          router.push('/dashboard');
        }}
        onResourceClick={async (resource) => {
          trackCrisisResource(resource, 'modal');
          
          // Also track in the database
          if (crisisInterventionLogId) {
            try {
              await fetch('/api/crisis/resource-clicked', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                  storyId: crisisInterventionLogId,
                  resourceName: resource,
                }),
              });
            } catch (error) {
              console.error('Failed to track resource click:', error);
            }
          }
        }}
      />
    </div>
  );
}