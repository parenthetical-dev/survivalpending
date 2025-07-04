'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Copy, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface CredentialsStepProps {
  username: string;
  onNext: () => void;
}

export default function CredentialsStep({ username, onNext }: CredentialsStepProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const downloadCredentials = () => {
    const content = `Username: ${username}\nPassword: [The password you just created]`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'survival-pending-credentials.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setDownloaded(true);
    toast.success('Credentials downloaded successfully');
  };

  const copyUsername = async () => {
    try {
      await navigator.clipboard.writeText(username);
      setCopied(true);
      toast.success('Username copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy username');
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Save Your Login Information</CardTitle>
        <CardDescription>
          This is the ONLY way to access your account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">Critical: Save Your Credentials</AlertTitle>
          <AlertDescription className="text-yellow-800">
            We cannot recover your account. No email. No backup. This protects your 
            anonymity but means you MUST save these credentials.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your username:</p>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono bg-white px-3 py-2 rounded border flex-1">
                  {username}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyUsername}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Your password: The one you just created
            </p>
          </div>

          <Button
            onClick={downloadCredentials}
            className="w-full"
            variant={downloaded ? "outline" : "default"}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloaded ? 'Downloaded!' : 'Download Credentials'}
          </Button>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Save the file somewhere secure</p>
            <p>• Consider using a password manager</p>
            <p>• Do not share these credentials with anyone</p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={onNext} 
          className="w-full"
          disabled={!downloaded}
        >
          I've Saved My Credentials
        </Button>
      </CardFooter>
    </>
  );
}