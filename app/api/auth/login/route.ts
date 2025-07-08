import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { verifyTurnstileToken } from '@/lib/turnstile';

interface LoginBody {
  username: string;
  password: string;
  turnstileToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginBody;
    const { username, password, turnstileToken } = body;

    // Validate input - ensure all fields are non-empty strings
    if (typeof username !== 'string' || username.trim().length === 0 ||
        typeof password !== 'string' || password.trim().length === 0 ||
        typeof turnstileToken !== 'string' || turnstileToken.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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