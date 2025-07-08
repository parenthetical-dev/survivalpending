'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Plus } from 'lucide-react';

export default function StorySuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Your story is preserved</CardTitle>
          <CardDescription className="text-base mt-2">
            Thank you for your courage. Your truth matters and will not be erased.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>What happens next:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Your story is being reviewed for publication</li>
              <li>It will appear anonymously on the homepage</li>
              <li>Only the audio version will be shared</li>
              <li>Your identity remains completely protected</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/story/submit')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Share Another Story
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}