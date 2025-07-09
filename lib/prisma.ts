import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // Log database URL in test/development for debugging
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      const urlParts = dbUrl.match(/^postgresql:\/\/([^:]+):/);
      const username = urlParts ? urlParts[1] : 'unknown';
      console.log(`[Prisma] Connecting with user: ${username}`);
    }
  }
  
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;