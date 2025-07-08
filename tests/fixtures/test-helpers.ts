import { NextRequest } from 'next/server';

/**
 * Creates a mock NextRequest for API testing
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = 'GET', body, headers = {} } = options;
  
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return request;
}

/**
 * Mock user data for testing
 */
export const mockUsers = {
  authenticated: {
    id: 'user-123',
    username: 'test_user_1234',
    passwordHash: '$2a$10$YourHashedPasswordHere',
    hasCompletedOnboarding: true,
    isRestricted: false,
    createdAt: new Date('2024-01-01'),
    lastActive: new Date(),
  },
  newUser: {
    id: 'user-456',
    username: 'new_user_5678',
    passwordHash: '$2a$10$YourHashedPasswordHere',
    hasCompletedOnboarding: false,
    isRestricted: false,
    createdAt: new Date(),
    lastActive: new Date(),
  },
};

/**
 * Mock story data for testing
 */
export const mockStories = {
  approved: {
    id: 'story-123',
    userId: 'user-123',
    contentText: 'This is my story of finding acceptance.',
    contentSanitized: 'This is my story of finding acceptance.',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    audioUrl: 'https://storage.example.com/audio/story-123.mp3',
    status: 'APPROVED',
    sentimentFlags: {
      hasCrisisContent: false,
      riskLevel: 'none',
      categories: ['none'],
    },
    flaggedHighRisk: false,
    flaggedCrisis: false,
    flaggedPositive: true,
    color: '#FF6B6B',
    createdAt: new Date('2024-01-15'),
    approvedAt: new Date('2024-01-16'),
  },
  pending: {
    id: 'story-456',
    userId: 'user-456',
    contentText: 'A story waiting for moderation.',
    contentSanitized: 'A story waiting for moderation.',
    voiceId: 'MF3mGyEYCl7XYWbV9V6O',
    audioUrl: null,
    status: 'PENDING',
    sentimentFlags: {},
    flaggedHighRisk: false,
    flaggedCrisis: false,
    flaggedPositive: false,
    color: '#4ECDC4',
    createdAt: new Date(),
    approvedAt: null,
  },
};

/**
 * Mock JWT token for testing
 */
export const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsInVzZXJuYW1lIjoidGVzdF91c2VyXzEyMzQiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDYwNDgwMH0.mockSignature';

/**
 * Mock Turnstile token for testing
 */
export const mockTurnstileToken = 'test-turnstile-token-12345';

/**
 * Sets up common mocks for tests
 */
export function setupCommonMocks() {
  // Mock environment variables
  process.env.JWT_SECRET = 'test-secret';
  process.env.TURNSTILE_SECRET_KEY = 'test-turnstile-secret';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
  
  // Mock console methods to reduce noise
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
}

/**
 * Cleans up mocks after tests
 */
export function cleanupMocks() {
  jest.restoreAllMocks();
}