'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Mail, 
  Copy, 
  Share2, 
  AlertTriangle,
  Shield,
  Check,
  Smartphone,
  Users,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  onShare?: (method: string) => void;
}

const shareMessage = "I found a platform where LGBTQ+ people are documenting their stories before they're erased. It's anonymous and safe. survivalpending.com";

const privateShareMethods = [
  {
    id: 'text',
    name: 'Text Message',
    icon: Smartphone,
    description: 'Share via SMS - most private',
    action: () => {
      // Check if on mobile vs desktop for better SMS handling
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Mobile: use sms: protocol
        window.location.href = `sms:?body=${encodeURIComponent(shareMessage)}`;
      } else {
        // Desktop: fallback to copying
        navigator.clipboard.writeText(shareMessage);
        toast.success('Message copied! Send via your messaging app');
      }
    }
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    description: 'Encrypted messaging',
    action: () => {
      // WhatsApp has great web/app integration
      window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
    }
  },
  {
    id: 'signal',
    name: 'Signal',
    icon: Shield,
    description: 'Most secure - end-to-end encrypted',
    action: () => {
      // Signal uses a custom protocol
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = `signal://send?text=${encodeURIComponent(shareMessage)}`;
        // Fallback if Signal isn't installed
        setTimeout(() => {
          navigator.clipboard.writeText(shareMessage);
          toast.info('Message copied! Open Signal to share');
        }, 1000);
      } else {
        navigator.clipboard.writeText(shareMessage);
        toast.success('Message copied! Paste in Signal');
      }
    }
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: MessageCircle,
    description: 'Fast and secure messaging',
    action: () => {
      window.open(`https://t.me/share/url?url=${encodeURIComponent('https://survivalpending.com')}&text=${encodeURIComponent(shareMessage)}`, '_blank');
    }
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    description: 'Share via email',
    action: () => {
      const subject = 'A safe space for our stories';
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareMessage)}`;
    }
  },
  {
    id: 'copy',
    name: 'Copy Link',
    icon: Copy,
    description: 'Copy to clipboard to share anywhere',
    action: () => {
      navigator.clipboard.writeText('https://survivalpending.com');
      toast.success('Link copied to clipboard!');
    }
  }
];

const publicShareMethods = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Share2,
    warning: 'Public post - visible to anyone',
    action: () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`, '_blank');
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: MessageCircle,
    warning: 'Opens Instagram app (mobile) or web',
    action: () => {
      // Check if on mobile
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // On mobile, try to open Instagram app
        window.location.href = 'instagram://library';
        setTimeout(() => {
          // Fallback to Instagram web if app doesn't open
          window.open('https://www.instagram.com', '_blank');
        }, 1500);
      } else {
        // On desktop, open Instagram web
        window.open('https://www.instagram.com', '_blank');
        navigator.clipboard.writeText(shareMessage);
        toast.info('Message copied! Create a post or story on Instagram');
      }
    }
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Globe,
    warning: 'Public video platform',
    action: () => {
      // TikTok web share URL
      const tiktokUrl = `https://www.tiktok.com/upload?lang=en`;
      window.open(tiktokUrl, '_blank');
      navigator.clipboard.writeText(shareMessage);
      toast.info('Message copied! Add to your TikTok caption');
    }
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Users,
    warning: 'May appear in others\' feeds',
    action: () => {
      // Try the dialog share method
      const fbShareUrl = `https://www.facebook.com/dialog/share?app_id=YOUR_APP_ID&display=popup&href=${encodeURIComponent('https://survivalpending.com')}&redirect_uri=${encodeURIComponent('https://survivalpending.com')}`;
      
      // For now, since we don't have a Facebook App ID, just open Facebook and copy message
      window.open('https://www.facebook.com', '_blank');
      navigator.clipboard.writeText(`${shareMessage}\n\nhttps://survivalpending.com`);
      toast.info('Opening Facebook. Message and link copied - create a post and paste!');
    }
  }
];

export default function ShareModal({ open, onClose, onShare }: ShareModalProps) {
  const [showPublicWarning, setShowPublicWarning] = useState(false);

  const handleShare = async (method: string, action: () => void) => {
    try {
      action();
      
      // Track the share
      await fetch('/api/user/shares', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method }),
      });
      
      if (onShare) {
        onShare(method);
      }
      
      // Close modal after a short delay for private methods
      if (!publicShareMethods.find(m => m.id === method)) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share the Word
          </DialogTitle>
          <DialogDescription>
            Help others find a safe space to document their truth
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="private" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="private" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Private
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Public
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="private" className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                These methods keep your sharing private and don't create public posts
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              {privateShareMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleShare(method.id, method.action)}
                  className="w-full p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <method.icon className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="public" className="space-y-4">
            {!showPublicWarning ? (
              <>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Privacy Warning:</strong> Public shares may reveal your interest in LGBTQ+ resources to others. Consider your safety before proceeding.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={() => setShowPublicWarning(true)}
                  className="w-full"
                  variant="outline"
                >
                  I understand, show public options
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                {publicShareMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleShare(method.id, method.action)}
                    className="w-full p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <method.icon className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-orange-600 dark:text-orange-400">{method.warning}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Message preview:</strong><br />
            "{shareMessage}"
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}