#!/usr/bin/env node

/**
 * Test script for ElevenLabs API integration
 * Usage: ELEVENLABS_API_KEY=your_key node scripts/test-elevenlabs.js
 */

async function testElevenLabs() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ELEVENLABS_API_KEY environment variable is not set');
    console.log('\nUsage: ELEVENLABS_API_KEY=your_key node scripts/test-elevenlabs.js');
    process.exit(1);
  }

  console.log('🔍 Testing ElevenLabs API connection...\n');

  // Test voice ID (Sarah)
  const voiceId = 'EXAVITQu4vr4xnSDxMaL';
  const testText = 'Hello, this is a test of the ElevenLabs text-to-speech API.';

  try {
    // Test the API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: testText,
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
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      
      if (response.status === 401) {
        console.log('\n⚠️  Invalid API key. Please check your ELEVENLABS_API_KEY.');
      } else if (response.status === 422) {
        console.log('\n⚠️  Invalid voice ID. The voice may no longer be available.');
      } else if (response.status === 429) {
        console.log('\n⚠️  Rate limit exceeded. Please wait and try again.');
      }
      
      process.exit(1);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('✅ Successfully generated audio!');
    console.log(`   Size: ${(audioBuffer.byteLength / 1024).toFixed(2)} KB`);
    console.log(`   Format: MP3 (44100Hz, 128kbps)`);
    console.log(`   Voice: Sarah (${voiceId})`);
    
    // Test character count
    console.log('\n📊 Character count test:');
    console.log(`   Test text: ${testText.length} characters`);
    console.log(`   Max allowed: 1000 characters`);
    console.log(`   Preview limit: 100 characters`);

    // List available voices (optional)
    console.log('\n🎤 Fetching available voices...');
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (voicesResponse.ok) {
      const voicesData = await voicesResponse.json();
      console.log(`✅ Found ${voicesData.voices.length} available voices`);
      
      // Check if our configured voices exist
      const configuredVoices = [
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Emily' },
        { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
        { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' },
        { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
      ];
      
      console.log('\n🔍 Checking configured voices:');
      for (const voice of configuredVoices) {
        const exists = voicesData.voices.some(v => v.voice_id === voice.id);
        console.log(`   ${voice.name}: ${exists ? '✅' : '❌'} ${voice.id}`);
      }
    }

    console.log('\n✨ ElevenLabs integration is working correctly!');
    console.log('\n💡 Next steps:');
    console.log('   1. Add the ELEVENLABS_API_KEY to your .env.local file');
    console.log('   2. The voice generation endpoints will automatically use the real API');
    console.log('   3. Consider implementing cloud storage for generated audio files');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

testElevenLabs();