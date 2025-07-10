import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTestDatabase() {
  console.log('Cleaning test database...');

  try {
    // Delete all data in reverse order of dependencies
    const crisisLogs = await prisma.crisisInterventionLog.deleteMany();
    console.log(`Deleted ${crisisLogs.count} crisis intervention logs`);
    
    const stories = await prisma.story.deleteMany();
    console.log(`Deleted ${stories.count} stories`);
    
    const demographics = await prisma.userDemographics.deleteMany();
    console.log(`Deleted ${demographics.count} user demographics`);
    
    const users = await prisma.user.deleteMany();
    console.log(`Deleted ${users.count} users`);
    
    // Verify cleanup
    const remainingUsers = await prisma.user.count();
    if (remainingUsers > 0) {
      throw new Error(`Failed to clean all users. ${remainingUsers} users remain.`);
    }
    
    console.log('✅ Test database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning test database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly
if (require.main === module) {
  cleanTestDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { cleanTestDatabase };