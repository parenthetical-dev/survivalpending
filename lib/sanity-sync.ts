import { sanityClient } from './sanity'
import { Story } from '@prisma/client'
import { getStoryColor } from './utils/storyColors'

export async function syncStoryToSanity(
  story: Story & { user?: { username: string } }, 
  categories?: string[]
) {
  console.log('[Sanity Sync] Starting sync for story:', {
    storyId: story.id,
    username: story.user?.username,
    dataset: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    hasToken: !!process.env.SANITY_API_WRITE_TOKEN
  });
  
  try {
    // Check if story already exists in Sanity
    console.log('[Sanity Sync] Checking for existing story...');
    const existingStory = await sanityClient.fetch(
      `*[_type == "story" && storyId == $storyId][0]`,
      { storyId: story.id }
    )
    console.log('[Sanity Sync] Existing story found:', !!existingStory)

    const storyDocument = {
      _type: 'story',
      storyId: story.id,
      username: story.user?.username || 'anonymous',
      content: story.contentText,
      contentSanitized: story.contentSanitized || story.contentText,
      voiceId: story.voiceId,
      audioUrl: story.audioUrl,
      status: 'pending', // Always starts as pending in Sanity
      sentimentFlags: {
        highRisk: story.flaggedHighRisk,
        crisisContent: story.flaggedCrisis,
        positiveResilience: story.flaggedPositive
      },
      createdAt: story.createdAt.toISOString(),
      categories: categories || [], // AI-generated categories or empty
      tags: [], // To be filled by moderators
      color: getStoryColor(story.id) // Assign color based on story ID
    }

    if (existingStory) {
      // Update existing document
      console.log('[Sanity Sync] Updating existing document:', existingStory._id);
      const result = await sanityClient
        .patch(existingStory._id)
        .set(storyDocument)
        .commit()
      console.log('[Sanity Sync] Update successful:', result._id);
      return result;
    } else {
      // Create new document
      console.log('[Sanity Sync] Creating new document...');
      const result = await sanityClient.create(storyDocument);
      console.log('[Sanity Sync] Create successful:', result._id);
      return result;
    }
  } catch (error) {
    console.error('[Sanity Sync] Error syncing story to Sanity:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      dataset: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID
    });
    throw error;
  }
}

export async function getApprovedStories(limit: number = 10) {
  try {
    const stories = await sanityClient.fetch(
      `*[_type == "story" && status == "approved"] | order(createdAt desc) [0...$limit] {
        storyId,
        username,
        content,
        contentSanitized,
        voiceId,
        audioUrl,
        categories,
        tags,
        createdAt,
        sentimentFlags
      }`,
      { limit }
    )
    return stories
  } catch (error) {
    console.error('Error fetching approved stories from Sanity:', error)
    return []
  }
}

export async function updateStoryStatus(
  storyId: string, 
  status: 'approved' | 'rejected',
  moderatorId?: string
) {
  try {
    const story = await sanityClient.fetch(
      `*[_type == "story" && storyId == $storyId][0]`,
      { storyId }
    )

    if (!story) {
      throw new Error('Story not found in Sanity')
    }

    const updateData: any = { status }
    
    if (status === 'approved') {
      updateData.approvedAt = new Date().toISOString()
      if (moderatorId) {
        updateData.approvedBy = moderatorId
      }
    }

    return await sanityClient
      .patch(story._id)
      .set(updateData)
      .commit()
  } catch (error) {
    console.error('Error updating story status in Sanity:', error)
    throw error
  }
}