import type { H3Event } from 'h3'

const PUBLIC_API_PREFIXES = ['/api/auth', '/api/health', '/api/notes-access'] as const

function isPublicApiPath(path: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export default defineEventHandler(async (event: H3Event) => {
  const path = event.path

  if (!path.startsWith('/api/') || isPublicApiPath(path)) {
    return
  }

  const session = await requireUserSession(event)

  event.context.session = session.session
  event.context.user = session.user
})
