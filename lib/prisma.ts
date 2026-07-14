import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL || "";

// Convert mysql:// protocol to mariadb:// for compatibility with the mariadb pool
let cleanConnectionString = connectionString.startsWith("mysql://")
  ? connectionString.replace("mysql://", "mariadb://")
  : connectionString;

if (cleanConnectionString) {
  cleanConnectionString += cleanConnectionString.includes("?")
    ? "&connectTimeout=5000&acquireTimeout=8000"
    : "?connectTimeout=5000&acquireTimeout=8000";
}

const adapter = new PrismaMariaDb(cleanConnectionString);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Remote DB latency: accounting transactions run several sequential
    // queries, so the default 5s interactive-transaction timeout is too tight
    transactionOptions: { timeout: 30000, maxWait: 10000 },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
