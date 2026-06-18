import type { AuthUser } from '#nuxt-better-auth'
import type { H3Event } from 'h3'

export function requireAuthUser(event: H3Event): AuthUser {
  const user = event.context.user

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return user
}
