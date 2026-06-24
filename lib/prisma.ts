import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/tourapprawes";

// Convert mysql:// protocol to mariadb:// for compatibility with the mariadb pool
const cleanConnectionString = connectionString.startsWith("mysql://")
  ? connectionString.replace("mysql://", "mariadb://")
  : connectionString;

const adapter = new PrismaMariaDb(cleanConnectionString);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
