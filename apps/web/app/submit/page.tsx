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

  // Scroll to top when stage changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStage]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="pt-20 md:pt-24 pb-12">
        {currentStage === 'write' && (
          <WriteStage onComplete={handleWriteComplete} />
        )}

        {currentStage === 'refine' && (
          <RefineStage
            originalContent={storyContent}
            onComplete={handleRefineComplete}
            onSkip={() => setCurrentStage('voice')}
            onBack={() => setCurrentStage('write')}
          />
        )}

        {currentStage === 'voice' && (
          <VoiceStage
            content={refinedContent}
            onComplete={(voiceSettings) => {
              setSelectedVoice(voiceSettings);
              setCurrentStage('preview');
            }}
            onBack={() => setCurrentStage('refine')}
          />
        )}

        {currentStage === 'preview' && selectedVoice && (
          <PreviewStage
            content={refinedContent}
            voiceSettings={selectedVoice}
            onComplete={handleSubmit}
            onEdit={() => setCurrentStage('write')}
            onBack={() => setCurrentStage('voice')}
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