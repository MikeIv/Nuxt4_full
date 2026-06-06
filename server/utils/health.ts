import type { HealthResponse } from '#shared/types/health'

/**
 * Возвращает полный HealthResponse
 * Вся логика здесь — handler остаётся максимально тонким
 */
export function getHealthPayload(): HealthResponse {
  const config = useRuntimeConfig()

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.public.appVersion,
    appName: config.public.appName,
    uptime: process.uptime(),
  }
}
