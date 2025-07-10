/**
 * Security utility functions for input sanitization
 */

/**
 * Sanitizes a string for safe logging by removing newlines and control characters
 * This prevents log injection attacks (CWE-117)
 * 
 * @param input - The string to sanitize
 * @param maxLength - Maximum length of the output (default: 1000)
 * @returns Sanitized string safe for logging
 */
export function sanitizeForLogging(input: unknown, maxLength = 1000): string {
  // Handle non-string inputs
  if (typeof input !== 'string') {
    if (input === null || input === undefined) {
      return '[null]';
    }
    // Convert to string but limit object/array representations
    try {
      input = JSON.stringify(input);
    } catch {
      return '[non-serializable]';
    }
  }

  // Remove newlines, carriage returns, and other control characters
  let sanitized = (input as string)
    .replace(/[\r\n\t]/g, ' ') // Replace newlines and tabs with spaces
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .trim();

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength - 3) + '...';
  }

  return sanitized;
}

/**
 * Sanitizes an object for logging by sanitizing all string values
 * 
 * @param obj - The object to sanitize
 * @param maxDepth - Maximum depth to traverse (default: 3)
 * @returns Sanitized object safe for logging
 */
export function sanitizeObjectForLogging(obj: unknown, maxDepth = 3): unknown {
  if (maxDepth <= 0 || obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeForLogging(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectForLogging(item, maxDepth - 1));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize the key as well
      const sanitizedKey = sanitizeForLogging(key, 100);
      sanitized[sanitizedKey] = sanitizeObjectForLogging(value, maxDepth - 1);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Creates a safe log message from user input
 * 
 * @param prefix - Log message prefix
 * @param userInput - User-provided input to log
 * @returns Safe log message
 */
export function createSafeLogMessage(prefix: string, userInput: unknown): string {
  const sanitizedInput = typeof userInput === 'object' 
    ? JSON.stringify(sanitizeObjectForLogging(userInput))
    : sanitizeForLogging(userInput);
    
  return `${prefix}: ${sanitizedInput}`;
}