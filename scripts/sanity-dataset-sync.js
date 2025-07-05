#!/usr/bin/env node

/**
 * Sync Sanity datasets (Production → Development)
 * Copies all story documents from one dataset to another
 */

const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const PROJECT_ID = process.env.SANITY_API_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_ADMIN_TOKEN

if (!PROJECT_ID || !TOKEN) {
  console.error('Error: SANITY_API_PROJECT_ID and SANITY_API_WRITE_TOKEN must be set')
  console.error('Generate a token at: https://www.sanity.io/manage')
  process.exit(1)
}

// Create clients for both datasets
const prodClient = createClient({
  projectId: PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false
})

const devClient = createClient({
  projectId: PROJECT_ID,
  dataset: 'development',
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false
})

async function syncDatasets() {
  console.log('=== Sanity Dataset Sync ===')
  console.log('Source: production')
  console.log('Target: development')
  console.log('')
  
  try {
    // 1. Fetch all stories from production
    console.log('1. Fetching stories from production dataset...')
    const stories = await prodClient.fetch(`*[_type == "story"]`)
    console.log(`   Found ${stories.length} stories`)
    console.log('')
    
    if (stories.length === 0) {
      console.log('No stories to sync.')
      return
    }
    
    // 2. Clear existing stories in development (optional)
    console.log('2. Clearing existing stories in development dataset...')
    const existingStories = await devClient.fetch(`*[_type == "story"]._id`)
    
    if (existingStories.length > 0) {
      const mutations = existingStories.map(id => ({ delete: { id } }))
      await devClient.transaction(mutations).commit()
      console.log(`   Deleted ${existingStories.length} existing stories`)
    }
    console.log('')
    
    // 3. Copy stories to development
    console.log('3. Copying stories to development dataset...')
    const batchSize = 10
    
    for (let i = 0; i < stories.length; i += batchSize) {
      const batch = stories.slice(i, i + batchSize)
      console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(stories.length / batchSize)}`)
      
      const mutations = batch.map(story => ({
        createOrReplace: {
          ...story,
          _id: story._id // Preserve original IDs
        }
      }))
      
      await devClient.transaction(mutations).commit()
    }
    
    console.log(`   ✓ Copied ${stories.length} stories`)
    console.log('')
    
    // 4. Verify sync
    console.log('4. Verifying sync...')
    const devCount = await devClient.fetch(`count(*[_type == "story"])`)
    console.log(`   Development dataset now has ${devCount} stories`)
    console.log('')
    
    console.log('✅ Dataset sync completed successfully!')
    
    // Show sample stories
    console.log('')
    console.log('Sample stories in development:')
    const samples = await devClient.fetch(`*[_type == "story"][0...3] { storyId, username, status }`)
    samples.forEach(story => {
      console.log(`   - ${story.storyId}: ${story.username} (${story.status})`)
    })
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run sync if called directly
if (require.main === module) {
  console.log('')
  console.log('This will sync all stories from production to development dataset.')
  console.log('Press Ctrl+C to cancel, or Enter to continue...')
  
  process.stdin.once('data', () => {
    syncDatasets()
  })
}