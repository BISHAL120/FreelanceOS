import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Fallback dummy connection string for build time / mock UI mode so PrismaClient never errors on instantiation
const defaultDatasourceUrl =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/crm_dummy"

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: defaultDatasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
