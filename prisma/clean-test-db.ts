import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTestDatabase() {
  console.log('Cleaning test database...');

  try {
    // Delete all data in reverse order of dependencies
    await prisma.crisisInterventionLog.deleteMany();
    await prisma.story.deleteMany();
    await prisma.userDemographics.deleteMany();
    await prisma.user.deleteMany();
    
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