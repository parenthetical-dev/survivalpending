import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all stories with their user's demographic data in one query
    const storiesWithDemographics = await prisma.story.findMany({
      include: {
        user: {
          include: {
            demographics: true,
          },
        },
      },
    });

    // Count stories by state (only counting actual stories, not just users)
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
      density: count / maxCount, // 0-1 scale
    }));

    // Log for debugging
    console.log('State counts:', stateCounts);
    console.log('Total stories from DB:', storiesWithDemographics.length);
    console.log('Stories with state data:', totalStoriesWithState);
    console.log('State data being returned:', stateData);

    return NextResponse.json({
      states: stateData,
      totalStories: storiesWithDemographics.length,
      statesWithData: stateData.length,
    });
  } catch (error) {
    console.error('Error fetching map data:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      states: [],
      totalStories: 0,
      statesWithData: 0,
    }, { status: 500 });
  }
}