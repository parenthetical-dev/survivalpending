// Test script for audio generation in story submission
// Run with: npx tsx test-audio-generation.ts

import { generateVoiceAudio } from './lib/voice-generation';

async function testAudioGeneration() {
  console.log('Testing audio generation service...\n');

  const testText = 'This is a test story to verify audio generation is working correctly.';
  const testVoiceId = 'rachel'; // One of the available voice IDs
  const testUserId = 'test-user-123';

  console.log('Test parameters:');
  console.log(`- Text: "${testText}"`);
  console.log(`- Voice ID: ${testVoiceId}`);
  console.log(`- User ID: ${testUserId}`);
  console.log(`- Skip Rate Limit: true`);
  console.log('');

  try {
    const result = await generateVoiceAudio(testText, testVoiceId, testUserId, true);
    
    console.log('Result:');
    console.log(`- Success: ${result.success}`);
    console.log(`- Audio URL: ${result.audioUrl || 'N/A'}`);
    console.log(`- Audio Buffer Size: ${result.audioBuffer ? result.audioBuffer.byteLength + ' bytes' : 'N/A'}`);
    console.log(`- Error: ${result.error || 'None'}`);
    
    if (process.env.NODE_ENV === 'development' && !process.env.ELEVENLABS_API_KEY) {
      console.log('\nNote: Running in development mode without ElevenLabs API key.');
      console.log('Dummy audio data is being returned.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAudioGeneration();