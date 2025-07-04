import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Heart, Users } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
  username: string;
}

export default function WelcomeStep({ onNext, username }: WelcomeStepProps) {
  return (
    <>
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Welcome, {username}</CardTitle>
        <div className="text-xl font-semibold text-muted-foreground">
          Your survival is pending. Your story is not.
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Your Privacy is Protected</h3>
              <p className="text-sm text-muted-foreground">
                We've designed this platform with your safety in mind. No real names, 
                no email addresses, complete anonymity.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Heart className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Your Story Matters</h3>
              <p className="text-sm text-muted-foreground">
                Every story shared here becomes part of a vital historical record. 
                Your experiences deserve to be heard and preserved.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Users className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">You're Not Alone</h3>
              <p className="text-sm text-muted-foreground">
                You're joining thousands documenting this moment. Each story 
                strengthens our collective proof.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            In the next steps, we'll show you safety features and ask for some 
            optional demographic information to help us understand trends. You can 
            skip any questions you're not comfortable answering.
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onNext} className="w-full">
          Continue
        </Button>
      </CardFooter>
    </>
  );
}