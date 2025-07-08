import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { generateMultipleUsernames } from '@/lib/username-generator';
import prisma from '@/lib/prisma';
import { trackStartTrial } from '@/lib/meta-capi';

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
    const body = await request.json() as SignupBody;
    const { username, password, turnstileToken } = body;

    // Validate input
    if (!username || !password || !turnstileToken) {
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
    });

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