import type { Role } from '@prisma/client'
import type { AuthUser } from '#nuxt-better-auth'
import type { H3Event } from 'h3'

export async function requireRole(event: H3Event, role: Role): Promise<AuthUser> {
  const { user } = await requireUserSession(event, { user: { role } })
  return user
}
