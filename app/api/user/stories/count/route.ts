import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get story count and last story date for the user
    const storyCount = await prisma.story.count({
      where: {
        userId: payload.userId,
      },
    });

    const lastStory = await prisma.story.findFirst({
      where: {
        userId: payload.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });

    return NextResponse.json({
      count: storyCount,
      lastStoryDate: lastStory?.createdAt || null,
    });
  } catch (error) {
    console.error('Error fetching story count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story count' },
      { status: 500 }
    );
  }
}