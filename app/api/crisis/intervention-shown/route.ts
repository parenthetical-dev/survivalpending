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

    const { storyId } = await request.json();
    
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID required' },
        { status: 400 }
      );
    }

    // Find the most recent crisis intervention log for this user and story
    const interventionLog = await prisma.crisisInterventionLog.findFirst({
      where: {
        userId: payload.userId,
        storyId: storyId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!interventionLog) {
      return NextResponse.json(
        { error: 'No intervention log found' },
        { status: 404 }
      );
    }

    // Update the log to indicate the intervention was shown
    const updated = await prisma.crisisInterventionLog.update({
      where: {
        id: interventionLog.id
      },
      data: {
        interventionShown: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      interventionLogId: updated.id
    });
  } catch (error) {
    console.error('Error updating intervention log:', error);
    return NextResponse.json(
      { error: 'Failed to update intervention log' },
      { status: 500 }
    );
  }
}