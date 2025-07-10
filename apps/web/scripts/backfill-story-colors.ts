#!/usr/bin/env tsx
import prisma from '../lib/prisma'
import { sanityClient } from '../lib/sanity'
import { getStoryColor } from '../lib/utils/storyColors'

async function backfillColors() {
  console.log('Starting color backfill for existing stories...')
  
  try {
    // 1. Update PostgreSQL stories without colors
    console.log('\n1. Updating PostgreSQL stories...')
    const pgStories = await prisma.story.findMany({
      where: { color: null },
      select: { id: true }
    })
    
    console.log(`Found ${pgStories.length} stories without colors in PostgreSQL`)
    
    for (const story of pgStories) {
      const color = getStoryColor(story.id)
      await prisma.story.update({
        where: { id: story.id },
        data: { color }
      })
      console.log(`  ✓ Updated story ${story.id} with color ${color}`)
    }
    
    // 2. Update Sanity stories without colors
    console.log('\n2. Updating Sanity stories...')
    const dataset = process.env.NODE_ENV === 'production' ? 'production' : 'development'
    const sanityStories = await sanityClient
      .config({ dataset })
      .fetch(`*[_type == "story" && !defined(color)] { _id, storyId }`)
    
    console.log(`Found ${sanityStories.length} stories without colors in Sanity`)
    
    const mutations = sanityStories.map((story: any) => ({
      patch: {
        id: story._id,
        set: {
          color: getStoryColor(story.storyId || story._id)
        }
      }
    }))
    
    if (mutations.length > 0) {
      // Process in batches of 100
      const batchSize = 100
      for (let i = 0; i < mutations.length; i += batchSize) {
        const batch = mutations.slice(i, i + batchSize)
        await sanityClient
          .config({ dataset })
          .transaction(batch)
          .commit()
        console.log(`  ✓ Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(mutations.length / batchSize)}`)
      }
    }
    
    console.log('\n✅ Color backfill completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during color backfill:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the backfill
backfillColors()