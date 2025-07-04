'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import CredentialsStep from '@/components/onboarding/CredentialsStep';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import SafetyStep from '@/components/onboarding/SafetyStep';
import DemographicsStep from '@/components/onboarding/DemographicsStep';
import ReviewStep from '@/components/onboarding/ReviewStep';

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [demographicData, setDemographicData] = useState({
    ageRange: '',
    state: '',
    genderIdentity: '',
    racialIdentity: '',
    urbanicity: '',
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
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

      toast.success('Welcome to Survival Pending! You can now share your story.');
      router.push('/submit');
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4 md:py-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl">
              <Logo />
            </h1>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-20 md:py-0">
        <div className="w-full max-w-2xl space-y-4 md:space-y-6">
          <div className="flex justify-center">
            <Progress value={progress} className="w-48 md:w-64 h-1.5 md:h-2" />
          </div>
          <Card>
          {currentStep === 1 && (
            <CredentialsStep 
              username={user.username}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <WelcomeStep 
              onNext={handleNext}
              username={user.username}
            />
          )}

          {currentStep === 3 && (
            <SafetyStep 
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <DemographicsStep 
              data={demographicData}
              onChange={setDemographicData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && (
            <ReviewStep 
              data={demographicData}
              onBack={handleBack}
              onComplete={handleComplete}
            />
          )}
          </Card>
        </div>
      </div>
    </div>
  );
}