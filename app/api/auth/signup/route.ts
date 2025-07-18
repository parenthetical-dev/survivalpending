import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { generateMultipleUsernames } from '@/lib/username-generator';
import prisma from '@/lib/prisma';
import { trackStartTrial } from '@/lib/meta-capi';
import { signupLimiter } from '@/lib/rate-limit';

export async function GET() {
  try {
    // Generate username suggestions
    const usernames = await generateMultipleUsernames(5);

    // Check which ones are available
    const availableUsernames = [];
    // eslint-disable-next-line no-await-in-loop -- Sequential DB checks needed to stop early when we have enough usernames
    for (const username of usernames) {
      const exists = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!exists) {
        availableUsernames.push(username);
      }
    }

    // If we don't have enough available, generate more
    // eslint-disable-next-line no-await-in-loop -- Need to generate batches until we have enough unique usernames
    while (availableUsernames.length < 5) {
      const newUsernames = await generateMultipleUsernames(3);
      // eslint-disable-next-line no-await-in-loop -- Sequential DB checks needed to stop early when we have enough usernames
      for (const username of newUsernames) {
        const exists = await prisma.user.findUnique({
          where: { username },
          select: { id: true },
        });

        if (!exists && !availableUsernames.includes(username)) {
          availableUsernames.push(username);
        }
      }
    }

    return NextResponse.json({
      usernames: availableUsernames.slice(0, 5),
    });
  } catch (error) {
    console.error('Username generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate usernames' },
      { status: 500 },
    );
  }
}

interface SignupBody {
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
    const rateLimitResult = await signupLimiter.check(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    const body = await request.json() as SignupBody;
    
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

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 },
      );
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 },
      );
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one special character' },
        { status: 400 },
      );
    }

    // Create user
    const { id, token } = await createUser(username, password);

    // Track signup conversion
    await trackStartTrial(request, id);

    const response = NextResponse.json({
      success: true,
      token,
      userId: id,
    }, { status: 201 });

    // Set token as HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 },
    );
  }
}