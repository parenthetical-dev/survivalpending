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
          in: approvedStoryIds,
        },
      },
      include: {
        user: {
          include: {
            demographics: true,
          },
        },
      },
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

    // Calculate total states with stories (including those below threshold)
    const totalStatesWithStories = Object.keys(stateCounts).length;

    // Apply privacy thresholds
    const privacyFilteredStates: { [key: string]: number | string } = {};
    let hiddenStatesCount = 0;

    Object.entries(stateCounts).forEach(([state, count]) => {
      if (count < 5) {
        // Don't include states with less than 5 stories
        hiddenStatesCount++;
      } else if (count >= 5 && count <= 9) {
        // For 5-9 stories, return as "< 10"
        privacyFilteredStates[state] = '< 10';
      } else {
        // For 10+ stories, round to nearest 5
        privacyFilteredStates[state] = Math.round(count / 5) * 5;
      }
    });

    // Find the maximum count for density calculation (using actual counts)
    const visibleStateCounts = Object.entries(stateCounts)
      .filter(([_, count]) => count >= 5)
      .map(([_, count]) => count);
    const maxCount = Math.max(...visibleStateCounts, 1);

    // Convert to array with density calculations
    const stateData = Object.entries(privacyFilteredStates).map(([state, displayCount]) => {
      // Get actual count for density calculation
      const actualCount = stateCounts[state];
      return {
        state,
        count: displayCount,
        density: actualCount / maxCount, // 0-1 scale based on actual count
      };
    });

    // Log for debugging
    console.log('Synced state counts:', stateCounts);
    console.log('Privacy filtered states:', privacyFilteredStates);
    console.log('Hidden states due to privacy threshold:', hiddenStatesCount);
    console.log('Total approved stories with demographics:', storiesWithDemographics.length);
    console.log('Stories with state data:', totalStoriesWithState);

    return NextResponse.json({
      states: stateData,
      totalStories: storiesWithDemographics.length,
      statesWithData: stateData.length,
      totalStatesWithStories,
      hiddenStatesCount,
      privacyThresholdApplied: true,
    });
  } catch (error) {
    console.error('Error fetching synced map data:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      states: [],
      totalStories: 0,
      statesWithData: 0,
    }, { status: 500 });
  }
}