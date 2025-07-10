#!/usr/bin/env node

/**
 * Script to clear all stories from Sanity datasets
 * Usage: node scripts/clear-sanity.js [--dataset=production]
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

// Parse command line arguments
const args = process.argv.slice(2);
const datasetArg = args.find(arg => arg.startsWith('--dataset='));
const dataset = datasetArg ? datasetArg.split('=')[1] : 'development';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xh75mh7d',
  dataset: dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN
});

async function clearSanityStories() {
  console.log(`🗑️  Clearing stories from Sanity ${dataset} dataset...`);
  
  if (dataset === 'production') {
    console.log('\n⚠️  WARNING: You are about to clear the PRODUCTION Sanity dataset!');
    console.log('This will delete ALL stories from Sanity.');
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  try {
    // Fetch all story documents
    console.log('Fetching all stories...');
    const stories = await sanityClient.fetch('*[_type == "story"]');
    console.log(`Found ${stories.length} stories to delete`);

    if (stories.length === 0) {
      console.log('No stories to delete.');
      return;
    }

    // Delete stories in batches
    const batchSize = 10;
    for (let i = 0; i < stories.length; i += batchSize) {
      const batch = stories.slice(i, i + batchSize);
      const transaction = sanityClient.transaction();
      
      batch.forEach(story => {
        transaction.delete(story._id);
      });
      
      await transaction.commit();
      console.log(`✓ Deleted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(stories.length / batchSize)}`);
    }

    console.log(`\n✅ Successfully deleted ${stories.length} stories from Sanity ${dataset} dataset!`);
    
  } catch (error) {
    console.error('❌ Error clearing Sanity:', error);
    process.exit(1);
  }
}

clearSanityStories();