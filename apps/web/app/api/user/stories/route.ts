import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sanityClient } from '@/lib/sanity';
import prisma from '@/lib/prisma';
import { getStoryColor } from '@/lib/utils/storyColors';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user from database to get username
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { username: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[User Stories API] Fetching stories for username:', user.username);
    console.log('[User Stories API] User ID:', payload.userId);

    // First, let's check what stories exist in Sanity
    const allStories = await sanityClient.fetch(
      `*[_type == "story"][0...10] {
        _id,
        username,
        storyId
      }`,
    );
    console.log('[User Stories API] Sample of all stories in Sanity:', allStories);

    // Fetch user's stories from Sanity (ALL statuses - pending, approved, rejected)
    const stories = await sanityClient.fetch(
      `*[_type == "story" && username == $username] | order(createdAt desc) {
        _id,
        storyId,
        username,
        content,
        contentSanitized,
        audioUrl,
        createdAt,
        categories,
        status,
        color
      }`,
      { username: user.username },
    );

    console.log('[User Stories API] Found stories in Sanity:', stories.length);
    console.log('[User Stories API] Story statuses:', stories.map((s: any) => ({ id: s.storyId, status: s.status })));

    // If no stories found in Sanity, also check PostgreSQL directly
    if (stories.length === 0) {
      console.log('[User Stories API] No stories in Sanity, checking PostgreSQL...');
      const pgStories = await prisma.story.findMany({
        where: { userId: payload.userId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
      console.log('[User Stories API] Found in PostgreSQL:', pgStories.length);

      // Convert PostgreSQL stories to match the expected format
      const formattedStories = pgStories.map(story => ({
        _id: story.id,
        storyId: story.id,
        username: story.user?.username || user.username,
        contentSanitized: story.contentSanitized || story.contentText,
        audioUrl: story.audioUrl,
        createdAt: story.createdAt.toISOString(),
        categories: [],
        status: story.status.toLowerCase(),
        color: getStoryColor(story.id),
      }));

      return NextResponse.json({
        stories: formattedStories,
        count: formattedStories.length,
        source: 'postgresql',
      });
    }

    return NextResponse.json({
      stories,
      count: stories.length,
      source: 'sanity',
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 },
    );
  }
}