import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // First fetch approved stories from Sanity
    const query = `*[_type == "story" && status == "approved"] | order(createdAt desc) {
      _id,
      storyId,
      username,
      contentSanitized,
      audioUrl,
      createdAt,
      categories,
      "voiceSettings": {
        "voiceName": voiceId
      }
    }`;

    const sanityStories = await sanityClient.fetch(query);
    
    // Get story IDs to fetch user/demographic data from database
    const storyIds = sanityStories.map((story: any) => story.storyId).filter(Boolean);
    
    // Fetch stories with user demographic data from database
    const storiesFromDB = await prisma.story.findMany({
      where: {
        id: {
          in: storyIds
        }
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            demographics: {
              select: {
                state: true
              }
            }
          }
        }
      }
    });
    
    // Create a map of story ID to state
    const storyStateMap = new Map<string, string | null>();
    storiesFromDB.forEach(story => {
      const state = story.user.demographics?.state || null;
      storyStateMap.set(story.id, state);
    });
    
    // Merge demographic data with Sanity stories
    const storiesWithState = sanityStories.map((story: any) => {
      const state = storyStateMap.get(story.storyId);
      console.log(`Story ${story.storyId} has state: ${state}`);
      return {
        ...story,
        demographics: {
          state: state || null
        }
      };
    });
    
    console.log('Total Sanity stories:', sanityStories.length);
    console.log('Story IDs from DB:', Array.from(storyStateMap.keys()));
    console.log('State map:', Array.from(storyStateMap.entries()));
    
    return NextResponse.json({ stories: storiesWithState || [] });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ stories: [] }, { status: 500 });
  }
}