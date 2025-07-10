const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function updateDatabase(databaseUrl, dbName) {
  console.log(`\nUpdating ${dbName} database...`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  try {
    // Check if color column exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Story' 
      AND column_name = 'color'
    `;
    
    if (result.length === 0) {
      console.log(`Adding color column to ${dbName}...`);
      await prisma.$executeRaw`ALTER TABLE "Story" ADD COLUMN "color" TEXT`;
      console.log(`✓ Color column added to ${dbName}`);
    } else {
      console.log(`✓ Color column already exists in ${dbName}`);
    }
    
    // Count stories without colors
    const storiesWithoutColor = await prisma.story.count({
      where: { color: null }
    });
    
    console.log(`Found ${storiesWithoutColor} stories without colors in ${dbName}`);
    
    if (storiesWithoutColor > 0) {
      // Get story color function
      const getStoryColor = (storyId) => {
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
      };
      
      // Update stories
      const stories = await prisma.story.findMany({
        where: { color: null },
        select: { id: true }
      });
      
      for (const story of stories) {
        const color = getStoryColor(story.id);
        await prisma.story.update({
          where: { id: story.id },
          data: { color }
        });
        console.log(`  ✓ Updated story ${story.id} with color ${color}`);
      }
    }
    
    console.log(`✅ ${dbName} database updated successfully!`);
    
  } catch (error) {
    console.error(`❌ Error updating ${dbName}:`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('Starting database updates...');
  
  // Update development database
  if (process.env.DATABASE_URL) {
    await updateDatabase(process.env.DATABASE_URL, 'Development');
  }
  
  // Update production database
  if (process.env.PROD_DATABASE_URL) {
    await updateDatabase(process.env.PROD_DATABASE_URL, 'Production');
  }
  
  console.log('\n✨ All database updates completed!');
}

main().catch(console.error);