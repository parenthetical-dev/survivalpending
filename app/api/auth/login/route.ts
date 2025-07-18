import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { loginLimiter } from '@/lib/rate-limit';

interface LoginBody {
  username: string;
  password: string;
  turnstileToken: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';
    
    // Check rate limit
    const rateLimitResult = await loginLimiter.check(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    const body = await request.json() as LoginBody;
    
    // Extract and validate each field individually with strict checks
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const turnstileToken = typeof body?.turnstileToken === 'string' ? body.turnstileToken.trim() : '';

    // Validate required fields
    if (username.length === 0 || password.length === 0 || turnstileToken.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }
    
    // Additional validation for username format
    if (!/^[a-z]+_[a-z]+_\d{4}$/.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 },
      );
    }

    // Verify Turnstile token
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 400 },
      );
    }

    // Authenticate user
    const result = await authenticateUser(username, password);

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      token: result.token,
      userId: result.id,
      hasCompletedOnboarding: result.hasCompletedOnboarding,
    });

    // Set token as HTTP-only cookie
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 },
    );
  }
}