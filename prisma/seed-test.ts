import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedTestDatabase() {
  console.log('Seeding test database...');

  try {
    // Create test users
    const testUser = await prisma.user.create({
      data: {
        username: 'test_user_1234',
        passwordHash: await bcrypt.hash('TestPassword123!', 10),
        hasCompletedOnboarding: true,
        isBanned: false,
      },
    });

    const newUser = await prisma.user.create({
      data: {
        username: 'new_user_5678',
        passwordHash: await bcrypt.hash('TestPassword123!', 10),
        hasCompletedOnboarding: false,
        isBanned: false,
      },
    });

    console.log('Created test users:', { testUser: testUser.username, newUser: newUser.username });

    // Create a test story
    const story = await prisma.story.create({
      data: {
        userId: testUser.id,
        contentText: 'This is a test story about finding acceptance.',
        contentSanitized: 'This is a test story about finding acceptance.',
        voiceId: 'EXAVITQu4vr4xnSDxMaL',
        audioUrl: 'https://example.com/test-audio.mp3',
        status: 'APPROVED',
        sentimentFlags: {
          hasCrisisContent: false,
          riskLevel: 'none',
          categories: ['none'],
        },
        flaggedHighRisk: false,
        flaggedCrisis: false,
        flaggedPositive: true,
        color: '#FF6B6B',
        approvedAt: new Date(),
      },
    });

    console.log('Created test story:', story.id);

    console.log('✅ Test database seeded successfully');
  } catch (error) {
    console.error('Error seeding test database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly
if (require.main === module) {
  seedTestDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}