import prisma from '@/lib/prisma'
import { sanityClient } from './sanity'
import { StoryStatus } from '@prisma/client'

export interface FeaturedStory {
  _id: string;
  username: string;
  contentSanitized: string;
  audioUrl?: string;
  createdAt: string;
  voiceSettings?: {
    voiceName: string;
  };
}

/**
 * Get featured stories from Neon database
 */
export async function getFeaturedStoriesFromNeon(): Promise<FeaturedStory[]> {
  try {
    const stories = await prisma.story.findMany({
      where: {
        status: StoryStatus.APPROVED,
        showOnHomepage: true
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 4
    })

    return stories.map(story => ({
      _id: story.id,
      username: story.user.username,
      contentSanitized: story.contentSanitized || story.contentText,
      audioUrl: story.audioUrl || undefined,
      createdAt: story.createdAt.toISOString(),
      voiceSettings: story.voiceId ? {
        voiceName: story.voiceId
      } : undefined
    }))
  } catch (error) {
    console.error('Error fetching featured stories from Neon:', error)
    return []
  }
}

/**
 * Get featured stories from Sanity CMS
 */
export async function getFeaturedStoriesFromSanity(): Promise<FeaturedStory[]> {
  try {
    const query = `*[_type == "story" && status == "approved" && showOnHomepage == true] | order(createdAt desc)[0...4] {
      _id,
      username,
      contentSanitized,
      audioUrl,
      createdAt,
      "voiceSettings": {
        "voiceName": voiceId
      }
    }`;

    const stories = await sanityClient.fetch(query);
    return stories || [];
  } catch (error) {
    console.error('Error fetching featured stories from Sanity:', error);
    return [];
  }
}

/**
 * Get featured stories with fallback
 * Tries Sanity first (for consistency with existing setup), then falls back to Neon
 */
export async function getFeaturedStories(): Promise<FeaturedStory[]> {
  // Try Sanity first
  const sanityStories = await getFeaturedStoriesFromSanity()
  if (sanityStories.length > 0) {
    return sanityStories
  }

  // Fall back to Neon
  console.log('Falling back to Neon for featured stories')
  return getFeaturedStoriesFromNeon()
}