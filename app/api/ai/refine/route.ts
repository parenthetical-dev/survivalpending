import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
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

    const { content } = await request.json();

    if (!content || content.length < 50) {
      return NextResponse.json({ 
        suggestions: [] 
      });
    }

    const completion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `You are helping refine personal stories for an LGBTQ+ testimony platform. The stories will be converted to 90-second audio clips.

Analyze this story and suggest 2-3 specific improvements for:
1. Clarity - Make key moments clearer
2. Impact - Strengthen emotional resonance
3. Flow - Improve narrative structure

Story:
"${content}"

Return suggestions in this JSON format:
{
  "suggestions": [
    {
      "type": "clarity|impact|flow",
      "original": "exact phrase from the story",
      "suggested": "improved version",
      "reason": "brief explanation"
    }
  ]
}

Important:
- Preserve the authentic voice
- Keep suggestions minimal and specific
- Don't over-edit or sanitize emotions
- Focus on moments that could be clearer or more impactful
- Respect the 90-second audio constraint`
        }
      ]
    });

    const responseText = completion.content[0].type === 'text' 
      ? completion.content[0].text 
      : '';
    
    // Parse the JSON response
    try {
      const parsed = JSON.parse(responseText);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({ suggestions: [] });
    }

  } catch (error) {
    console.error('AI refinement error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}