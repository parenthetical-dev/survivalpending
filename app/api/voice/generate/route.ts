import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { generateVoiceAudio } from '@/lib/voice-generation';

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

    // Use the voice generation service
    const result = await generateVoiceAudio(text, voiceId, payload.userId);

    if (!result.success) {
      // Check if it's a rate limit error to return proper headers
      if (result.error?.includes('Rate limit exceeded')) {
        const retryAfterMatch = result.error.match(/Try again in (\d+) seconds/);
        const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1]) : 60;
        
        return NextResponse.json(
          { 
            error: 'Too many requests. Please try again later.',
            retryAfter
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': '5',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': (Date.now() + retryAfter * 1000).toString(),
            }
          }
        );
      }

      return NextResponse.json(
        { error: result.error || 'Failed to generate audio' },
        { status: 500 }
      );
    }

    // Return the audio buffer if available
    if (result.audioBuffer) {
      return new NextResponse(result.audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': result.audioBuffer.byteLength.toString(),
        },
      });
    }

    // This shouldn't happen, but handle it gracefully
    return NextResponse.json(
      { error: 'Audio generated but buffer not available' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Voice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}