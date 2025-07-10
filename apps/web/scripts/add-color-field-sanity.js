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

async function addColorField(dataset) {
  console.log(`\nAdding color field to Sanity ${dataset} dataset...`);
  
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID || 'xh75mh7d',
    dataset: dataset,
    apiVersion: '2023-12-07',
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false
  });

  try {
    // Fetch all stories
    const stories = await client.fetch(`*[_type == "story"] { _id, _rev, storyId }`);
    
    console.log(`Found ${stories.length} stories in ${dataset}`);
    
    if (stories.length === 0) {
      console.log(`✓ No stories to update in ${dataset}`);
      return;
    }
    
    // Create mutations with unset to add the field
    const mutations = [];
    
    for (const story of stories) {
      const color = getStoryColor(story.storyId || story._id);
      
      // Use createOrReplace to update the document with the new field
      mutations.push({
        patch: {
          id: story._id,
          ifRevisionID: story._rev,
          set: {
            color: color
          }
        }
      });
      
      console.log(`  Preparing to add color ${color} to story ${story._id}`);
    }
    
    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < mutations.length; i += batchSize) {
      const batch = mutations.slice(i, i + batchSize);
      
      try {
        const result = await client.transaction(batch).commit();
        console.log(`  ✓ Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(mutations.length / batchSize)}`);
      } catch (error) {
        console.error(`  ❌ Failed batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        
        // Try individual updates for failed batch
        for (const mutation of batch) {
          try {
            await client.patch(mutation.patch.id).set(mutation.patch.set).commit();
            console.log(`    ✓ Individually updated ${mutation.patch.id}`);
          } catch (individualError) {
            console.error(`    ❌ Failed to update ${mutation.patch.id}:`, individualError.message);
          }
        }
      }
    }
    
    console.log(`✅ Sanity ${dataset} dataset color field addition completed!`);
    
  } catch (error) {
    console.error(`❌ Error adding color field to Sanity ${dataset}:`, error.message);
  }
}

async function main() {
  console.log('Starting Sanity color field addition...');
  console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xh75mh7d');
  
  // Update both datasets
  await addColorField('development');
  await addColorField('production');
  
  console.log('\n✨ All Sanity color field additions completed!');
}

main().catch(console.error);