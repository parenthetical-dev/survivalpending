import { NextResponse } from 'next/server';
import { getHomepageFeaturedStories } from '@/lib/sanity-homepage';

export async function GET() {
  try {
    const stories = await getHomepageFeaturedStories();
    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Error fetching featured stories:', error);
    return NextResponse.json({ stories: [] }, { status: 500 });
  }
}