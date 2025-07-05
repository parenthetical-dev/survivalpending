import crypto from 'crypto';

interface MetaEventData {
  event_name: string;
  event_time: number;
  action_source: string;
  event_source_url: string;
  user_data: {
    external_id?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
    subscription_id?: string;
    lead_id?: string;
    country?: string[];
    st?: string[];
  };
  custom_data?: Record<string, any>;
  data_processing_options?: string[];
  data_processing_options_country?: number;
  data_processing_options_state?: number;
}

interface MetaServerEvent {
  data: MetaEventData[];
  test_event_code?: string;
}

const META_PIXEL_ID = process.env.META_PIXEL_ID || '';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const META_API_VERSION = 'v21.0';

// Helper to hash PII data for Meta
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

// Helper to get user data from request
export function getUserDataFromRequest(request: Request, userId?: string): MetaEventData['user_data'] {
  const userData: MetaEventData['user_data'] = {};
  
  // Get IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 
                   request.headers.get('x-real-ip') || 
                   undefined;
  
  if (clientIp) {
    userData.client_ip_address = clientIp;
  }
  
  // Get user agent
  const userAgent = request.headers.get('user-agent');
  if (userAgent) {
    userData.client_user_agent = userAgent;
  }
  
  // Get Facebook cookies
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const fbcMatch = cookies.match(/_fbc=([^;]+)/);
    const fbpMatch = cookies.match(/_fbp=([^;]+)/);
    
    if (fbcMatch) userData.fbc = fbcMatch[1];
    if (fbpMatch) userData.fbp = fbpMatch[1];
  }
  
  // Hash and add external ID if provided
  if (userId) {
    userData.external_id = [hashData(userId)];
  }
  
  return userData;
}

// Main function to send events to Meta
export async function sendMetaEvent(
  eventName: string,
  request: Request,
  userId?: string,
  customData?: Record<string, any>
): Promise<void> {
  console.log('[Meta CAPI] Attempting to send event:', eventName);
  console.log('[Meta CAPI] Environment check:', {
    hasPixelId: !!META_PIXEL_ID,
    pixelId: META_PIXEL_ID,
    hasAccessToken: !!META_ACCESS_TOKEN,
    tokenPreview: META_ACCESS_TOKEN ? META_ACCESS_TOKEN.substring(0, 20) + '...' : 'not set'
  });
  
  // Skip if not configured
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    console.log('[Meta CAPI] Missing configuration, skipping event:', eventName);
    return;
  }
  
  const META_API_URL = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`;
  console.log('[Meta CAPI] API URL:', META_API_URL);
  
  try {
    const eventData: MetaEventData = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: request.url,
      user_data: getUserDataFromRequest(request, userId),
    };
    
    if (customData) {
      eventData.custom_data = customData;
    }
    
    // Add data processing options for privacy compliance
    eventData.data_processing_options = [];
    eventData.data_processing_options_country = 0;
    eventData.data_processing_options_state = 0;
    
    const serverEvent: MetaServerEvent = {
      data: [eventData],
    };
    
    // Add test event code in development
    if (process.env.NODE_ENV === 'development' && process.env.META_TEST_EVENT_CODE) {
      serverEvent.test_event_code = process.env.META_TEST_EVENT_CODE;
      console.log('[Meta CAPI] Using test event code:', process.env.META_TEST_EVENT_CODE);
    }
    
    const payload = {
      ...serverEvent,
      access_token: META_ACCESS_TOKEN,
    };
    
    console.log('[Meta CAPI] Sending request to:', META_API_URL);
    console.log('[Meta CAPI] Event data:', JSON.stringify(eventData, null, 2));
    
    // Send to Meta
    const response = await fetch(META_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    console.log('[Meta CAPI] Response status:', response.status);
    console.log('[Meta CAPI] Response body:', responseText);
    
    if (!response.ok) {
      console.error('[Meta CAPI] Error response:', responseText);
    } else {
      try {
        const result = JSON.parse(responseText);
        console.log(`[Meta CAPI] Success! Event sent: ${eventName}`, result);
      } catch (e) {
        console.log(`[Meta CAPI] Event sent but couldn't parse response: ${eventName}`);
      }
    }
  } catch (error) {
    // Don't let tracking errors break the application
    console.error('Failed to send Meta event:', error);
  }
}

// Specific event helpers
export async function trackStartTrial(request: Request, userId: string, demographicsData?: any) {
  const customData: Record<string, any> = {
    event_source: 'onboarding_complete',
  };
  
  if (demographicsData) {
    // Add demographics as custom parameters (without PII)
    if (demographicsData.ageRange) customData.age_range = demographicsData.ageRange;
    if (demographicsData.state) customData.state_code = demographicsData.state;
    if (demographicsData.urbanicity) customData.urbanicity = demographicsData.urbanicity;
  }
  
  await sendMetaEvent('StartTrial', request, userId, customData);
}

export async function trackPurchase(
  request: Request, 
  userId: string, 
  storyId: string,
  sentimentData?: any
) {
  const customData: Record<string, any> = {
    content_ids: [storyId],
    content_type: 'story_submission',
    value: 1, // Each story has a value of 1
    currency: 'USD',
  };
  
  if (sentimentData) {
    // Add sentiment analysis results
    if (sentimentData.riskLevel) customData.risk_level = sentimentData.riskLevel;
    if (sentimentData.hasCrisisContent !== undefined) {
      customData.has_crisis_content = sentimentData.hasCrisisContent;
    }
    if (sentimentData.categories && Array.isArray(sentimentData.categories)) {
      customData.content_categories = sentimentData.categories.join(',');
    }
  }
  
  await sendMetaEvent('Purchase', request, userId, customData);
}

// Track other important events
export async function trackViewContent(
  request: Request,
  contentType: string,
  userId?: string,
  contentId?: string
) {
  const customData: Record<string, any> = {
    content_type: contentType,
  };
  
  if (contentId) {
    customData.content_ids = [contentId];
  }
  
  await sendMetaEvent('ViewContent', request, userId, customData);
}

export async function trackInitiateCheckout(
  request: Request,
  userId: string,
  stage: string
) {
  const customData = {
    checkout_stage: stage,
    content_type: 'story_submission',
  };
  
  await sendMetaEvent('InitiateCheckout', request, userId, customData);
}