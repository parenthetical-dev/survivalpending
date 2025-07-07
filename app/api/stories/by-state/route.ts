import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const MINIMUM_STORIES_FOR_PRIVACY = 5;

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
    const storyCount = storyIds.length;

    console.log(`Found ${storyCount} stories from state ${state}`);

    // Privacy protection: Only return stories if the state has at least 5 stories
    if (storyCount < MINIMUM_STORIES_FOR_PRIVACY) {
      console.log(`Privacy protection: State ${state} has only ${storyCount} stories (minimum: ${MINIMUM_STORIES_FOR_PRIVACY})`);
      
      return NextResponse.json({ 
        storyIds: [],
        count: 0,
        message: `This state's stories are currently privacy-protected. States need at least ${MINIMUM_STORIES_FOR_PRIVACY} stories to be viewable.`,
        privacyProtected: true
      });
    }

    return NextResponse.json({ 
      storyIds,
      count: storyCount,
      privacyProtected: false
    });
  } catch (error) {
    console.error('Error fetching stories by state:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      storyIds: [],
      count: 0
    }, { status: 500 });
  }
}