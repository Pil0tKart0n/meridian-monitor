/**
 * Database client placeholder.
 *
 * Prisma will be initialized once a DATABASE_URL is configured.
 * Run `npx prisma generate` after setting up the database.
 *
 * For MVP, the app runs in demo mode with API-provided data.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

try {
  // Dynamic import to avoid build errors before prisma generate
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = globalThis as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma: any | undefined;
  };
  db = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
  }
} catch {
  // Prisma not generated yet — running in demo mode
  console.warn("[DB] Prisma client not available. Running in demo mode.");
}

export { db };
