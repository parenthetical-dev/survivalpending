/**
 * Input validation utilities for API security
 */

/**
 * Validates and sanitizes text content
 * @param text - Text to validate
 * @param maxLength - Maximum allowed length
 * @returns Validated text or null if invalid
 */
export function validateTextContent(text: unknown, maxLength = 1000): string | null {
  if (typeof text !== 'string') {
    return null;
  }

  // Trim whitespace
  const trimmed = text.trim();

  // Check if empty or too long
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    return null;
  }

  // Remove any null bytes or other dangerous characters
  const sanitized = trimmed
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters except \t, \n, \r

  return sanitized;
}

/**
 * Validates voice ID against allowed values
 * @param voiceId - Voice ID to validate
 * @param allowedVoices - Array of allowed voice IDs
 * @returns true if valid
 */
export function validateVoiceId(voiceId: unknown, allowedVoices: string[]): boolean {
  return typeof voiceId === 'string' && allowedVoices.includes(voiceId);
}

/**
 * Validates username format
 * @param username - Username to validate
 * @returns true if valid
 */
export function validateUsername(username: unknown): boolean {
  if (typeof username !== 'string') {
    return false;
  }
  // Format: adjective_noun_4digits
  return /^[a-z]+_[a-z]+_\d{4}$/.test(username);
}

/**
 * Validates and sanitizes JSON response from external APIs
 * @param data - Raw response data
 * @param expectedStructure - Expected structure validation function
 * @returns Validated data or null
 */
export function validateApiResponse<T>(
  data: unknown,
  expectedStructure: (data: unknown) => data is T
): T | null {
  try {
    if (expectedStructure(data)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Type guard for sentiment analysis response
 */
export function isSentimentResponse(data: unknown): data is {
  hasCrisisContent: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  categories: Array<'self-harm' | 'suicidal' | 'violence' | 'none'>;
} {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as any;

  return (
    typeof obj.hasCrisisContent === 'boolean' &&
    ['none', 'low', 'medium', 'high'].includes(obj.riskLevel) &&
    Array.isArray(obj.categories) &&
    obj.categories.every((cat: unknown) =>
      ['self-harm', 'suicidal', 'violence', 'none'].includes(cat as string)
    )
  );
}

/**
 * Type guard for categorization response
 */
export function isCategorizeResponse(data: unknown): data is {
  categories: string[];
} {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as any;

  return (
    Array.isArray(obj.categories) &&
    obj.categories.every((cat: unknown) => typeof cat === 'string')
  );
}