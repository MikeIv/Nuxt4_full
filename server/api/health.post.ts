import type { HealthPostResponse } from '#shared/types/health'

export default defineEventHandler(async (event): Promise<HealthPostResponse> => {
  const body = await readHealthPostBody(event)

  if (body.test === false) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Test mode is disabled',
    })
  }

  return buildHealthPostResponse(body)
})
