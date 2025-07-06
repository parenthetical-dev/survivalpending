import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { trackInitiateCheckout } from '@/lib/meta-capi';

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
      max_tokens: 1500,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `You are helping refine personal stories for an LGBTQ+ testimony platform. The stories will be converted to 90-second audio clips.

Analyze this story and provide TWO options:

Story:
"${content}"

Return a response in this JSON format:
{
  "refinedVersion": "A complete refined version of the story with better flow and structure (only if significant restructuring would help)",
  "suggestions": [
    {
      "type": "clarity|impact|flow",
      "original": "exact phrase that exists in the story",
      "suggested": "direct replacement phrase",
      "reason": "brief explanation"
    }
  ]
}

CRITICAL RULES:
- For "suggestions": ONLY suggest changes that work as direct find-and-replace
- The "original" must be an EXACT phrase from the story that can be found and replaced
- Do NOT suggest moving sentences or restructuring in the suggestions array
- If the story needs restructuring, provide a complete "refinedVersion" instead
- Keep the authentic voice - don't over-polish
- Respect the 90-second constraint (about 1000 characters)
- Don't sanitize emotions or difficult content
- Maximum 3-4 suggestions that work as simple replacements`
        }
      ]
    });

    const responseText = completion.content[0].type === 'text' 
      ? completion.content[0].text 
      : '';
    
    // Parse the JSON response
    try {
      // First, try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in AI response');
        return NextResponse.json({ suggestions: [] });
      }
      
      // Clean the extracted JSON to handle control characters within string values
      let cleanedJson = jsonMatch[0];
      
      // Function to properly escape control characters in JSON string values
      cleanedJson = cleanedJson.replace(/"([^"]*)"/g, (_match, p1) => {
        // Escape control characters within the string value
        const escaped = p1
          .replace(/\\/g, '\\\\') // Escape backslashes first
          .replace(/"/g, '\\"') // Escape quotes
          .replace(/\n/g, '\\n') // Escape newlines
          .replace(/\r/g, '\\r') // Escape carriage returns
          .replace(/\t/g, '\\t') // Escape tabs
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove other control characters
        return `"${escaped}"`;
      });
      
      const parsed = JSON.parse(cleanedJson);
      
      // Track that user has entered the refine stage
      await trackInitiateCheckout(request, payload.userId, 'refine');
      
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Response text:', responseText);
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