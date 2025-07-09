import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  // Allow in test environment or with test secret
  const testSecret = request.headers.get('x-test-secret');
  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  const hasValidSecret = testSecret === process.env.TEST_SECRET;
  
  if (!isTestEnv && !hasValidSecret) {
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

    // Note: Related records (stories, crisis logs) are automatically deleted due to cascade delete in schema

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