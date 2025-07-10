import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface StoryPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  onClose: () => void;
}

const PROMPTS = [
  {
    category: 'Starting Points',
    prompts: [
      'The moment I knew things had changed was...',
      'What I wish people understood about my experience is...',
      'Despite everything, what keeps me going is...',
      'The hardest part of my journey has been...',
    ],
  },
  {
    category: 'Identity & Self',
    prompts: [
      'Being my authentic self means...',
      'The first time I felt truly seen was...',
      'My identity is not up for debate because...',
      'What makes me proud of who I am is...',
    ],
  },
  {
    category: 'Community & Support',
    prompts: [
      'I found my chosen family when...',
      'The support that saved me came from...',
      'To others going through this, I want to say...',
      'We are stronger together because...',
    ],
  },
  {
    category: 'Resistance & Hope',
    prompts: [
      'I refuse to be erased because...',
      'My act of resistance is...',
      "The future I'm fighting for looks like...",
      'Hope lives in me through...',
    ],
  },
];

export default function StoryPrompts({ onSelectPrompt, onClose }: StoryPromptsProps) {
  return (
    <Card className="mt-4 md:mt-0 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Story Starters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {PROMPTS.map((category) => (
          <div key={category.category}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {category.category}
            </h4>
            <div className="grid gap-2">
              {category.prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSelectPrompt(prompt)}
                  className="text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        These are just suggestions. Your authentic voice is what matters most.
      </p>
    </Card>
  );
}