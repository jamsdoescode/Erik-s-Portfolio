import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import {
  isPostgresDatabaseUrl,
  resolveDatabaseUrl,
  withPostgresSsl,
} from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const url = resolveDatabaseUrl();

  const adapter = isPostgresDatabaseUrl(url)
    ? new PrismaPg({ connectionString: withPostgresSsl(url) })
    : new PrismaBetterSqlite3({ url });

  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
