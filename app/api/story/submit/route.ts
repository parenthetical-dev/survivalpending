import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { generateVoiceAudio, uploadAudioToStorage, ALLOWED_VOICE_IDS } from '@/lib/voice-generation';
import { syncStoryToSanity } from '@/lib/sanity-sync';
import { trackPurchase } from '@/lib/meta-capi';
import { getStoryColor } from '@/lib/utils/storyColors';
import { sanitizeForLogging } from '@/lib/sanitize';
import { validateTextContent, validateVoiceId, isSentimentResponse, isCategorizeResponse } from '@/lib/validation';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface SentimentFlags {
  hasCrisisContent?: boolean;
  riskLevel?: 'none' | 'low' | 'medium' | 'high';
  categories?: Array<'self-harm' | 'suicidal' | 'violence' | 'none'>;
}

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

    const body = await request.json();
    
    // Validate content text
    const contentText = validateTextContent(body.contentText, 1000);
    if (!contentText) {
      return NextResponse.json({ error: 'Invalid content text' }, { status: 400 });
    }
    
    // Validate optional sanitized content
    const contentSanitized = body.contentSanitized ? 
      validateTextContent(body.contentSanitized, 1000) : null;
    
    // Validate voice ID
    if (!validateVoiceId(body.voiceId, ALLOWED_VOICE_IDS)) {
      return NextResponse.json({ error: 'Invalid voice ID' }, { status: 400 });
    }
    const voiceId = body.voiceId as string;

    // Run sentiment analysis for crisis detection and get categories
    let sentimentFlags: SentimentFlags = {};
    let storyCategories: string[] = ['Identity']; // Default fallback

    try {
      // Get story categories using the categorization API
      const categorizeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentText }),
      });

      if (categorizeResponse.ok) {
        const categorizeData = await categorizeResponse.json();
        if (isCategorizeResponse(categorizeData) && categorizeData.categories.length > 0) {
          // Limit categories and sanitize
          storyCategories = categorizeData.categories
            .slice(0, 5) // Max 5 categories
            .map(cat => cat.substring(0, 50)); // Limit length
        }
      }
    } catch (error) {
      console.error('Categorization error:', sanitizeForLogging(error));
    }

    try {
      const sentimentResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `Analyze this story for crisis indicators. Return JSON only:
{
  "hasCrisisContent": boolean,
  "riskLevel": "none|low|medium|high",
  "categories": ["self-harm"|"suicidal"|"violence"|"none"]
}

Story: "${contentText}"`,
          },
        ],
      });

      const responseText = sentimentResponse.content[0].type === 'text'
        ? sentimentResponse.content[0].text
        : '{}';

      try {
        const parsedResponse = JSON.parse(responseText);
        if (isSentimentResponse(parsedResponse)) {
          sentimentFlags = parsedResponse;
        }
      } catch {
        // Invalid JSON response, use default flags
      }
    } catch (error) {
      console.error('Sentiment analysis error:', sanitizeForLogging(error));
    }

    // Create the story
    const story = await prisma.story.create({
      data: {
        userId: payload.userId,
        contentText,
        contentSanitized: contentSanitized || contentText,
        voiceId,
        sentimentFlags: sentimentFlags as any, // Convert to Prisma Json type
        flaggedHighRisk: sentimentFlags?.riskLevel === 'high',
        flaggedCrisis: sentimentFlags?.hasCrisisContent === true,
        flaggedPositive: false, // This would need a separate analysis
        status: 'PENDING',
        audioUrl: null, // Will be updated after audio generation
      },
    });

    // Update story with color based on its ID
    const storyColor = getStoryColor(story.id);
    await prisma.story.update({
      where: { id: story.id },
      data: { color: storyColor },
    });

    // Generate audio for the story
    let audioGenerationFailed = false;
    try {
      const textToGenerate = contentSanitized || contentText;
      const audioResult = await generateVoiceAudio(
        textToGenerate,
        voiceId,
        payload.userId,
        true, // Skip rate limit for story submission
      );

      if (audioResult.success) {
        // Upload audio to storage if we have a buffer
        let finalAudioUrl = audioResult.audioUrl;

        if (audioResult.audioBuffer) {
          const uploadedUrl = await uploadAudioToStorage(
            audioResult.audioBuffer,
            story.id,
            payload.userId,
            voiceId,
          );
          if (uploadedUrl) {
            finalAudioUrl = uploadedUrl;
          }
        }

        // Update the story with the audio URL
        if (finalAudioUrl) {
          await prisma.story.update({
            where: { id: story.id },
            data: { audioUrl: finalAudioUrl },
          });
        }
      } else {
        console.error('Audio generation failed:', sanitizeForLogging(audioResult.error));
        audioGenerationFailed = true;

        // Update story with a flag indicating audio generation failed
        await prisma.story.update({
          where: { id: story.id },
          data: {
            moderationNotes: `Audio generation failed: ${String(audioResult.error).substring(0, 200).replace(/[\n\r]/g, ' ')}`,
          },
        });
      }
    } catch (error) {
      console.error('Error during audio generation:', sanitizeForLogging(error));
      audioGenerationFailed = true;

      // Update story with error information
      await prisma.story.update({
        where: { id: story.id },
        data: {
          moderationNotes: `Audio generation error: ${error instanceof Error ? error.message.substring(0, 200).replace(/[\n\r]/g, ' '): 'Unknown error'}`,
        },
      });
    }

    // If crisis content detected, log it (intervention will be shown on frontend)
    if (sentimentFlags?.hasCrisisContent && sentimentFlags?.riskLevel !== 'none') {
      await prisma.crisisInterventionLog.create({
        data: {
          userId: payload.userId,
          storyId: story.id,
          triggerType: 'SENTIMENT_ANALYSIS',
          interventionShown: false, // Will be updated when actually shown
          resourcesClicked: [],
        },
      });
    }

    // Sync to Sanity for moderation
    try {
      // Fetch the story with user data for Sanity sync
      const storyWithUser = await prisma.story.findUnique({
        where: { id: story.id },
        include: { user: true },
      });

      if (storyWithUser) {
        await syncStoryToSanity(storyWithUser, storyCategories);
      }
    } catch (sanityError) {
      console.error('Failed to sync story to Sanity:', sanitizeForLogging(sanityError));
      // Don't fail the submission if Sanity sync fails
    }

    // Track story submission with Meta CAPI
    await trackPurchase(request, payload.userId, story.id, sentimentFlags);

    return NextResponse.json({
      success: true,
      storyId: story.id,
      hasCrisisContent: sentimentFlags?.hasCrisisContent || false,
      audioGenerated: !audioGenerationFailed,
    });
  } catch (error) {
    console.error('Story submission error:', sanitizeForLogging(error));
    return NextResponse.json(
      { error: 'Failed to submit story' },
      { status: 500 },
    );
  }
}