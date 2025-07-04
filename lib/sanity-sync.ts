import { sanityClient } from './sanity'
import { Story } from '@prisma/client'

export async function syncStoryToSanity(story: Story & { user?: { username: string } }) {
  try {
    // Check if story already exists in Sanity
    const existingStory = await sanityClient.fetch(
      `*[_type == "story" && storyId == $storyId][0]`,
      { storyId: story.id }
    )

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
      categories: [], // To be filled by moderators
      tags: [] // To be filled by moderators
    }

    if (existingStory) {
      // Update existing document
      return await sanityClient
        .patch(existingStory._id)
        .set(storyDocument)
        .commit()
    } else {
      // Create new document
      return await sanityClient.create(storyDocument)
    }
  } catch (error) {
    console.error('Error syncing story to Sanity:', error)
    throw error
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