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

    const { storyId, resourceName } = await request.json();
    
    if (!storyId || !resourceName) {
      return NextResponse.json(
        { error: 'Story ID and resource name required' },
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

    // Add the clicked resource to the array
    const updatedResources = [...(interventionLog.resourcesClicked || []), resourceName];

    // Update the log with the clicked resource
    const updated = await prisma.crisisInterventionLog.update({
      where: {
        id: interventionLog.id
      },
      data: {
        resourcesClicked: updatedResources,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      resourcesClicked: updated.resourcesClicked
    });
  } catch (error) {
    console.error('Error tracking resource click:', error);
    return NextResponse.json(
      { error: 'Failed to track resource click' },
      { status: 500 }
    );
  }
}