import type { PrismaClient } from '@prisma/client'

// Workaround for ESM/CJS interop + pnpm (named exports) in Nitro server utils.
const [{ PrismaClient: PrismaClientCtor }, { PrismaPg }, { Pool }] = await Promise.all([
  import('@prisma/client'),
  import('@prisma/adapter-pg'),
  import('pg'),
] as const)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Private DATABASE_URL via runtimeConfig (falls back to process.env).
// Satisfies the requirement: secret only on server, via Nuxt runtimeConfig.
const runtimeConfig = useRuntimeConfig() as unknown as { databaseUrl?: string }
const databaseUrl = runtimeConfig.databaseUrl || process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    '[prisma] DATABASE_URL не задан. Заполни .env (см. .env.example) или private runtimeConfig.databaseUrl.',
  )
}

// Prisma 7 "client" engine (Query Compiler) requires an adapter for direct Postgres connections.
// We create a pg Pool + PrismaPg adapter and pass { adapter } to the constructor.
const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientCtor({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
