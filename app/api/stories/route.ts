import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET() {
  try {
    const query = `*[_type == "story" && status == "approved"] | order(createdAt desc) {
      _id,
      username,
      contentSanitized,
      audioUrl,
      createdAt,
      "voiceSettings": {
        "voiceName": voiceId
      }
    }`;

    const stories = await sanityClient.fetch(query);
    return NextResponse.json({ stories: stories || [] });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ stories: [] }, { status: 500 });
  }
}