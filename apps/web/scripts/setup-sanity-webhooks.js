#!/usr/bin/env node

/**
 * Setup Sanity Webhooks for real-time sync
 * This script configures webhooks in your Sanity project
 */

const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_TOKEN = process.env.SANITY_ADMIN_TOKEN // Needs write access
const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET || 'your-webhook-secret'

if (!SANITY_PROJECT_ID || !SANITY_TOKEN) {
  console.error('Error: NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_ADMIN_TOKEN must be set')
  console.error('Generate a token at: https://www.sanity.io/manage')
  process.exit(1)
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false
})

async function setupWebhooks() {
  console.log('Setting up Sanity webhooks...')
  console.log('')
  
  const environments = [
    {
      name: 'development',
      url: process.env.DEV_URL || 'http://localhost:3000',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET_DEV || 'development'
    },
    {
      name: 'production',
      url: process.env.PROD_URL || 'https://your-app.vercel.app',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
    }
  ]
  
  for (const env of environments) {
    const webhookUrl = `${env.url}/api/webhooks/sanity`
    const webhookName = `survival-pending-sync-${env.name}`
    
    console.log(`Creating webhook for ${env.name}:`)
    console.log(`  URL: ${webhookUrl}`)
    console.log(`  Dataset: ${env.dataset}`)
    
    const webhook = {
      name: webhookName,
      description: `Sync story updates to Neon (${env.name})`,
      url: webhookUrl,
      dataset: env.dataset,
      httpMethod: 'POST',
      includeDrafts: false,
      headers: {
        'Content-Type': 'application/json'
      },
      secret: WEBHOOK_SECRET,
      filter: '_type == "story"',
      projection: `{
        _type,
        _id,
        storyId,
        status,
        moderatorNotes,
        tags,
        categories,
        approvedAt,
        rejectedAt,
        "moderatorId": select(
          defined(approvedBy) => approvedBy,
          defined(rejectedBy) => rejectedBy,
          null
        )
      }`
    }
    
    try {
      // Note: Sanity webhook API requires manual setup through the dashboard
      // This is a placeholder for the webhook configuration
      console.log('  ✓ Webhook configuration generated')
      console.log('')
      console.log('To complete setup, add this webhook in Sanity Studio:')
      console.log(`  1. Go to https://www.sanity.io/manage/project/${SANITY_PROJECT_ID}/api/webhooks`)
      console.log('  2. Click "Create Webhook"')
      console.log('  3. Use these settings:')
      console.log(`     - Name: ${webhook.name}`)
      console.log(`     - URL: ${webhook.url}`)
      console.log(`     - Dataset: ${webhook.dataset}`)
      console.log(`     - Trigger on: Update, Create`)
      console.log(`     - Filter: ${webhook.filter}`)
      console.log(`     - Secret: ${WEBHOOK_SECRET}`)
      console.log('')
      
    } catch (error) {
      console.error(`  ❌ Failed to setup webhook for ${env.name}:`, error.message)
    }
  }
  
  console.log('Webhook setup instructions generated!')
  console.log('')
  console.log('Important: Add these environment variables:')
  console.log(`  SANITY_WEBHOOK_SECRET=${WEBHOOK_SECRET}`)
  console.log(`  CRON_SECRET=${generateSecret()}`)
  console.log('')
}

function generateSecret() {
  return require('crypto').randomBytes(32).toString('hex')
}

// Run setup
setupWebhooks().catch(console.error)