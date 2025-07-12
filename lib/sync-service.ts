import prisma from '@/lib/prisma';
import { sanityClient } from './sanity';
import { StoryStatus } from '@prisma/client';
import { getStoryColor } from './utils/storyColors';

interface SyncOptions {
  environment: 'development' | 'production'
  syncDirection: 'neon-to-sanity' | 'sanity-to-neon' | 'bidirectional'
  batchSize?: number
  includeRejected?: boolean
}

export class SyncService {
  private environment: string;
  private sanityDataset: string;

  constructor(environment: 'development' | 'production' = 'development') {
    this.environment = environment;
    // Use NODE_ENV if available, otherwise use parameter
    const env = process.env.NODE_ENV === 'production' ? 'production' : environment;
    this.sanityDataset = env === 'production' ? 'production' : 'development';
  }

  /**
   * Sync all stories from Neon to Sanity
   */
  async syncNeonToSanity(options: { batchSize?: number; includeRejected?: boolean } = {}) {
    const { batchSize = 50, includeRejected = false } = options;

    console.log(`Starting Neon → Sanity sync (${this.environment})...`);

    try {
      // Get all stories from Neon
      const whereClause = includeRejected ? {} : {
        status: { not: StoryStatus.REJECTED },
      };

      const stories = await prisma.story.findMany({
        where: whereClause,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });

      console.log(`Found ${stories.length} stories to sync`);

      // Process in batches
      for (let i = 0; i < stories.length; i += batchSize) {
        const batch = stories.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(stories.length / batchSize)}`);

        // Fetch existing stories from Sanity to preserve showOnHomepage
        const existingStories = await sanityClient
          .config({ dataset: this.sanityDataset })
          .fetch<Array<{ storyId: string; showOnHomepage?: boolean }>>(`*[_type == "story" && storyId in $storyIds]`, {
            storyIds: batch.map(s => s.id)
          });

        const existingStoriesMap = new Map(
          existingStories.map(s => [s.storyId, s])
        );

        const mutations = batch.map(story => {
          const existingSanityStory = existingStoriesMap.get(story.id);
          
          return {
            createOrReplace: {
              _type: 'story',
              _id: `story-${story.id}`,
              storyId: story.id,
              username: story.user?.username || 'anonymous',
              content: story.contentText,
              contentSanitized: story.contentSanitized || story.contentText,
              voiceId: story.voiceId,
              audioUrl: story.audioUrl,
              status: story.status.toLowerCase() || 'pending',
              sentimentFlags: {
                highRisk: story.flaggedHighRisk,
                crisisContent: story.flaggedCrisis,
                positiveResilience: story.flaggedPositive,
              },
              createdAt: story.createdAt.toISOString(),
              approvedAt: story.approvedAt?.toISOString(),
              moderatorNotes: story.moderationNotes,
              // Preserve showOnHomepage from Sanity if it exists, otherwise use Neon value
              showOnHomepage: existingSanityStory?.showOnHomepage ?? story.showOnHomepage,
              tags: [],
              categories: [],
              color: story.color || getStoryColor(story.id),
            },
          };
        });

        // Execute batch mutation
        await sanityClient
          .config({ dataset: this.sanityDataset })
          .transaction(mutations)
          .commit();

        console.log(`  ✓ Synced ${batch.length} stories`);
      }

      console.log(`✅ Neon → Sanity sync completed: ${stories.length} stories`);
      return { success: true, count: stories.length };

    } catch (error) {
      console.error('Neon → Sanity sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync all stories from Sanity to Neon
   */
  async syncSanityToNeon(options: { batchSize?: number } = {}) {
    const { batchSize = 50 } = options;

    console.log(`Starting Sanity → Neon sync (${this.environment})...`);

    try {
      // Get all stories from Sanity
      const stories = await sanityClient
        .config({ dataset: this.sanityDataset })
        .fetch(`*[_type == "story"] | order(createdAt desc)`);

      console.log(`Found ${stories.length} stories in Sanity`);

      let syncedCount = 0;
      let skippedCount = 0;

      // Process in batches
      for (let i = 0; i < stories.length; i += batchSize) {
        const batch = stories.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(stories.length / batchSize)}`);

        for (const sanityStory of batch) {
          try {
            // Check if story exists in Neon
            const existingStory = await prisma.story.findUnique({
              where: { id: sanityStory.storyId },
            });

            if (!existingStory) {
              console.log(`  ⚠️  Story ${sanityStory.storyId} not found in Neon, skipping`);
              skippedCount++;
              continue;
            }

            // Update story in Neon with Sanity data
            const updateData: any = {
              status: (sanityStory.status?.toUpperCase() || 'PENDING') as StoryStatus,
              moderationNotes: sanityStory.moderatorNotes,
              // Only update showOnHomepage if it's explicitly set in Sanity
              ...(sanityStory.showOnHomepage !== undefined && {
                showOnHomepage: sanityStory.showOnHomepage
              }),
              color: sanityStory.color || existingStory.color || getStoryColor(sanityStory.storyId),
            };

            if (sanityStory.status === 'approved' && sanityStory.approvedAt) {
              updateData.approvedAt = new Date(sanityStory.approvedAt);
            }

            await prisma.story.update({
              where: { id: sanityStory.storyId },
              data: updateData,
            });

            syncedCount++;
          } catch (error) {
            console.error(`  ❌ Failed to sync story ${sanityStory.storyId}:`, error);
          }
        }
      }

      console.log(`✅ Sanity → Neon sync completed: ${syncedCount} synced, ${skippedCount} skipped`);
      return { success: true, synced: syncedCount, skipped: skippedCount };

    } catch (error) {
      console.error('Sanity → Neon sync failed:', error);
      throw error;
    }
  }

  /**
   * Perform bidirectional sync
   */
  async syncBidirectional(options: { batchSize?: number; includeRejected?: boolean } = {}) {
    console.log(`Starting bidirectional sync (${this.environment})...`);

    // First sync from Neon to Sanity (source of truth for new stories)
    const neonToSanity = await this.syncNeonToSanity(options);

    // Then sync back from Sanity to Neon (for moderation updates)
    const sanityToNeon = await this.syncSanityToNeon(options);

    return {
      success: true,
      neonToSanity,
      sanityToNeon,
    };
  }

  /**
   * Get sync status and statistics
   */
  async getSyncStatus() {
    const [neonCount, sanityCount, pendingCount, approvedCount] = await Promise.all([
      prisma.story.count(),
      sanityClient
        .config({ dataset: this.sanityDataset })
        .fetch(`count(*[_type == "story"])`),
      prisma.story.count({ where: { status: StoryStatus.PENDING } }),
      prisma.story.count({ where: { status: StoryStatus.APPROVED } }),
    ]);

    return {
      environment: this.environment,
      dataset: this.sanityDataset,
      neonStories: neonCount,
      sanityStories: sanityCount,
      pendingModeration: pendingCount,
      approved: approvedCount,
      synced: neonCount === sanityCount,
    };
  }
}

// Export singleton instances
export const devSyncService = new SyncService('development');
export const prodSyncService = new SyncService('production');