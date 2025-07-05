'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
          quickExit();
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
    // Clear any sensitive data
    localStorage.removeItem('draft_story');
    sessionStorage.clear();
    
    // Replace current page in history and redirect
    window.location.replace('https://www.google.com');
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={quickExit}
    >
      <X className="w-4 h-4 mr-1" />
      ESC
    </Button>
  );
}