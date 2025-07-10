'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import CredentialsStep from '@/components/onboarding/CredentialsStep';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import SafetyStep from '@/components/onboarding/SafetyStep';
import DemographicsStep from '@/components/onboarding/DemographicsStep';
import ReviewStep from '@/components/onboarding/ReviewStep';
import { trackEvent, trackOnboardingStep } from '@/lib/analytics';
import ShareModal from '@/components/share/ShareModal';

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [demographicData, setDemographicData] = useState({
    ageRange: '',
    state: '',
    genderIdentity: '',
    racialIdentity: '',
    urbanicity: '',
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Scroll to top when step changes and track progress
  useEffect(() => {
    window.scrollTo(0, 0);

    // Track onboarding step view
    const stepNames = ['welcome', 'credentials', 'safety', 'demographics', 'review'];
    if (currentStep > 0 && currentStep <= TOTAL_STEPS) {
      trackOnboardingStep(currentStep, stepNames[currentStep - 1]);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      // Track step completion
      const stepNames = ['welcome', 'credentials', 'safety', 'demographics', 'review'];
      trackOnboardingStep(currentStep, stepNames[currentStep - 1], true);

      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save demographics to database
      if (demographicData.ageRange || demographicData.state || demographicData.genderIdentity || demographicData.racialIdentity || demographicData.urbanicity) {
        const response = await fetch('/api/user/demographics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(demographicData),
        });

        if (!response.ok) {
          throw new Error('Failed to save demographics');
        }
      }

      // Track completion
      trackEvent('ONBOARDING_COMPLETE', 'USER', {
        providedDemographics: !!(demographicData.ageRange || demographicData.state || demographicData.genderIdentity || demographicData.racialIdentity || demographicData.urbanicity),
      });

      // Mark onboarding as complete in localStorage
      localStorage.setItem('onboardingComplete', 'true');

      toast.success('Welcome to Survival Pending!');
      router.push('/submit');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} username={user?.username || ''} />;
      case 2:
        return <CredentialsStep username={user?.username || ''} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <SafetyStep onNext={handleNext} onBack={handleBack} />;
      case 4:
        return (
          <DemographicsStep
            data={demographicData}
            onChange={setDemographicData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <ReviewStep
            data={demographicData}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:pt-20">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] p-4">
          <div className="w-full max-w-2xl">
            <div className="mb-8">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center mt-2">
                Step {currentStep} of {TOTAL_STEPS}
              </p>
            </div>

            {renderStep()}
          </div>
        </div>
      </div>

      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={() => {
          // Could track sharing analytics here if needed
        }}
      />
    </>
  );
}