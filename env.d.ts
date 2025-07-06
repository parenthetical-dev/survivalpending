declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    GROQ_API_KEY: string;
    ANTHROPIC_API_KEY: string;
    ELEVENLABS_API_KEY: string;
    TURNSTILE_SECRET_KEY: string;
    JWT_SECRET: string;
    BLOB_READ_WRITE_TOKEN: string;
    META_PIXEL_ID?: string;
    META_ACCESS_TOKEN?: string;
    META_TEST_EVENT_CODE?: string;
    
    // Pirsch Analytics
    PIRSCH_ACCESS_TOKEN?: string;
    
    // Production only
    UPSTASH_REDIS_URL?: string;
    UPSTASH_REDIS_TOKEN?: string;
  }
}