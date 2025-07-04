import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add routes that require authentication
const protectedRoutes = ['/onboarding', '/submit', '/profile', '/settings', '/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // In a real app, you'd verify the JWT token here
    // For now, we'll just check if a token exists in the cookie
    const token = request.cookies.get('token');
    
    if (!token) {
      // Redirect to login if no token
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).)',
  ],
};