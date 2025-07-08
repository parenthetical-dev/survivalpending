import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { method } = await request.json();

    // Track the share in the database
    // For now, we'll store it in the user's record or create a shares table
    // Since we don't have a shares table yet, let's just log it
    console.log(`User ${payload.userId} shared via ${method}`);

    // In a real implementation, you'd want to:
    // 1. Create a UserShares table to track sharing activity
    // 2. Store the share method, timestamp, and user ID
    // 3. Possibly track if anyone signed up from their share

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // For now, return a mock count
    // In production, query the UserShares table
    const shareCount = 0; // Would be: await prisma.userShares.count({ where: { userId: payload.userId } })

    return NextResponse.json({ count: shareCount });
  } catch (error) {
    console.error('Share count error:', error);
    return NextResponse.json(
      { error: 'Failed to get share count' },
      { status: 500 },
    );
  }
}