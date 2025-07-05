'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { X, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { trackCrisisResource } from '@/lib/analytics';

interface SafetyStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SafetyStep({ onNext, onBack }: SafetyStepProps) {
  const [understood, setUnderstood] = useState(false);

  return (
    <>
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="text-xl md:text-2xl">Your Safety First</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Important safety features and crisis resources
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 md:space-y-6 pt-0">
        <Alert className="border-red-200 bg-red-50 py-3">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900 mb-1 md:mb-2 text-sm md:text-base">Quick Exit</AlertTitle>
          <AlertDescription className="text-red-800 space-y-1.5 md:space-y-2 text-xs md:text-sm">
            <div className="font-medium">To quickly exit:</div>
            <ul className="space-y-1 ml-4">
              <li className="flex items-center gap-2">
                • Press <kbd className="px-2 py-1 text-xs bg-red-100 text-red-900 rounded border border-red-300">ESC</kbd> 3 times
              </li>
              <li className="flex items-center gap-2">
                • Or click <Badge variant="destructive" className="ml-1">
                  <X className="w-3 h-3 mr-1" />ESC
                </Badge>
              </li>
            </ul>
            <div className="mt-3 font-medium">
              No history. No trace.
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Need someone to talk to right now?</h3>
            <p className="text-sm text-muted-foreground mt-1">If you feel you need to speak to someone, there's people to listen right now.</p>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 md:p-4 bg-gray-50 rounded-lg space-y-1.5 md:space-y-2">
              <div>
                <p className="font-medium text-sm md:text-base">Trans Lifeline</p>
                <p className="text-xs md:text-sm text-muted-foreground">Peer support by and for trans people - Available 24/7</p>
              </div>
              <div className="flex gap-3">
                <a 
                  href="tel:877-565-8860" 
                  onClick={() => trackCrisisResource('Trans Lifeline Phone', 'onboarding')}
                  className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-blue-600 hover:text-blue-800"
                >
                  <Phone className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">877-565-8860</span>
                </a>
              </div>
            </div>

            <div className="p-3 md:p-4 bg-gray-50 rounded-lg space-y-1.5 md:space-y-2">
              <div>
                <p className="font-medium text-sm md:text-base">The Trevor Project</p>
                <p className="text-xs md:text-sm text-muted-foreground">Support for LGBTQ youth - Available 24/7</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="https://chat.trvr.org/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={() => trackCrisisResource('Trevor Project Chat', 'onboarding')}
                  className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-blue-600 hover:text-blue-800"
                >
                  <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">Chat</span>
                </a>
                <a 
                  href="tel:1-866-488-7386" 
                  onClick={() => trackCrisisResource('Trevor Project Phone', 'onboarding')}
                  className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-blue-600 hover:text-blue-800"
                >
                  <Phone className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">1-866-488-7386</span>
                </a>
                <a 
                  href="sms:678678" 
                  onClick={() => trackCrisisResource('Trevor Project Text', 'onboarding')}
                  className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-blue-600 hover:text-blue-800"
                >
                  <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">Text 678678</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm text-purple-900 dark:text-purple-100">
            If you're struggling, we'll show resources. No judgment. Just support.
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-xs md:text-sm">
            I understand these safety features and know help is available
          </span>
        </label>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 md:pt-6">
        <Button variant="outline" onClick={onBack} size="default">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1"
          size="default"
          disabled={!understood}
        >
          Continue
        </Button>
      </CardFooter>
    </>
  );
}