import type { H3Event } from 'h3'
import { readBody } from 'h3'
import type { HealthPostBody, HealthPostResponse, HealthResponse } from '#shared/types/health'

/**
 * Возвращает полный HealthResponse
 * Вся логика здесь — handler остаётся максимально тонким
 */
export function getHealthPayload(): HealthResponse {
  const config = useServerRuntimeConfig()

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.public.appVersion,
    appName: config.public.appName,
    uptime: process.uptime(),
  }
}

/** Безопасное чтение JSON-тела POST /api/health */
export async function readHealthPostBody(event: H3Event): Promise<HealthPostBody> {
  try {
    return (await readBody<HealthPostBody>(event)) ?? {}
  } catch {
    return {}
  }
}

/** Health + received + echo для учебного POST */
export function buildHealthPostResponse(body: HealthPostBody): HealthPostResponse {
  return {
    ...getHealthPayload(),
    received: true,
    echo: body,
  }
}
