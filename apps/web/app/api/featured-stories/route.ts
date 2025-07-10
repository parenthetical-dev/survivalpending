import { NextResponse } from 'next/server';
import { getFeaturedStories } from '@/lib/featured-stories';

export async function GET() {
  try {
    const stories = await getFeaturedStories();
    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Error fetching featured stories:', error);
    return NextResponse.json({ stories: [] }, { status: 500 });
  }
}