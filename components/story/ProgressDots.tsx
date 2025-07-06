'use client';

import { cn } from '@/lib/utils';

interface ProgressDotsProps {
  currentStep: 1 | 2 | 3 | 4;
}

export default function ProgressDots({ currentStep }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {[1, 2, 3, 4].map((step) => (
        <div
          key={step}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-500",
            step === currentStep
              ? "w-8 bg-blue-600 dark:bg-blue-400"
              : step < currentStep
              ? "bg-blue-600 dark:bg-blue-400"
              : "bg-gray-300 dark:bg-gray-700"
          )}
        />
      ))}
    </div>
  );
}