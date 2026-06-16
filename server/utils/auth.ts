import { betterAuth } from 'better-auth'
import { prismaAdapter } from '@better-auth/prisma-adapter'
import { prisma } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    requireEmailVerification: false, // позже можно включить
  },

  appName: 'Task Board',

  telemetry: {
    enabled: false,
  },

  // AUTH_SECRET из .env (private; дублируется в runtimeConfig.authSecret)
  secret: process.env.AUTH_SECRET || process.env.NUXT_BETTER_AUTH_SECRET || undefined,

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'USER',
        required: false,
      },
    },
  },

  // Дополнительные настройки (рекомендуется)
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 дней
  },

  // Позже добавим: twoFactor, organizations и т.д.
})
