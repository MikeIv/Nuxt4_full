import { readBody, type H3Event } from 'h3'

export async function requireBody<T>(event: H3Event): Promise<T> {
  const body = await readBody<T>(event)

  if (body == null) {
    throw createError({ statusCode: 400, statusMessage: 'Request body is required' })
  }

  return body as T
}
