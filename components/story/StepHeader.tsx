'use client';

import { cn } from '@/lib/utils';
import { PenTool, Sparkles, Mic, Send } from 'lucide-react';

interface StepHeaderProps {
  currentStep: 1 | 2 | 3 | 4;
  title: string;
  description: string;
}

const stepIcons = [
  <PenTool className="w-5 h-5" />,
  <Sparkles className="w-5 h-5" />,
  <Mic className="w-5 h-5" />,
  <Send className="w-5 h-5" />
];

export default function StepHeader({ currentStep, title, description }: StepHeaderProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 px-6 sm:px-8 md:px-12 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg transition-all",
          "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
        )}>
          {stepIcons[currentStep - 1]}
        </div>
        <div>
          <h3 className="font-semibold">Step {currentStep}: {title}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}