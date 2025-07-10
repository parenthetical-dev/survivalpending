import { NextRequest, NextResponse } from 'next/server';
import { getApprovedStories } from '@/lib/sanity-sync';

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic';

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