const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Story color function
function getStoryColor(storyId) {
  const colors = [
    '#E40303', '#FF8C00', '#FFED00', '#008026', '#24408E',
    '#732982', '#5BCEFA', '#F5A9B8', '#613915'
  ];
  
  let hash = 0;
  for (let i = 0; i < storyId.length; i++) {
    const char = storyId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  hash = Math.abs(hash);
  const colorIndex = hash % colors.length;
  return colors[colorIndex];
}

async function updateSanityDataset(dataset) {
  console.log(`\nUpdating Sanity ${dataset} dataset...`);
  
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID,
    dataset: dataset,
    apiVersion: '2023-12-07',
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false
  });

  try {
    // Fetch stories without colors
    const stories = await client.fetch(
      `*[_type == "story" && !defined(color)] { _id, storyId }`
    );
    
    console.log(`Found ${stories.length} stories without colors in ${dataset}`);
    
    if (stories.length === 0) {
      console.log(`✓ All stories already have colors in ${dataset}`);
      return;
    }
    
    // Create mutations
    const mutations = stories.map(story => ({
      patch: {
        id: story._id,
        set: {
          color: getStoryColor(story.storyId || story._id)
        }
      }
    }));
    
    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < mutations.length; i += batchSize) {
      const batch = mutations.slice(i, i + batchSize);
      const transaction = client.transaction();
      
      batch.forEach(mutation => {
        transaction.patch(mutation.patch.id, mutation.patch.set);
      });
      
      await transaction.commit();
      console.log(`  ✓ Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(mutations.length / batchSize)}`);
    }
    
    console.log(`✅ Sanity ${dataset} dataset updated successfully!`);
    
  } catch (error) {
    console.error(`❌ Error updating Sanity ${dataset}:`, error.message);
  }
}

async function main() {
  console.log('Starting Sanity updates...');
  
  // Update both datasets
  await updateSanityDataset('development');
  await updateSanityDataset('production');
  
  console.log('\n✨ All Sanity updates completed!');
}

main().catch(console.error);