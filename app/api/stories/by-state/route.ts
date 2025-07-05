import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state');
    
    if (!state) {
      return NextResponse.json({ error: 'State parameter is required' }, { status: 400 });
    }

    // First, get all users from the specified state
    const usersFromState = await prisma.userDemographics.findMany({
      where: {
        state: state
      },
      select: {
        userId: true
      }
    });

    const userIds = usersFromState.map(d => d.userId);

    // Then get all stories from these users
    const stories = await prisma.story.findMany({
      where: {
        userId: {
          in: userIds
        }
      },
      select: {
        id: true
      }
    });

    const storyIds = stories.map(s => s.id);

    console.log(`Found ${storyIds.length} stories from state ${state}`);

    return NextResponse.json({ 
      storyIds,
      count: storyIds.length
    });
  } catch (error) {
    console.error('Error fetching stories by state:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      storyIds: []
    }, { status: 500 });
  }
}