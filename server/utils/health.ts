import type { H3Event } from 'h3'
import { readBody } from 'h3'
import type { HealthPostBody, HealthPostResponse, HealthResponse } from '#shared/types/health'
import { prisma } from './prisma'

/**
 * Возвращает полный HealthResponse
 * Вся логика здесь — handler остаётся максимально тонким
 */
export async function getHealthPayload(): Promise<HealthResponse> {
  const config = useServerRuntimeConfig()

  await prisma.$queryRaw`SELECT 1`

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
export async function buildHealthPostResponse(body: HealthPostBody): Promise<HealthPostResponse> {
  const payload = await getHealthPayload()
  return {
    ...payload,
    received: true,
    echo: body,
  }
}
