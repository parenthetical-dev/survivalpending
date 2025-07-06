const PIRSCH_EVENT_URL = 'https://api.pirsch.io/api/v1/event';
const PIRSCH_HIT_URL = 'https://api.pirsch.io/api/v1/hit';

export const ANALYTICS_EVENTS = {
  // User lifecycle events
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  SIGNUP_FAILED: 'signup_failed',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  ONBOARDING_START: 'onboarding_start',
  ONBOARDING_STEP: 'onboarding_step',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  USERNAME_REGENERATED: 'username_regenerated',
  
  // Story submission funnel
  STORY_START: 'story_start',
  STORY_WRITE_START: 'story_write_start',
  STORY_WRITE_COMPLETE: 'story_write_complete',
  STORY_DRAFT_SAVED: 'story_draft_saved',
  STORY_IDLE_PROMPT_SHOWN: 'story_idle_prompt_shown',
  STORY_REFINE_START: 'story_refine_start',
  STORY_REFINE_APPLIED: 'story_refine_applied',
  STORY_REFINE_SKIPPED: 'story_refine_skipped',
  STORY_REFINE_COMPLETE: 'story_refine_complete',
  STORY_VOICE_START: 'story_voice_start',
  STORY_VOICE_PREVIEW: 'story_voice_preview',
  STORY_VOICE_SELECTED: 'story_voice_selected',
  STORY_VOICE_COMPLETE: 'story_voice_complete',
  STORY_PREVIEW_START: 'story_preview_start',
  STORY_PREVIEW_PLAY: 'story_preview_play',
  STORY_PREVIEW_EDIT: 'story_preview_edit',
  STORY_PREVIEW_COMPLETE: 'story_preview_complete',
  STORY_SUBMIT_START: 'story_submit_start',
  STORY_SUBMIT_SUCCESS: 'story_submit_success',
  STORY_SUBMIT_FAILED: 'story_submit_failed',
  
  // Crisis & safety events
  CRISIS_RESOURCE_CLICK: 'crisis_resource_click',
  CRISIS_MODAL_SHOWN: 'crisis_modal_shown',
  CRISIS_MODAL_DISMISSED: 'crisis_modal_dismissed',
  QUICK_EXIT_USED: 'quick_exit_used',
  
  // Engagement events
  STORY_SHARED: 'story_shared',
  STORY_PLAYED: 'story_played',
  STORY_COMPLETED: 'story_completed',
  FEATURED_STORY_PLAYED: 'featured_story_played',
  
  // Error events
  API_ERROR: 'api_error',
  AUDIO_GENERATION_FAILED: 'audio_generation_failed',
  FORM_VALIDATION_ERROR: 'form_validation_error',
} as const;

export const ANALYTICS_CATEGORIES = {
  USER: 'User',
  STORY: 'Story',
  SAFETY: 'Safety',
  ENGAGEMENT: 'Engagement',
  ERROR: 'Error',
  ONBOARDING: 'Onboarding',
} as const;

// Helper to get user segment tags
function getUserSegmentTags(): Record<string, string | number | boolean> {
  if (typeof window === 'undefined') return {};
  
  const tags: Record<string, string | number | boolean> = {};
  
  // Platform detection
  tags.platform = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  
  // Time of day
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) tags.timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) tags.timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) tags.timeOfDay = 'evening';
  else tags.timeOfDay = 'night';
  
  // Session info from localStorage
  const sessionStart = localStorage.getItem('sessionStart');
  if (sessionStart) {
    const duration = (Date.now() - parseInt(sessionStart)) / 1000 / 60; // minutes
    tags.sessionDuration = Math.round(duration);
  }
  
  // User journey stage
  const hasCompletedOnboarding = localStorage.getItem('onboardingComplete') === 'true';
  const storyCount = parseInt(localStorage.getItem('storyCount') || '0');
  
  tags.hasCompletedOnboarding = hasCompletedOnboarding;
  tags.userJourneyStage = storyCount === 0 ? 'new' : storyCount === 1 ? 'first_story' : 'returning';
  tags.storyCount = storyCount;
  
  return tags;
}

// Send event to Pirsch with tags
async function sendPirschEvent(
  eventName: string,
  metadata?: Record<string, string | number | boolean>,
  duration?: number
) {
  if (typeof window === 'undefined') return;
  
  const token = process.env.NEXT_PUBLIC_PIRSCH_ACCESS_TOKEN;
  if (!token) return;

  try {
    const segmentTags = getUserSegmentTags();
    
    await fetch(PIRSCH_EVENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: eventName,
        url: window.location.href,
        duration,
        metadata: {
          ...segmentTags,
          ...metadata
        }
      })
    });
  } catch (error) {
    // Silently fail - analytics should not break the app
  }
}

// Send custom page hit with tags (for conversions)
async function sendPirschHit(tags: Record<string, string>) {
  if (typeof window === 'undefined') return;
  
  const token = process.env.NEXT_PUBLIC_PIRSCH_ACCESS_TOKEN;
  if (!token) return;

  try {
    await fetch(PIRSCH_HIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        url: window.location.href,
        ip: 'anonymous', // Let Pirsch handle IP detection
        user_agent: navigator.userAgent,
        accept_language: navigator.language,
        referrer: document.referrer,
        tags
      })
    });
  } catch (error) {
    // Silently fail
  }
}

// Main tracking function
export function trackEvent(
  event: keyof typeof ANALYTICS_EVENTS,
  category: keyof typeof ANALYTICS_CATEGORIES,
  metadata?: Record<string, string | number | boolean>,
  duration?: number
) {
  const eventName = ANALYTICS_EVENTS[event];
  const categoryName = ANALYTICS_CATEGORIES[category];
  
  // Send to Pirsch with metadata
  sendPirschEvent(eventName, {
    category: categoryName,
    ...metadata
  }, duration);
  
  // Track conversions for key events
  if (isConversionEvent(event)) {
    sendPirschHit({
      conversion: eventName,
      category: categoryName
    });
  }
}

// Helper to identify conversion events
function isConversionEvent(event: keyof typeof ANALYTICS_EVENTS): boolean {
  const conversionEvents = [
    'SIGNUP_COMPLETE',
    'ONBOARDING_COMPLETE',
    'STORY_SUBMIT_SUCCESS',
    'STORY_SHARED'
  ];
  return conversionEvents.includes(event);
}

// Specific tracking helpers
export function trackCrisisResource(
  resourceName: string, 
  location: 'onboarding' | 'modal' | 'story' | 'footer'
) {
  trackEvent('CRISIS_RESOURCE_CLICK', 'SAFETY', {
    resource: resourceName,
    location,
    context: window.location.pathname
  });
}

export function trackStoryProgress(
  stage: 'start' | 'write' | 'refine' | 'voice' | 'preview' | 'submit',
  metadata?: Record<string, string | number | boolean>
) {
  const eventMap = {
    start: 'STORY_START',
    write: 'STORY_WRITE_COMPLETE',
    refine: 'STORY_REFINE_COMPLETE',
    voice: 'STORY_VOICE_COMPLETE',
    preview: 'STORY_PREVIEW_COMPLETE',
    submit: 'STORY_SUBMIT_SUCCESS',
  } as const;
  
  const event = eventMap[stage];
  if (event) {
    trackEvent(event, 'STORY', metadata);
    
    // Increment story count on completion
    if (stage === 'submit') {
      const count = parseInt(localStorage.getItem('storyCount') || '0');
      localStorage.setItem('storyCount', (count + 1).toString());
    }
  }
}

export function trackOnboardingStep(
  step: number,
  stepName: string,
  completed: boolean = false
) {
  trackEvent('ONBOARDING_STEP', 'ONBOARDING', {
    step,
    stepName,
    completed,
    totalSteps: 5
  });
}

export function trackError(
  errorType: 'api' | 'audio' | 'validation',
  errorMessage: string,
  context?: Record<string, any>
) {
  const eventMap = {
    api: 'API_ERROR',
    audio: 'AUDIO_GENERATION_FAILED',
    validation: 'FORM_VALIDATION_ERROR'
  } as const;
  
  trackEvent(eventMap[errorType], 'ERROR', {
    error: errorMessage,
    ...context
  });
}

export function trackStoryEngagement(
  action: 'play' | 'complete' | 'share',
  storyId: string,
  metadata?: Record<string, any>
) {
  const eventMap = {
    play: 'STORY_PLAYED',
    complete: 'STORY_COMPLETED',
    share: 'STORY_SHARED'
  } as const;
  
  trackEvent(eventMap[action], 'ENGAGEMENT', {
    storyId,
    ...metadata
  });
}

// Initialize session tracking
export function initializeAnalytics() {
  if (typeof window !== 'undefined' && !localStorage.getItem('sessionStart')) {
    localStorage.setItem('sessionStart', Date.now().toString());
  }
}

// Track share method
export function trackShareMethod(method: string, success: boolean) {
  trackEvent('STORY_SHARED', 'ENGAGEMENT', {
    method,
    success,
    url: window.location.href
  });
}