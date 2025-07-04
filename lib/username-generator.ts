import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Word lists for offline fallback
const adjectives = [
  'brave', 'gentle', 'fierce', 'quiet', 'bold', 'tender', 'strong', 'subtle',
  'vibrant', 'serene', 'radiant', 'resilient', 'spirited', 'thoughtful',
  'creative', 'authentic', 'hopeful', 'determined', 'graceful', 'fearless',
  'compassionate', 'intuitive', 'adventurous', 'wise', 'playful', 'sincere',
  'curious', 'patient', 'loyal', 'witty', 'charming', 'humble', 'ambitious',
  'diligent', 'empathetic', 'generous', 'honest', 'imaginative', 'joyful'
];

const nouns = [
  'phoenix', 'river', 'mountain', 'forest', 'ocean', 'star', 'moon', 'sun',
  'eagle', 'wolf', 'deer', 'butterfly', 'dragonfly', 'raven', 'sparrow',
  'oak', 'willow', 'cedar', 'rose', 'lily', 'dahlia', 'iris', 'lotus',
  'storm', 'breeze', 'thunder', 'lightning', 'rain', 'snow', 'aurora',
  'crystal', 'diamond', 'sapphire', 'ember', 'flame', 'spark', 'light',
  'dawn', 'dusk', 'twilight', 'horizon', 'journey', 'path', 'bridge'
];

export async function generateUsername(): Promise<string> {
  try {
    // Try using Groq for more creative combinations
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Generate a single username in the format 'adjective_noun' (lowercase, underscore separated). Use positive, nature-inspired, or empowering words. Examples: brave_phoenix, gentle_river, fierce_mountain. Return ONLY the username, nothing else."
        },
        {
          role: "user",
          content: "Generate one username"
        }
      ],
      model: "llama-3.3-70b-specdec",
      temperature: 0.9,
      max_tokens: 20,
    });

    const username = completion.choices[0]?.message?.content?.trim().toLowerCase();
    
    // Validate format
    if (username && /^[a-z]+_[a-z]+$/.test(username)) {
      return username;
    }
    
    // Fallback to local generation if Groq fails or returns invalid format
    throw new Error('Invalid format from Groq');
    
  } catch (error) {
    // Fallback to local generation
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective}_${noun}`;
  }
}

export async function generateMultipleUsernames(count: number = 5): Promise<string[]> {
  const usernames = new Set<string>();
  
  // Generate more than requested to account for duplicates
  while (usernames.size < count) {
    const username = await generateUsername();
    usernames.add(username);
  }
  
  return Array.from(usernames).slice(0, count);
}