import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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

    const { contentText, contentSanitized, voiceId } = await request.json();

    if (!contentText || !voiceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Run sentiment analysis for crisis detection
    let sentimentFlags = {};
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

Story: "${contentText}"`
          }
        ]
      });

      const responseText = sentimentResponse.content[0].type === 'text' 
        ? sentimentResponse.content[0].text 
        : '{}';
      
      sentimentFlags = JSON.parse(responseText);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
    }

    // Create the story
    const story = await prisma.story.create({
      data: {
        userId: payload.userId,
        contentText,
        contentSanitized: contentSanitized || contentText,
        sentimentFlags,
        status: 'PENDING',
        // TODO: Generate and store audio URL from ElevenLabs
        audioUrl: null,
      },
    });

    // If crisis content detected, log it
    if (sentimentFlags.hasCrisisContent && sentimentFlags.riskLevel !== 'none') {
      await prisma.crisisInterventionLog.create({
        data: {
          storyId: story.id,
          riskLevel: sentimentFlags.riskLevel,
          interventionShown: true,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      storyId: story.id,
      hasCrisisContent: sentimentFlags.hasCrisisContent 
    });
  } catch (error) {
    console.error('Story submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit story' },
      { status: 500 }
    );
  }
}