import type { AuthSession, AuthUser } from '#nuxt-better-auth'

declare module 'h3' {
  interface H3EventContext {
    session?: AuthSession
    user?: AuthUser
  }
}

export {}
