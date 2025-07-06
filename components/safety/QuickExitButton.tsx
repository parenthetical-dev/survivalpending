'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function QuickExitButton() {
  useEffect(() => {
    let escapeCount = 0;
    let resetTimeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escapeCount++;
        
        clearTimeout(resetTimeout);
        resetTimeout = setTimeout(() => {
          escapeCount = 0;
        }, 1000);

        if (escapeCount >= 3) {
          // Track keyboard trigger separately
          trackEvent('QUICK_EXIT_USED', 'SAFETY', {
            trigger: 'keyboard',
            page: window.location.pathname
          });
          
          // Clear any sensitive data
          localStorage.removeItem('draft_story');
          sessionStorage.clear();
          
          // Replace current page in history and redirect
          window.location.replace('https://www.google.com');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(resetTimeout);
    };
  }, []);

  const quickExit = () => {
    // Track the quick exit usage
    trackEvent('QUICK_EXIT_USED', 'SAFETY', {
      trigger: 'button',
      page: window.location.pathname
    });
    
    // Clear any sensitive data
    localStorage.removeItem('draft_story');
    sessionStorage.clear();
    
    // Replace current page in history and redirect
    window.location.replace('https://www.google.com');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            onClick={quickExit}
          >
            <X className="w-4 h-4 mr-1" />
            ESC
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to immediately leave this page.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}