export const voiceGenerateLimiter = {
  removeTokens: async (tokens: number) => ({ success: true }),
  check: async (userId: string) => ({ 
    success: true, 
    reset: Date.now() + 60000 
  })
};