import { voiceGenerateLimiter } from '../lib/rate-limit';
import { uploadAudioToBlob, generateAudioFilename } from '../lib/blob-storage';
import { sanitizeForLogging } from '../lib/sanitize';

interface VoiceGenerationResult {
  success: boolean;
  audioUrl?: string;
  audioBuffer?: ArrayBuffer;
  error?: string;
}

// Allowed ElevenLabs voice IDs
export const ALLOWED_VOICE_IDS = [
  'EXAVITQu4vr4xnSDxMaL', // Sarah
  'MF3mGyEYCl7XYWbV9V6O', // Emily
  'TxGEqnHWrfWFTfGW9XjX', // Josh
  'VR6AewLTigWG4xSOukaG', // Arnold
  'pNInz6obpgDQGcFmaJgB', // Adam
  'yoZ06aMxZJJ28mfd3POQ', // Sam
  'AZnzlk1XvdvUeBnXmlld', // Domi
  'ThT5KcBeYPX3keUQqHPh', // Bella
];

export async function generateVoiceAudio(
  text: string,
  voiceId: string,
  userId: string,
  skipRateLimit: boolean = false,
): Promise<VoiceGenerationResult> {
  try {
    // Validate voice ID to prevent request forgery
    // CodeQL False Positive: js/request-forgery - Voice ID is properly validated against allowlist
    if (!ALLOWED_VOICE_IDS.includes(voiceId)) {
      return { success: false, error: 'Invalid voice ID' };
    }

    // Check character limit
    if (text.length > 1000) {
      return { success: false, error: 'Text exceeds character limit' };
    }

    // Check rate limit unless skipped (for internal use)
    if (!skipRateLimit) {
      const rateLimitResult = await voiceGenerateLimiter.check(userId);
      if (!rateLimitResult.success) {
        return {
          success: false,
          error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds`,
        };
      }
    }

    // In development, return a dummy audio URL
    if (process.env.NODE_ENV === 'development' && !process.env.ELEVENLABS_API_KEY) {
      // Return a dummy audio URL for development
      return {
        success: true,
        audioUrl: '/api/voice/dummy-audio.mp3',
        audioBuffer: Buffer.from(
          'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=',
          'base64',
        ).buffer,
      };
    }

    // Retry logic for ElevenLabs API
    let response;
    let retries = 3;
    let lastError;

    // eslint-disable-next-line no-await-in-loop -- Retry logic requires sequential attempts
    while (retries > 0) {
      try {
        // CodeQL False Positive: js/request-forgery - Voice ID is validated above against ALLOWED_VOICE_IDS
        response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
            },
            body: JSON.stringify({
              text,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
                style: 0,
                use_speaker_boost: true,
              },
              optimize_streaming_latency: 0,
              output_format: 'mp3_44100_128',
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('ElevenLabs error:', sanitizeForLogging(errorText));

          if (response.status === 429) {
            // eslint-disable-next-line no-await-in-loop -- Need to wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
            retries--;
            lastError = new Error('Rate limit exceeded');
            continue;
          } else if (response.status === 401) {
            return { success: false, error: 'Invalid API key' };
          } else if (response.status === 422) {
            return { success: false, error: 'Invalid voice ID' };
          } else if (response.status === 400 && errorText.includes('quota')) {
            return { success: false, error: 'API quota exceeded' };
          }

          throw new Error(`Failed to generate audio: ${sanitizeForLogging(errorText)}`);
        }

        break; // Success, exit loop
      } catch (error) {
        lastError = error;
        retries--;
        if (retries === 0) {
          return { success: false, error: (lastError as any)?.message || 'Failed to generate audio' };
        }
        // eslint-disable-next-line no-await-in-loop -- Need to wait before retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!response) {
      return { success: false, error: 'Failed to generate audio after retries' };
    }

    const audioBuffer = await response.arrayBuffer();

    // Generate a temporary story ID for the audio file
    const tempStoryId = `temp_${Date.now()}`;

    // Upload to Vercel Blob storage
    try {
      const uploadResult = await uploadAudioToBlob(audioBuffer, generateAudioFilename(tempStoryId, userId, voiceId), {
        contentType: 'audio/mpeg',
        addRandomSuffix: true,
      });

      return {
        success: true,
        audioUrl: uploadResult.url,
        audioBuffer,
      };
    } catch (uploadError) {
      console.error('Failed to upload audio to blob storage:', sanitizeForLogging(uploadError));

      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          audioUrl: `/api/audio/story-${tempStoryId}.mp3`,
          audioBuffer,
        };
      }

      return {
        success: false,
        error: 'Failed to upload audio',
      };
    }
  } catch (error) {
    console.error('Voice generation error:', sanitizeForLogging(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate audio',
    };
  }
}

// Function to upload audio to cloud storage
export async function uploadAudioToStorage(
  audioBuffer: ArrayBuffer,
  storyId: string,
  userId?: string,
  voiceId?: string,
): Promise<string | null> {
  try {
    // Generate a unique filename
    const filename = generateAudioFilename(
      storyId,
      userId || 'anonymous',
      voiceId || 'default',
    );

    // Upload to Vercel Blob storage
    const uploadResult = await uploadAudioToBlob(audioBuffer, filename, {
      contentType: 'audio/mpeg',
      addRandomSuffix: true,
    });

    return uploadResult.url;
  } catch (error) {
    console.error('Failed to upload audio to blob storage:', sanitizeForLogging(error));

    // In development, return a dummy URL as fallback
    if (process.env.NODE_ENV === 'development') {
      return `/api/audio/story-${storyId}.mp3`;
    }

    return null;
  }
}