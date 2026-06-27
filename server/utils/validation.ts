import type { z } from 'zod'
import type { H3Event } from 'h3'

/**
 * Валидация тела запроса (рекомендуется использовать)
 */
export async function validateBody<T extends z.ZodTypeAny>(
  event: H3Event,
  schema: T,
): Promise<z.infer<T>> {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: {
        issues: result.error.issues,
        formatted: result.error.format(),
        message: result.error.issues.map((i) => i.message).join(', '),
      },
    })
  }

  return result.data
}

/**
 * Валидация query параметров
 */
export async function validateQuery<T extends z.ZodTypeAny>(
  event: H3Event,
  schema: T,
): Promise<z.infer<T>> {
  const query = getQuery(event)
  const result = schema.safeParse(query)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: {
        issues: result.error.issues,
        formatted: result.error.format(),
      },
    })
  }

  return result.data
}
