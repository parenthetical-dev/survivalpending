import { NextRequest } from 'next/server';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as signupHandler } from '@/app/api/auth/signup/route';
import * as auth from '@/lib/auth';
import * as turnstile from '@/lib/turnstile';
import prisma from '@/lib/prisma';

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/turnstile');
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully logs in with valid credentials', async () => {
    // Mock successful turnstile verification
    (turnstile.verifyTurnstileToken as jest.Mock).mockResolvedValue(true);
    
    // Mock successful authentication
    (auth.authenticateUser as jest.Mock).mockResolvedValue({
      id: '123',
      username: 'test_user_1234',
      token: 'jwt-token',
      hasCompletedOnboarding: true,
    });

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'test_user_1234',
        password: 'password123',
        turnstileToken: 'test-token',
      }),
    });

    const response = await loginHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      token: 'jwt-token',
      userId: '123',
      hasCompletedOnboarding: true,
    });
    
    // Check cookie was set
    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).toContain('token=jwt-token');
    expect(setCookieHeader).toContain('HttpOnly');
  });

  it('rejects login with invalid turnstile token', async () => {
    (turnstile.verifyTurnstileToken as jest.Mock).mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'test_user_1234',
        password: 'password123',
        turnstileToken: 'invalid-token',
      }),
    });

    const response = await loginHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Captcha verification failed' });
  });

  it('rejects login with missing fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'test_user_1234',
        // missing password and turnstileToken
      }),
    });

    const response = await loginHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Missing required fields' });
  });

  it('rejects login with invalid username format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'invalid-format',
        password: 'password123',
        turnstileToken: 'test-token',
      }),
    });

    const response = await loginHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid username format' });
  });
});

describe('/api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully creates a new user', async () => {
    (turnstile.verifyTurnstileToken as jest.Mock).mockResolvedValue(true);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (auth.createUser as jest.Mock).mockResolvedValue({
      id: '456',
      username: 'new_user_5678',
      token: 'new-jwt-token',
    });

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'new_user_5678',
        password: 'SecurePass123!',
        turnstileToken: 'test-token',
      }),
    });

    const response = await signupHandler(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({
      success: true,
      token: 'new-jwt-token',
      userId: '456',
    });
  });

  it('rejects signup if username already exists', async () => {
    (turnstile.verifyTurnstileToken as jest.Mock).mockResolvedValue(true);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'existing',
      username: 'existing_user_1234',
    });

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'existing_user_1234',
        password: 'password123',
        turnstileToken: 'test-token',
      }),
    });

    const response = await signupHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Username already taken' });
  });

  it('validates password requirements', async () => {
    (turnstile.verifyTurnstileToken as jest.Mock).mockResolvedValue(true);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'test_user_1234',
        password: 'weak', // Too short
        turnstileToken: 'test-token',
      }),
    });

    const response = await signupHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Password must be');
  });
});