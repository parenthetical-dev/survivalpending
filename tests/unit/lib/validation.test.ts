import { describe, it, expect } from '@jest/globals';
import {
  validateTextContent,
  validateVoiceId,
  validateUsername,
  validateApiResponse,
  isSentimentResponse,
  isCategorizeResponse,
} from '@/lib/validation';
import { ALLOWED_VOICE_IDS } from '@/lib/voice-generation';

describe('validateTextContent', () => {
  it('should return sanitized text for valid input', () => {
    const result = validateTextContent('This is a valid story content.');
    expect(result).toBe('This is a valid story content.');
  });

  it('should return null for empty text', () => {
    const result = validateTextContent('');
    expect(result).toBeNull();
  });

  it('should return null for whitespace-only text', () => {
    const result = validateTextContent('   \n\t   ');
    expect(result).toBeNull();
  });

  it('should return null for text exceeding max length', () => {
    const longText = 'a'.repeat(1001);
    const result = validateTextContent(longText);
    expect(result).toBeNull();
  });

  it('should handle text at exact max length', () => {
    const maxText = 'a'.repeat(1000);
    const result = validateTextContent(maxText);
    expect(result).toBe(maxText);
  });

  it('should handle null and undefined', () => {
    expect(validateTextContent(null)).toBeNull();
    expect(validateTextContent(undefined)).toBeNull();
  });

  it('should remove control characters', () => {
    const textWithControlChars = 'Hello\x00World\x01Test\x1F';
    const result = validateTextContent(textWithControlChars);
    expect(result).toBe('HelloWorldTest');
  });

  it('should preserve newlines, tabs, and carriage returns', () => {
    const textWithWhitespace = 'Line 1\nLine 2\tTabbed\rCarriage';
    const result = validateTextContent(textWithWhitespace);
    expect(result).toBe('Line 1\nLine 2\tTabbed\rCarriage');
  });

  it('should respect custom max length', () => {
    const text = 'a'.repeat(50);
    expect(validateTextContent(text, 100)).toBe(text);
    expect(validateTextContent(text, 30)).toBeNull();
  });
});

describe('validateVoiceId', () => {
  it('should return true for allowed voice IDs', () => {
    ALLOWED_VOICE_IDS.forEach(voiceId => {
      const result = validateVoiceId(voiceId, ALLOWED_VOICE_IDS);
      expect(result).toBe(true);
    });
  });

  it('should return false for invalid voice ID', () => {
    const result = validateVoiceId('InvalidVoiceId123', ALLOWED_VOICE_IDS);
    expect(result).toBe(false);
  });

  it('should return false for empty voice ID', () => {
    const result = validateVoiceId('', ALLOWED_VOICE_IDS);
    expect(result).toBe(false);
  });

  it('should handle null and undefined', () => {
    expect(validateVoiceId(null, ALLOWED_VOICE_IDS)).toBe(false);
    expect(validateVoiceId(undefined, ALLOWED_VOICE_IDS)).toBe(false);
  });

  it('should handle non-string types', () => {
    expect(validateVoiceId(123, ALLOWED_VOICE_IDS)).toBe(false);
    expect(validateVoiceId({}, ALLOWED_VOICE_IDS)).toBe(false);
    expect(validateVoiceId([], ALLOWED_VOICE_IDS)).toBe(false);
  });
});

describe('validateUsername', () => {
  it('should return true for valid usernames', () => {
    const validUsernames = [
      'creative_thunder_6301',
      'happy_mountain_1234',
      'swift_river_9999',
      'bold_eagle_0001'
    ];

    validUsernames.forEach(username => {
      const result = validateUsername(username);
      expect(result).toBe(true);
    });
  });

  it('should return false for invalid username format', () => {
    const invalidUsernames = [
      'creativethunder6301',  // missing underscores
      'creative_thunder',     // missing number
      'creative_thunder_',    // incomplete
      'Creative_Thunder_6301', // uppercase
      'creative_thunder_12345', // too many digits
      'creative_thunder_abc1', // non-numeric suffix
      '123_456_789',         // all numbers
      '_word_1234',          // starts with underscore
      'word__word_1234',     // double underscore
      'word_word_word_1234', // too many parts
    ];

    invalidUsernames.forEach(username => {
      const result = validateUsername(username);
      expect(result).toBe(false);
    });
  });

  it('should return false for empty username', () => {
    const result = validateUsername('');
    expect(result).toBe(false);
  });

  it('should handle non-string types', () => {
    expect(validateUsername(null)).toBe(false);
    expect(validateUsername(undefined)).toBe(false);
    expect(validateUsername(123)).toBe(false);
    expect(validateUsername({})).toBe(false);
  });
});

describe('validateApiResponse', () => {
  const isValidUser = (data: unknown): data is { id: string; name: string } => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      'name' in data &&
      typeof (data as any).id === 'string' &&
      typeof (data as any).name === 'string'
    );
  };

  it('should return data for valid structure', () => {
    const validData = { id: '123', name: 'John' };
    const result = validateApiResponse(validData, isValidUser);
    expect(result).toEqual(validData);
  });

  it('should return null for invalid structure', () => {
    const invalidData = { id: 123, name: 'John' }; // id should be string
    const result = validateApiResponse(invalidData, isValidUser);
    expect(result).toBeNull();
  });

  it('should handle null and undefined', () => {
    expect(validateApiResponse(null, isValidUser)).toBeNull();
    expect(validateApiResponse(undefined, isValidUser)).toBeNull();
  });

  it('should handle validator throwing error', () => {
    const throwingValidator = (data: unknown): data is any => {
      throw new Error('Validator error');
    };
    expect(validateApiResponse({}, throwingValidator)).toBeNull();
  });
});

describe('isSentimentResponse', () => {
  it('should return true for valid sentiment response', () => {
    const validResponse = {
      hasCrisisContent: false,
      riskLevel: 'low',
      categories: ['none']
    };
    expect(isSentimentResponse(validResponse)).toBe(true);
  });

  it('should validate all risk levels', () => {
    const riskLevels = ['none', 'low', 'medium', 'high'] as const;
    riskLevels.forEach(level => {
      const response = {
        hasCrisisContent: level !== 'none',
        riskLevel: level,
        categories: ['none']
      };
      expect(isSentimentResponse(response)).toBe(true);
    });
  });

  it('should validate all category types', () => {
    const categories = ['self-harm', 'suicidal', 'violence', 'none'] as const;
    categories.forEach(category => {
      const response = {
        hasCrisisContent: category !== 'none',
        riskLevel: 'medium',
        categories: [category]
      };
      expect(isSentimentResponse(response)).toBe(true);
    });
  });

  it('should return false for invalid structures', () => {
    expect(isSentimentResponse(null)).toBe(false);
    expect(isSentimentResponse(undefined)).toBe(false);
    expect(isSentimentResponse({})).toBe(false);
    expect(isSentimentResponse({ hasCrisisContent: true })).toBe(false);
    expect(isSentimentResponse({
      hasCrisisContent: 'true', // should be boolean
      riskLevel: 'low',
      categories: ['none']
    })).toBe(false);
    expect(isSentimentResponse({
      hasCrisisContent: true,
      riskLevel: 'invalid', // invalid risk level
      categories: ['none']
    })).toBe(false);
    expect(isSentimentResponse({
      hasCrisisContent: true,
      riskLevel: 'high',
      categories: ['invalid'] // invalid category
    })).toBe(false);
  });
});

describe('isCategorizeResponse', () => {
  it('should return true for valid categorize response', () => {
    const validResponse = {
      categories: ['identity', 'discrimination']
    };
    expect(isCategorizeResponse(validResponse)).toBe(true);
  });

  it('should return true for empty categories', () => {
    const response = { categories: [] };
    expect(isCategorizeResponse(response)).toBe(true);
  });

  it('should return false for invalid structures', () => {
    expect(isCategorizeResponse(null)).toBe(false);
    expect(isCategorizeResponse(undefined)).toBe(false);
    expect(isCategorizeResponse({})).toBe(false);
    expect(isCategorizeResponse({ categories: 'not-array' })).toBe(false);
    expect(isCategorizeResponse({ categories: [123] })).toBe(false); // non-string elements
    expect(isCategorizeResponse({ categories: ['valid', 123] })).toBe(false); // mixed types
  });
});