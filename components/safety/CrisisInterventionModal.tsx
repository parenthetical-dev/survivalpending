'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Phone, MessageCircle, Globe } from 'lucide-react';

interface CrisisInterventionModalProps {
  open: boolean;
  onClose: () => void;
  onResourceClick?: (resource: string) => void;
}

const resources = [
  {
    name: 'Trans Lifeline',
    phone: '877-565-8860',
    description: 'Peer support by and for trans people',
    icon: Phone,
    url: 'https://translifeline.org',
  },
  {
    name: 'Trevor Project',
    phone: '1-866-488-7386',
    description: '24/7 crisis support for LGBTQ+ youth',
    icon: MessageCircle,
    url: 'https://www.thetrevorproject.org',
  },
  {
    name: 'LGBTQ National Hotline',
    phone: '1-888-843-4564',
    description: 'Free confidential support',
    icon: Phone,
    url: 'https://www.lgbthotline.org',
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: '24/7 text-based crisis support',
    icon: MessageCircle,
    url: 'https://www.crisistextline.org',
  },
];

export default function CrisisInterventionModal({
  open,
  onClose,
  onResourceClick,
}: CrisisInterventionModalProps) {
  const handleResourceClick = (resourceName: string, url: string) => {
    if (onResourceClick) {
      onResourceClick(resourceName);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-md">
        <DialogHeader className="pb-2 md:pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            We're here for you
          </DialogTitle>
          <DialogDescription>
            Thank you for sharing your story. Your courage matters, and you're not alone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4 py-3 md:py-4">
          <Alert className="py-3">
            <AlertDescription className="text-xs md:text-sm">
              If you're having thoughts of self-harm or need immediate support, please reach out to one of these resources:
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {resources.map((resource) => (
              <button
                key={resource.name}
                onClick={() => handleResourceClick(resource.name, resource.url)}
                className="w-full p-3 md:p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <resource.icon className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm md:text-base">{resource.name}</h4>
                    {resource.phone.includes('Text') ? (
                      <p className="text-xs md:text-sm text-primary font-mono">{resource.phone}</p>
                    ) : (
                      <a
                        href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                        className="text-xs md:text-sm text-primary font-mono hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {resource.phone}
                      </a>
                    )}
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                      {resource.description}
                    </p>
                  </div>
                  <Globe className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          <div className="text-xs md:text-sm text-muted-foreground space-y-1.5 md:space-y-2">
            <p>All services listed are:</p>
            <ul className="list-disc list-inside space-y-0.5 md:space-y-1 ml-2">
              <li>Free and confidential</li>
              <li>LGBTQ+ affirming</li>
              <li>Available 24/7 (except Trans Lifeline)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}