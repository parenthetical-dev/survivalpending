// Simple in-memory rate limiter for development
// In production, use Upstash Redis for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  async check(identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const entry = this.limits.get(identifier);
    
    if (!entry || now > entry.resetTime) {
      // New window
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      
      return {
        success: true,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
      };
    }
    
    if (entry.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        reset: entry.resetTime,
      };
    }
    
    // Increment count
    entry.count++;
    
    return {
      success: true,
      remaining: this.maxRequests - entry.count,
      reset: entry.resetTime,
    };
  }
  
  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime + this.windowMs) {
        this.limits.delete(key);
      }
    }
  }
}

// Rate limiters for different endpoints
export const voicePreviewLimiter = new InMemoryRateLimiter(
  10, // 10 requests
  60 * 1000 // per minute
);

export const voiceGenerateLimiter = new InMemoryRateLimiter(
  5, // 5 requests
  60 * 1000 // per minute
);

// Cleanup old entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    voicePreviewLimiter.cleanup();
    voiceGenerateLimiter.cleanup();
  }, 5 * 60 * 1000);
}