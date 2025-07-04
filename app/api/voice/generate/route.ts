import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    const { text, voiceId } = await request.json();

    if (!text || !voiceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check character limit
    if (text.length > 1000) {
      return NextResponse.json({ error: 'Text exceeds character limit' }, { status: 400 });
    }

    // In development, return a dummy audio file
    if (process.env.NODE_ENV === 'development' && !process.env.ELEVENLABS_API_KEY) {
      // Return a longer dummy audio
      const dummyAudio = Buffer.from(
        'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=',
        'base64'
      );
      
      return new NextResponse(dummyAudio, {
        headers: {
          'Content-Type': 'audio/wav',
        },
      });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('ElevenLabs error:', await response.text());
      throw new Error('Failed to generate audio');
    }

    const audioBuffer = await response.arrayBuffer();
    
    // TODO: In production, upload to cloud storage and return URL
    // For now, return the audio directly
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Voice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}