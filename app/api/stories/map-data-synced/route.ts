import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sanityClient } from '@/lib/sanity';

export async function GET() {
  try {
    // First, get all approved story IDs from Sanity
    const approvedStoriesQuery = `*[_type == "story" && status == "approved"] {
      storyId
    }`;
    
    const approvedStories = await sanityClient.fetch(approvedStoriesQuery);
    const approvedStoryIds = approvedStories.map((s: any) => s.storyId).filter(Boolean);
    
    console.log('Approved story IDs from Sanity:', approvedStoryIds);
    
    // Now fetch only those stories from the database that are also approved in Sanity
    const storiesWithDemographics = await prisma.story.findMany({
      where: {
        id: {
          in: approvedStoryIds
        }
      },
      include: {
        user: {
          include: {
            demographics: true
          }
        }
      }
    });

    // Count stories by state (only counting stories that are BOTH in DB and approved in Sanity)
    const stateCounts: { [key: string]: number } = {};
    let totalStoriesWithState = 0;
    
    storiesWithDemographics.forEach((story) => {
      const state = story.user.demographics?.state;
      if (state && state.trim() !== '') {
        stateCounts[state] = (stateCounts[state] || 0) + 1;
        totalStoriesWithState++;
      }
    });

    // Find the maximum count for density calculation
    const maxCount = Math.max(...Object.values(stateCounts), 1);

    // Convert to array with density calculations
    const stateData = Object.entries(stateCounts).map(([state, count]) => ({
      state,
      count,
      density: count / maxCount // 0-1 scale
    }));

    // Log for debugging
    console.log('Synced state counts:', stateCounts);
    console.log('Total approved stories with demographics:', storiesWithDemographics.length);
    console.log('Stories with state data:', totalStoriesWithState);

    return NextResponse.json({ 
      states: stateData,
      totalStories: storiesWithDemographics.length,
      statesWithData: stateData.length
    });
  } catch (error) {
    console.error('Error fetching synced map data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      states: [],
      totalStories: 0,
      statesWithData: 0
    }, { status: 500 });
  }
}