import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Edit } from 'lucide-react';
import { US_STATES, URBANICITY_OPTIONS } from '@/lib/constants';

interface ReviewStepProps {
  data: {
    ageRange: string;
    state: string;
    genderIdentity: string;
    racialIdentity: string;
    urbanicity: string;
  };
  onBack: () => void;
  onComplete: () => void;
}

export default function ReviewStep({ data, onBack, onComplete }: ReviewStepProps) {
  const getStateName = (code: string) => {
    const state = US_STATES.find(s => s.value === code);
    return state?.label || code;
  };

  const getUrbanicityLabel = (value: string) => {
    const option = URBANICITY_OPTIONS.find(o => o.value === value);
    return option?.label || value;
  };

  return (
    <>
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="text-xl md:text-2xl">Ready to Share Your Story</CardTitle>
        <CardDescription>
          Review your information and start documenting
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 md:space-y-6 pt-0">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-xs md:text-sm text-green-800">
            You're in. Time to document your truth.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm md:text-base">Your Information</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Age Range</span>
              <Badge variant="secondary">{data.ageRange}</Badge>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">State</span>
              <Badge variant="secondary">{getStateName(data.state)}</Badge>
            </div>

            {data.genderIdentity && data.genderIdentity !== 'prefer_not_to_say' && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Gender Identity</span>
                <Badge variant="secondary">{data.genderIdentity}</Badge>
              </div>
            )}

            {data.racialIdentity && data.racialIdentity !== 'prefer_not_to_say' && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Racial Identity</span>
                <Badge variant="secondary">{data.racialIdentity}</Badge>
              </div>
            )}

            {data.urbanicity && data.urbanicity !== 'prefer_not_to_say' && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Area Type</span>
                <Badge variant="secondary">{getUrbanicityLabel(data.urbanicity)}</Badge>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
            Remember: Complete anonymity. Edit anytime. Your story matters.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 md:pt-6">
        <Button variant="outline" size="default" onClick={onBack}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button onClick={onComplete} className="flex-1" size="default">
          Document My Story
        </Button>
      </CardFooter>
    </>
  );
}