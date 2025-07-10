// Shared constants used across the monorepo

export const APP_NAME = 'Survival Pending';

export const STORY_LIMITS = {
  MAX_CHARACTERS: 1000,
  MIN_CHARACTERS: 50,
  AUDIO_DURATION_SECONDS: 90,
} as const;

export const AUTH = {
  TOKEN_EXPIRY: '7d',
  USERNAME_PATTERN: /^[a-z]+_[a-z]+_\d{4}$/,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
  },
  STORY: {
    SUBMIT: '/api/story/submit',
    LIST: '/api/stories',
    GET: (id: string) => `/api/stories/${id}`,
  },
  VOICE: {
    PREVIEW: '/api/voice/preview',
    GENERATE: '/api/voice/generate',
  },
} as const;

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  INVALID_CREDENTIALS: 'Invalid username or password.',
  STORY_TOO_SHORT: `Story must be at least ${STORY_LIMITS.MIN_CHARACTERS} characters.`,
  STORY_TOO_LONG: `Story must be under ${STORY_LIMITS.MAX_CHARACTERS} characters.`,
} as const;