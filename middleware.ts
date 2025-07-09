import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sanitizeForLogging } from '@/lib/sanitize';

// Add routes that require authentication
const protectedRoutes = ['/onboarding', '/submit', '/profile', '/settings', '/dashboard'];

const PIRSCH_API_URL = 'https://api.pirsch.io/api/v1/hit';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only log in development, not in CI/test environments
  if (process.env.NODE_ENV === 'development' && process.env.CI !== 'true') {
    console.log('[Middleware] Running for path:', sanitizeForLogging(pathname));
    console.log('[Middleware] PIRSCH_ACCESS_TOKEN exists:', !!(process.env.PIRSCH_ACCESS_TOKEN && process.env.PIRSCH_ACCESS_TOKEN.trim()));
  }
  
  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check if token exists in cookies
    // Note: Full JWT verification happens in API routes since Edge Runtime
    // doesn't support the crypto modules needed for JWT verification
    const token = request.cookies.get('token');
    
    if (!token) {
      // Redirect to login if no token
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  
  // Request client hints from browsers for better analytics
  response.headers.set('Accept-CH', 'Sec-CH-UA, Sec-CH-UA-Mobile, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-Width, Sec-CH-Viewport-Width, Width, Viewport-Width');

  // Track page views with Pirsch
  const shouldTrack = !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_next/') &&
    !pathname.startsWith('/static/') &&
    !pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/);

  // Skip tracking in test environment or when token is not properly configured
  const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.CI === 'true';
  const hasValidToken = process.env.PIRSCH_ACCESS_TOKEN && 
                       process.env.PIRSCH_ACCESS_TOKEN.trim() !== '' && 
                       process.env.PIRSCH_ACCESS_TOKEN !== 'test-token';
  
  if (shouldTrack && hasValidToken && !isTestEnvironment) {
    // Track page view asynchronously without blocking the response
    try {
      const url = request.nextUrl.href;
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      const userAgent = request.headers.get('user-agent') || '';
      const acceptLanguage = request.headers.get('accept-language') || '';
      const referrer = request.headers.get('referer') || '';

      // Collect client hints for better browser/OS detection
      const clientHints = {
        sec_ch_ua: request.headers.get('sec-ch-ua'),
        sec_ch_ua_mobile: request.headers.get('sec-ch-ua-mobile'),
        sec_ch_ua_platform: request.headers.get('sec-ch-ua-platform'),
        sec_ch_ua_platform_version: request.headers.get('sec-ch-ua-platform-version'),
        sec_ch_width: request.headers.get('sec-ch-width'),
        sec_ch_viewport_width: request.headers.get('sec-ch-viewport-width'),
        width: request.headers.get('width'),
        viewport_width: request.headers.get('viewport-width'),
      };

      const payload = {
        url,
        ip,
        user_agent: userAgent,
        accept_language: acceptLanguage,
        referrer,
        ...clientHints
      };

      console.log('[Pirsch] Tracking page view:', {
        url: sanitizeForLogging(pathname),
        hasToken: !!process.env.PIRSCH_ACCESS_TOKEN,
        payload: {
          ...payload,
          url: sanitizeForLogging(payload.url),
          referrer: sanitizeForLogging(payload.referrer),
          user_agent: sanitizeForLogging(payload.user_agent)
        }
      });

      // Fire and forget - don't await
      fetch(PIRSCH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PIRSCH_ACCESS_TOKEN}`
        },
        body: JSON.stringify(payload)
      }).then(res => {
        if (!res.ok) {
          console.error('[Pirsch] Tracking failed:', res.status, sanitizeForLogging(res.statusText));
          res.text().then(text => console.error('[Pirsch] Response:', sanitizeForLogging(text)));
        } else {
          console.log('[Pirsch] Page view tracked successfully');
        }
      }).catch((error) => {
        console.error('[Pirsch] Error tracking page view:', sanitizeForLogging(error));
      });
    } catch (error) {
      console.error('[Pirsch] Unexpected error:', sanitizeForLogging(error));
    }
  } else {
    if (shouldTrack) {
      console.log('[Pirsch] Skipping tracking - no token found');
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};