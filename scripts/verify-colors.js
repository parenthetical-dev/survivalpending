const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function verifyColors(dataset) {
  console.log(`\nVerifying colors in Sanity ${dataset} dataset...`);
  
  const client = createClient({
    projectId: 'xh75mh7d',
    dataset: dataset,
    apiVersion: '2023-12-07',
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false
  });

  try {
    // Fetch stories with color field
    const storiesWithColor = await client.fetch(
      `*[_type == "story" && defined(color)] { _id, storyId, color }`
    );
    
    // Fetch stories without color field
    const storiesWithoutColor = await client.fetch(
      `*[_type == "story" && !defined(color)] { _id, storyId }`
    );
    
    console.log(`✓ Stories with color: ${storiesWithColor.length}`);
    console.log(`✗ Stories without color: ${storiesWithoutColor.length}`);
    
    if (storiesWithColor.length > 0) {
      console.log(`  Sample colors:`, storiesWithColor.slice(0, 3).map(s => `${s._id}: ${s.color}`));
    }
    
  } catch (error) {
    console.error(`❌ Error verifying colors in Sanity ${dataset}:`, error.message);
  }
}

async function main() {
  console.log('Verifying Sanity color fields...');
  
  await verifyColors('development');
  await verifyColors('production');
  
  console.log('\n✨ Verification completed!');
}

main().catch(console.error);