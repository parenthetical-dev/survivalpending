import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get('exclude');
    
    // Build query with optional exclusion
    const excludeFilter = excludeId ? ` && _id != "${excludeId}"` : '';
    
    // Fetch all approved story IDs
    const query = `*[_type == "story" && status == "approved"${excludeFilter}] {
      _id
    }`;
    
    const stories = await sanityClient.fetch(query);
    
    if (!stories || stories.length === 0) {
      return NextResponse.json({ error: 'No stories available' }, { status: 404 });
    }
    
    // Select a random story
    const randomIndex = Math.floor(Math.random() * stories.length);
    const randomStory = stories[randomIndex];
    
    return NextResponse.json({ storyId: randomStory._id });
  } catch (error) {
    console.error('Error fetching random story:', error);
    return NextResponse.json({ error: 'Failed to fetch random story' }, { status: 500 });
  }
}