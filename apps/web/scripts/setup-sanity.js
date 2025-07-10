#!/usr/bin/env node

/**
 * Setup script for Sanity CMS
 * This helps initialize Sanity for the Survival Pending project
 */

console.log('🎨 Sanity Setup for Survival Pending\n');

console.log('To set up Sanity for this project, follow these steps:\n');

console.log('1. Create a Sanity account (if you haven\'t already):');
console.log('   → Visit https://www.sanity.io and sign up\n');

console.log('2. Create a new Sanity project:');
console.log('   → Run: npx sanity init --bare');
console.log('   → Choose "Create new project"');
console.log('   → Name it "Survival Pending"');
console.log('   → Choose the default dataset name (production)\n');

console.log('3. Get your project ID and create an API token:');
console.log('   → Go to https://www.sanity.io/manage');
console.log('   → Click on your project');
console.log('   → Copy the Project ID');
console.log('   → Go to API → Tokens');
console.log('   → Create a new token with "Editor" permissions');
console.log('   → Name it "Write Token"\n');

console.log('4. Add these to your .env.local file:');
console.log('   NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"');
console.log('   NEXT_PUBLIC_SANITY_DATASET="production"');
console.log('   SANITY_API_WRITE_TOKEN="your-token"\n');

console.log('5. Deploy the Sanity Studio:');
console.log('   → cd sanity');
console.log('   → npx sanity deploy');
console.log('   → Choose a unique hostname for your studio\n');

console.log('6. Access your studio:');
console.log('   → Local: http://localhost:3000/studio');
console.log('   → Deployed: https://your-hostname.sanity.studio\n');

console.log('📝 The studio will allow you to:');
console.log('   - Review submitted stories');
console.log('   - Approve or reject content');
console.log('   - Add categories and tags');
console.log('   - View sentiment analysis flags');
console.log('   - Add moderation notes\n');

console.log('✅ Once set up, stories will automatically sync to Sanity when submitted!');