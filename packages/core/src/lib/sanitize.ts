export function sanitizeForLogging(input: unknown): string {
  const str = typeof input === 'string' ? input : String(input);
  return str.replace(/[^\w\s]/gi, '').slice(0, 100);
}