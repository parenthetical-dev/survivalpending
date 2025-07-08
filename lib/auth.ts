import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

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

export async function createUser(username: string, password: string) {
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
    },
  });

  return {
    id: user.id,
    username: user.username,
    token: generateToken(user.id),
  };
}

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || user.isBanned) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return {
    id: user.id,
    username: user.username,
    token: generateToken(user.id),
    hasCompletedOnboarding: user.hasCompletedOnboarding,
  };
}