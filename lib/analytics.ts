import { trackGAEvent, trackGAConversion } from '@/components/GoogleAnalyticsWrapper';

export const GA_EVENTS = {
  // User lifecycle events
  SIGNUP_COMPLETE: 'signup_complete',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  
  // Story submission funnel
  STORY_WRITE_COMPLETE: 'story_write_complete',
  STORY_REFINE_COMPLETE: 'story_refine_complete',
  STORY_VOICE_COMPLETE: 'story_voice_complete',
  STORY_PREVIEW_COMPLETE: 'story_preview_complete',
  STORY_SUBMIT_SUCCESS: 'story_submit_success',
  
  // Crisis resources
  CRISIS_RESOURCE_CLICK: 'crisis_resource_click',
  
  // Engagement events
  QUICK_EXIT_USED: 'quick_exit_used',
  STORY_DRAFT_SAVED: 'story_draft_saved',
} as const;

export const GA_CATEGORIES = {
  USER: 'User',
  STORY: 'Story',
  SAFETY: 'Safety',
  ENGAGEMENT: 'Engagement',
} as const;

interface ConversionConfig {
  label: string;
  value?: number;
}

const CONVERSION_LABELS: Record<string, ConversionConfig> = {
  [GA_EVENTS.SIGNUP_COMPLETE]: { label: 'nR9YCLD29N0ZEOvt8oY-' },
  [GA_EVENTS.ONBOARDING_COMPLETE]: { label: 'aB7YCLD29N0ZEOvt8oY-' },
  [GA_EVENTS.STORY_SUBMIT_SUCCESS]: { label: 'cD3YCLD29N0ZEOvt8oY-', value: 1 },
};

export function trackEvent(
  event: keyof typeof GA_EVENTS,
  category: keyof typeof GA_CATEGORIES,
  label?: string,
  value?: number
) {
  const eventName = GA_EVENTS[event];
  const categoryName = GA_CATEGORIES[category];
  
  trackGAEvent(eventName, categoryName, label, value);
  
  // Track as conversion if configured
  const conversionConfig = CONVERSION_LABELS[eventName];
  if (conversionConfig) {
    trackGAConversion(conversionConfig.label, conversionConfig.value || value);
  }
}

export function trackCrisisResource(resourceName: string, location: 'onboarding' | 'modal' | 'story') {
  trackEvent(
    'CRISIS_RESOURCE_CLICK',
    'SAFETY',
    `${resourceName}_${location}`
  );
}

export function trackStoryProgress(stage: 'write' | 'refine' | 'voice' | 'preview' | 'submit') {
  const eventMap = {
    write: 'STORY_WRITE_COMPLETE',
    refine: 'STORY_REFINE_COMPLETE',
    voice: 'STORY_VOICE_COMPLETE',
    preview: 'STORY_PREVIEW_COMPLETE',
    submit: 'STORY_SUBMIT_SUCCESS',
  } as const;
  
  const event = eventMap[stage];
  if (event) {
    trackEvent(event, 'STORY');
  }
}