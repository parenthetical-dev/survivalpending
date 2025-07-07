import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { voicePreviewLimiter } from '@/lib/rate-limit';
import { trackInitiateCheckout } from '@/lib/meta-capi';

// Allowed ElevenLabs voice IDs
const ALLOWED_VOICE_IDS = [
  'EXAVITQu4vr4xnSDxMaL', // Sarah
  'MF3mGyEYCl7XYWbV9V6O', // Emily
  'TxGEqnHWrfWFTfGW9XjX', // Josh
  'VR6AewLTigWG4xSOukaG', // Arnold
  'pNInz6obpgDQGcFmaJgB', // Adam
  'yoZ06aMxZJJ28mfd3POQ', // Sam
  'AZnzlk1XvdvUeBnXmlld', // Domi
  'ThT5KcBeYPX3keUQqHPh', // Bella
];

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

    // Validate voice ID to prevent request forgery
    if (!ALLOWED_VOICE_IDS.includes(voiceId)) {
      return NextResponse.json({ error: 'Invalid voice ID' }, { status: 400 });
    }

    // Check rate limit
    const rateLimitResult = await voicePreviewLimiter.check(payload.userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    // In development, return a dummy audio file
    if (process.env.NODE_ENV === 'development' && !process.env.ELEVENLABS_API_KEY) {
      // Return a simple beep sound as base64
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

    // Retry logic for ElevenLabs API
    let response;
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': process.env.ELEVENLABS_API_KEY!,
            },
            body: JSON.stringify({
              text: text.slice(0, 100), // Limit preview length
              model_id: 'eleven_multilingual_v2', // Higher quality, more emotional model
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
                style: 0,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('ElevenLabs error:', errorText);
          
          // Check for specific error codes
          if (response.status === 429) {
            // Rate limit - wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
            retries--;
            lastError = new Error('Rate limit exceeded');
            continue;
          } else if (response.status === 401) {
            throw new Error('Invalid API key');
          } else if (response.status === 422) {
            throw new Error('Invalid voice ID');
          }
          
          throw new Error(`Failed to generate audio: ${errorText}`);
        }
        
        break; // Success, exit loop
      } catch (error) {
        lastError = error;
        retries--;
        if (retries === 0) throw lastError;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const audioBuffer = await response!.arrayBuffer();
    
    // Track that user has entered the voice stage
    await trackInitiateCheckout(request, payload.userId, 'voice');
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Voice preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}