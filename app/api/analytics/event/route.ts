import { NextRequest, NextResponse } from 'next/server';

const PIRSCH_EVENT_URL = 'https://api.pirsch.io/api/v1/event';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, metadata, duration } = body;

    if (!process.env.PIRSCH_ACCESS_TOKEN) {
      console.log('[Pirsch API] No access token configured');
      return NextResponse.json({ success: true }); // Don't fail the request
    }

    // Get client info from request
    const url = request.headers.get('referer') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';

    const payload = {
      name,
      url,
      ip,
      user_agent: userAgent,
      accept_language: acceptLanguage,
      duration,
      metadata
    };

    console.log('[Pirsch API] Sending event:', name, payload);

    const response = await fetch(PIRSCH_EVENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PIRSCH_ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[Pirsch API] Event tracking failed:', response.status, text);
    } else {
      console.log('[Pirsch API] Event tracked successfully:', name);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Pirsch API] Error:', error);
    return NextResponse.json({ success: true }); // Don't fail the request
  }
}