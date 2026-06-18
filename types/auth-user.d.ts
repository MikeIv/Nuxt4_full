import type { Role } from '@prisma/client'

declare module '#nuxt-better-auth' {
  interface AuthUser {
    role: Role
  }
}

export {}
