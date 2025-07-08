import { NextRequest, NextResponse } from 'next/server';
import { getApprovedStories } from '@/lib/sanity-sync';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const maxLimit = 50;
    const finalLimit = Math.min(limit, maxLimit);

    const stories = await getApprovedStories(finalLimit);

    return NextResponse.json({
      success: true,
      stories,
      count: stories.length,
    });
  } catch (error) {
    console.error('Error fetching approved stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 },
    );
  }
}

// This endpoint can be cached for better performance
export const revalidate = 60; // Revalidate every minute