import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const query = `*[_type == "story" && _id == $id && status == "approved"][0] {
      _id,
      username,
      contentSanitized,
      audioUrl,
      createdAt,
      color,
      "voiceSettings": {
        "voiceName": voiceId
      }
    }`;

    const story = await sanityClient.fetch(query, { id });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}