'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { US_STATES, AGE_RANGES, GENDER_OPTIONS, RACE_OPTIONS, URBANICITY_OPTIONS } from '@/lib/constants';

interface DemographicsStepProps {
  data: {
    ageRange: string;
    state: string;
    genderIdentity: string;
    racialIdentity: string;
    urbanicity: string;
  };
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DemographicsStep({ data, onChange, onNext, onBack }: DemographicsStepProps) {
  const updateField = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const canContinue = data.ageRange && data.state;

  return (
    <>
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="text-xl md:text-2xl">Help Us Understand</CardTitle>
        <CardDescription>
          Help us show the breadth of who's affected. Your data builds our collective evidence.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 md:space-y-6 pt-0">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3 md:p-4 flex gap-3">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-amber-900 dark:text-amber-100">
            Only age and state required. Skip anything else. Individual data never shared.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age Range *</Label>
            <Select value={data.ageRange} onValueChange={(value) => updateField('ageRange', value)}>
              <SelectTrigger id="age">
                <SelectValue placeholder="Select your age range" />
              </SelectTrigger>
              <SelectContent>
                {AGE_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select value={data.state} onValueChange={(value) => updateField('state', value)}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender Identity (Optional)</Label>
            <Select value={data.genderIdentity} onValueChange={(value) => updateField('genderIdentity', value)}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select or prefer not to say" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="race">Racial/Ethnic Identity (Optional)</Label>
            <Select value={data.racialIdentity} onValueChange={(value) => updateField('racialIdentity', value)}>
              <SelectTrigger id="race">
                <SelectValue placeholder="Select or prefer not to say" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                {RACE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urbanicity">Area Type (Optional)</Label>
            <Select value={data.urbanicity} onValueChange={(value) => updateField('urbanicity', value)}>
              <SelectTrigger id="urbanicity">
                <SelectValue placeholder="Select or prefer not to say" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                {URBANICITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 md:pt-6">
        <Button variant="outline" size="default" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1"
          size="default"
          disabled={!canContinue}
        >
          Continue
        </Button>
      </CardFooter>
    </>
  );
}