import { defineServerAuth } from '@onmax/nuxt-better-auth/config'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './utils/prisma'

export default defineServerAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },

  appName: 'Task Board',

  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://0.0.0.0:3000'],

  telemetry: {
    enabled: false,
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'USER',
        required: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
  },
})
