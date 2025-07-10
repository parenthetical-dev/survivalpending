export function sanitizeForLogging(str: string): string {
  return str.replace(/[^\w\s]/gi, '').slice(0, 100);
}