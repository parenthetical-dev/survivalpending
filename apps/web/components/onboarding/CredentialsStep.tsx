'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Copy, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CredentialsStepProps {
  username: string;
  onNext: () => void;
  onBack: () => void;
}

export default function CredentialsStep({ username, onNext, onBack }: CredentialsStepProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const downloadCredentials = () => {
    const content = `Username: ${username}\n\nNote: Your password is not included in this file for privacy and security reasons. Please remember the password you just created.`;
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
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="text-xl md:text-2xl">Save Your Login Information</CardTitle>
        <CardDescription className="text-sm md:text-base">
          This is the ONLY way to access your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 md:space-y-6 pt-0">
        <Alert className="border-yellow-200 bg-yellow-50 py-3">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900 text-sm md:text-base">Critical: Save Your Credentials</AlertTitle>
          <AlertDescription className="text-yellow-800 text-xs md:text-sm mt-1">
            We cannot recover your account. No email. No backup. This protects your
            anonymity but means you MUST save these credentials.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="p-3 md:p-4 bg-gray-50 rounded-lg space-y-2 md:space-y-3">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Your username:</p>
              <div className="flex items-center gap-2">
                <code className="text-sm md:text-lg font-mono bg-white px-2 md:px-3 py-1.5 md:py-2 rounded border flex-1">
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

            <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
              For privacy's sake, the download will not include your password.
            </p>
          </div>

          <Button
            onClick={downloadCredentials}
            className="w-full"
            variant={downloaded ? 'outline' : 'default'}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloaded ? 'Downloaded!' : 'Download Credentials'}
          </Button>

          <div className="text-xs md:text-sm text-muted-foreground space-y-0.5 md:space-y-1">
            <p>• Save the file somewhere secure</p>
            <p>• Consider using a password manager</p>
            <p>• Do not share these credentials with anyone</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 md:pt-6">
        <Button
          onClick={onNext}
          className="w-full"
          size="default"
          disabled={!downloaded}
        >
          I've Saved My Credentials
        </Button>
      </CardFooter>
    </>
  );
}