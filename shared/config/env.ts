// shared/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),

  // Better Auth
  AUTH_SECRET: z.string().min(20),
  NUXT_BETTER_AUTH_SECRET: z.string().min(20).optional(),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Nuxt public vars
  NUXT_PUBLIC_API_BASE: z.string().default(''),
  NUXT_PUBLIC_APP_NAME: z.string().default(''),
  NUXT_PUBLIC_DEBUG: z.string().default('false'),

  // Другие часто используемые
  PORT: z.string().optional(),
  NITRO_PORT: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Ошибка валидации .env:')
  console.dir(parsed.error.format(), { depth: null })
  throw new Error('Invalid environment variables. Check .env file.')
}

export const env = parsed.data
export type Env = z.infer<typeof envSchema>
