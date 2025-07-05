import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const STORY_CATEGORIES = [
  'Coming Out',
  'Identity',
  'Family',
  'Relationships',
  'Discrimination',
  'Healthcare',
  'Work/School',
  'Community',
  'Resilience',
  'Support'
];

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const prompt = `You are an AI assistant helping to categorize LGBTQ+ stories for a digital archive. Please analyze the following story and determine which categories apply from this list:

${STORY_CATEGORIES.join(', ')}

Story content:
"${content}"

Please respond with ONLY a JSON array of the categories that apply. Choose 1-3 most relevant categories. For example: ["Coming Out", "Family"] or ["Discrimination", "Work/School", "Resilience"]

Categories:`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    // Parse the JSON response
    let categories: string[];
    try {
      categories = JSON.parse(textContent.text.trim());
    } catch (parseError) {
      // If JSON parsing fails, try to extract categories from the response
      const categoryMatches = STORY_CATEGORIES.filter(cat => 
        textContent.text.toLowerCase().includes(cat.toLowerCase())
      );
      categories = categoryMatches.slice(0, 3); // Limit to 3 categories
    }

    // Validate categories
    const validCategories = categories.filter(cat => STORY_CATEGORIES.includes(cat));

    return NextResponse.json({ 
      categories: validCategories.length > 0 ? validCategories : ['Identity'] // Default fallback
    });

  } catch (error) {
    console.error('Error categorizing story:', error);
    return NextResponse.json(
      { error: 'Failed to categorize story', categories: ['Identity'] }, 
      { status: 500 }
    );
  }
}