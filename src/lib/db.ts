import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaReady: Promise<void> | undefined
}

/**
 * Resolves the database location for every environment:
 * - External DB URL (postgres://, mysql://, etc.) -> used as-is
 * - Absolute SQLite path (file:/...)              -> used as-is
 * - Vercel serverless                             -> ephemeral SQLite in /tmp
 *   (serverless filesystem is read-only except /tmp)
 * - Local dev / self-hosting                      -> <project root>/db/custom.db
 *   (resolved from cwd so it stays portable on any machine)
 */
function resolveDatabaseUrl(): string {
  const env = process.env.DATABASE_URL
  if (env && (env.startsWith('file:/') || !env.startsWith('file:'))) return env
  if (process.env.VERCEL === '1') return 'file:/tmp/lovelymaroon.db'
  return `file:${process.cwd()}/db/custom.db`
}

function createDb() {
  const client = new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: ['query'],
  })

  // On Vercel the ephemeral database starts empty, so make sure the
  // Rsvp table exists before the first request touches it.
  const ready =
    process.env.VERCEL === '1'
      ? client
          .$executeRawUnsafe(
            'CREATE TABLE IF NOT EXISTS "Rsvp" (' +
              '"id" TEXT PRIMARY KEY NOT NULL, ' +
              '"name" TEXT NOT NULL, ' +
              '"attendance" TEXT NOT NULL, ' +
              '"guests" INTEGER NOT NULL DEFAULT 1, ' +
              '"message" TEXT NOT NULL, ' +
              '"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)'
          )
          .then(() => undefined)
          .catch(() => undefined)
      : Promise.resolve()

  return { client, ready }
}

if (!globalForPrisma.prisma) {
  const { client, ready } = createDb()
  globalForPrisma.prisma = client
  globalForPrisma.prismaReady = ready
}

export const db = globalForPrisma.prisma as PrismaClient
export const dbReady = globalForPrisma.prismaReady ?? Promise.resolve()
