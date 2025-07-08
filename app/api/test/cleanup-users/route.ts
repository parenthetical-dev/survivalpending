import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  // Only allow in test environment
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    // Delete all test users (those starting with 'test_user_')
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        username: {
          startsWith: 'test_user_'
        }
      }
    });

    // Also clean up any orphaned data
    await prisma.crisisInterventionLog.deleteMany({
      where: {
        user: {
          is: null
        }
      }
    });

    await prisma.story.deleteMany({
      where: {
        user: {
          is: null
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      deletedUsers: deletedUsers.count,
      message: `Cleaned up ${deletedUsers.count} test users` 
    });
  } catch (error) {
    console.error('Error cleaning up test users:', error);
    return NextResponse.json({ error: 'Failed to clean up test users' }, { status: 500 });
  }
}