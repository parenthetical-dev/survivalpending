#!/usr/bin/env node

/**
 * Script to approve all [EXAMPLE] stories in Sanity PRODUCTION dataset
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

// Force production dataset
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xh75mh7d',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN
});

async function approveProductionExampleStories() {
  console.log(`📝 Approving [EXAMPLE] stories in Sanity PRODUCTION dataset...\n`);
  console.log('⚠️  This will approve stories in the PRODUCTION environment!');
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // Fetch all pending stories that start with [EXAMPLE]
    const pendingStories = await sanityClient.fetch(
      `*[_type == "story" && status == "pending" && content match "[EXAMPLE]*"] {
        _id,
        username,
        content,
        status
      }`
    );

    console.log(`Found ${pendingStories.length} pending example stories`);

    if (pendingStories.length === 0) {
      console.log('No pending example stories to approve.');
      return;
    }

    // Approve each story
    for (let i = 0; i < pendingStories.length; i++) {
      const story = pendingStories[i];
      console.log(`\nApproving story ${i + 1}/${pendingStories.length}: ${story.username}`);
      
      const result = await sanityClient
        .patch(story._id)
        .set({
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: 'system-prod-setup'
        })
        .commit();
      
      console.log(`✓ Approved: ${result._id}`);
    }

    console.log(`\n✅ Successfully approved ${pendingStories.length} example stories in PRODUCTION!`);
    console.log('These stories are now visible on the production stories page.');
    
  } catch (error) {
    console.error('❌ Error approving production stories:', error);
    process.exit(1);
  }
}

approveProductionExampleStories();