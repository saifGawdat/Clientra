import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined")
  }

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({ connectionString })
  }

  const adapter = new PrismaPg(globalForPrisma.pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Always persist — prevents new Pool + PrismaClient on every cold-start invocation
globalForPrisma.prisma = prisma
