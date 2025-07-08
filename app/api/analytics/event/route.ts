import { NextRequest, NextResponse } from 'next/server';

const PIRSCH_EVENT_URL = 'https://api.pirsch.io/api/v1/event';

interface EventRequestBody {
  name: string;
  metadata?: Record<string, string | number | boolean>;
  duration?: number;
}

interface PirschEventPayload {
  name: string;
  url: string;
  ip: string;
  user_agent: string;
  accept_language: string;
  duration?: number;
  metadata?: Record<string, string | number | boolean>;
}

export async function POST(request: NextRequest) {
  try {
    const body: EventRequestBody = await request.json();
    const { name, metadata, duration } = body;

    // Skip tracking in test environment or when token is not properly configured
    const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.CI === 'true';
    const hasValidToken = process.env.PIRSCH_ACCESS_TOKEN && 
                         process.env.PIRSCH_ACCESS_TOKEN.trim() !== '' && 
                         process.env.PIRSCH_ACCESS_TOKEN !== 'test-token';
    
    if (!hasValidToken || isTestEnvironment) {
      if (process.env.NODE_ENV === 'development' && !isTestEnvironment) {
        console.log('[Pirsch API] Skipping tracking - no valid token or test environment');
      }
      return NextResponse.json({ success: true }); // Don't fail the request
    }

    // Get client info from request
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin') || 'https://survivalpending.com';
    const url = referer || `${origin}/`;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';

    const payload: PirschEventPayload = {
      name,
      url,
      ip,
      user_agent: userAgent,
      accept_language: acceptLanguage,
      duration,
      metadata,
    };

    // Only log in development, not in CI/test environments
    if (process.env.NODE_ENV === 'development' && process.env.CI !== 'true') {
      // Sanitize log output to prevent log injection
      const sanitizedName = name.replace(/[\n\r]/g, '_');
      console.log('[Pirsch API] Sending event:', sanitizedName, JSON.stringify(payload).replace(/[\n\r]/g, '_'));
    }

    const response = await fetch(PIRSCH_EVENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PIRSCH_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      if (process.env.NODE_ENV === 'development' && process.env.CI !== 'true') {
        console.error('[Pirsch API] Event tracking failed:', response.status, text);
      }
    } else {
      if (process.env.NODE_ENV === 'development' && process.env.CI !== 'true') {
        const sanitizedEventName = name.replace(/[\n\r]/g, '_');
        console.log('[Pirsch API] Event tracked successfully:', sanitizedEventName);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Pirsch API] Error:', error);
    return NextResponse.json({ success: true }); // Don't fail the request
  }
}