import { z } from 'zod'

/** Zod-схема env. Валидация — lazy через getEnv() (не при import / nuxt prepare). */
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),

  AUTH_SECRET: z.string().min(20),
  NUXT_BETTER_AUTH_SECRET: z.string().min(20).optional(),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  NUXT_PUBLIC_API_BASE: z.string().default(''),
  NUXT_PUBLIC_APP_NAME: z.string().default(''),
  NUXT_PUBLIC_DEBUG: z.string().default('false'),

  PORT: z.string().optional(),
  NITRO_PORT: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | null = null

/** Fail-fast при старте Nitro (server/plugins). Не вызывать из nuxt.config.ts — postinstall/CI без .env. */
export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv
  }

  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Ошибка валидации .env:')
    console.dir(parsed.error.format(), { depth: null })
    throw new Error('Invalid environment variables. Check .env file.')
  }

  cachedEnv = parsed.data
  return cachedEnv
}
