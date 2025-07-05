import { NextResponse } from 'next/server';
import { sendMetaEvent, trackViewContent } from '@/lib/meta-capi';

export async function GET(request: Request) {
  console.log('[Test Meta CAPI] Starting test...');
  
  // Log environment variables
  console.log('[Test Meta CAPI] Environment:', {
    META_PIXEL_ID: process.env.META_PIXEL_ID || 'NOT SET',
    META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN ? 'SET (hidden)' : 'NOT SET',
    META_TEST_EVENT_CODE: process.env.META_TEST_EVENT_CODE || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV
  });
  
  try {
    // Test 1: Send a basic event
    await sendMetaEvent('Test', request, 'test-user-123', {
      test_field: 'test_value'
    });
    
    // Test 2: Send a ViewContent event
    await trackViewContent(request, 'test-user-123', 'test_page', 'test-123');
    
    return NextResponse.json({
      success: true,
      message: 'Meta CAPI test events sent. Check server logs for details.',
      environment: {
        hasPixelId: !!process.env.META_PIXEL_ID,
        hasAccessToken: !!process.env.META_ACCESS_TOKEN,
        hasTestCode: !!process.env.META_TEST_EVENT_CODE,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('[Test Meta CAPI] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasPixelId: !!process.env.META_PIXEL_ID,
        hasAccessToken: !!process.env.META_ACCESS_TOKEN,
        hasTestCode: !!process.env.META_TEST_EVENT_CODE,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}