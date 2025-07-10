import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'development-secret';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'user' },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

export function verifyToken(token: string): { userId: string; type: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
  } catch {
    return null;
  }
}

// These interfaces define the shape of user data expected by auth functions
export interface UserData {
  id: string;
  username: string;
  passwordHash: string;
  isBanned?: boolean;
  hasCompletedOnboarding?: boolean;
}

export interface AuthResult {
  id: string;
  username: string;
  token: string;
  hasCompletedOnboarding?: boolean;
}

// Core authentication logic without database dependencies
export async function prepareUserData(username: string, password: string) {
  const passwordHash = await hashPassword(password);
  return { username, passwordHash };
}

export async function validateUserCredentials(
  user: UserData | null,
  password: string
): Promise<AuthResult | null> {
  if (!user || user.isBanned) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    token: generateToken(user.id),
    hasCompletedOnboarding: user.hasCompletedOnboarding,
  };
}