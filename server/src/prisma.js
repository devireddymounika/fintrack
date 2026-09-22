import { PrismaClient } from '@prisma/client';

// Singleton pattern: reuse the Prisma client across serverless warm invocations
// to avoid exhausting database connection limits.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
