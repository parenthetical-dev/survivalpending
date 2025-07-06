#!/usr/bin/env node

/**
 * Script to generate real audio for all example stories using ElevenLabs API
 */

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@sanity/client');
const { put } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

// Voice mapping for ElevenLabs
const voiceMapping = {
  'voice_1': 'XB0fDUnXU5powFXDhCwa', // Charlotte - warm, conversational
  'voice_2': 'N2lVS1w4EtoT3dr4eOWO', // Callum - clear, professional  
  'voice_3': 'jsCqWAovK2LkecY7zXl4', // Clyde - gentle, soothing
  'voice_4': 'IKne3meq5aSn9XLyUdCD', // Dave - strong, confident
  'voice_5': 'ThT5KcBeYPX3keUQqHPh', // Dorothy - youthful, energetic
  'voice_6': 'pMsXgVXv3BLzUgSXRplE', // Ethan - mature, wise
  'voice_7': 'g5CIjZEefAph4nQFvHAz', // Gigi - neutral, balanced
  'voice_8': 'EXAVITQu4vr4xnSDxMaL'  // Jessie - expressive, dynamic
};

async function generateAudioForStory(story, isProd = false) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: isProd ? process.env.PROD_DATABASE_URL : process.env.DATABASE_URL
      }
    }
  });

  const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xh75mh7d',
    dataset: isProd ? 'production' : 'development',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN
  });

  try {
    console.log(`\n🎙️  Generating audio for ${story.username}...`);
    
    // Get the ElevenLabs voice ID
    const elevenLabsVoiceId = voiceMapping[story.voiceId];
    if (!elevenLabsVoiceId) {
      throw new Error(`No ElevenLabs voice mapping for ${story.voiceId}`);
    }

    // Generate audio using ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: story.contentSanitized || story.contentText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    console.log(`  ✓ Generated ${(audioBuffer.byteLength / 1024).toFixed(2)} KB of audio`);

    // Upload to Vercel Blob
    const filename = `stories/${story.id}/audio.mp3`;
    const blob = await put(filename, audioBuffer, {
      access: 'public',
      contentType: 'audio/mpeg',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    console.log(`  ✓ Uploaded to Vercel Blob: ${blob.url}`);

    // Update PostgreSQL
    await prisma.story.update({
      where: { id: story.id },
      data: { audioUrl: blob.url }
    });
    console.log(`  ✓ Updated PostgreSQL with audio URL`);

    // Update Sanity
    const sanityStory = await sanityClient.fetch(
      `*[_type == "story" && storyId == $storyId][0]`,
      { storyId: story.id }
    );

    if (sanityStory) {
      await sanityClient
        .patch(sanityStory._id)
        .set({ audioUrl: blob.url })
        .commit();
      console.log(`  ✓ Updated Sanity with audio URL`);
    }

    console.log(`  ✅ Audio generation complete for ${story.username}`);
    return blob.url;

  } catch (error) {
    console.error(`  ❌ Failed to generate audio for ${story.username}:`, error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function generateAllExampleAudio() {
  console.log('🎤 Generating audio for all example stories...\n');

  const isDev = !process.argv.includes('--prod');
  const environment = isDev ? 'DEVELOPMENT' : 'PRODUCTION';
  
  console.log(`Environment: ${environment}`);
  console.log(`Using ${isDev ? 'development' : 'production'} database\n`);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: isDev ? process.env.DATABASE_URL : process.env.PROD_DATABASE_URL
      }
    }
  });

  try {
    // Fetch all example stories without audio
    const stories = await prisma.story.findMany({
      where: {
        contentText: {
          startsWith: '[EXAMPLE]'
        },
        audioUrl: null
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${stories.length} stories without audio\n`);

    if (stories.length === 0) {
      console.log('All example stories already have audio!');
      return;
    }

    // Generate audio for each story
    let successCount = 0;
    for (const story of stories) {
      try {
        await generateAudioForStory(story, !isDev);
        successCount++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate audio for story ${story.id}`);
      }
    }

    console.log(`\n✅ Successfully generated audio for ${successCount}/${stories.length} stories!`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if ElevenLabs API key is set
if (!process.env.ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY is not set in environment variables!');
  process.exit(1);
}

// Check if Blob token is set
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN is not set in environment variables!');
  process.exit(1);
}

generateAllExampleAudio();