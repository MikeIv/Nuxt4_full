import type { HealthResponse } from '#shared/types/health'

export interface HealthPostBody {
  message?: string
  test?: boolean
}

export default defineEventHandler(async (event): Promise<HealthResponse> => {
  // Читаем тело запроса
  const body = await readBody<HealthPostBody>(event)

  // Здесь можно добавить простую валидацию
  if (body.test === false) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Test mode disabled',
    })
  }

  // Возвращаем тот же health, но можем добавить данные из body
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: useRuntimeConfig().public.appVersion,
    appName: useRuntimeConfig().public.appName,
    uptime: process.uptime(),
  }
})
