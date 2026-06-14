import type { H3Event } from 'h3'
import { readBody } from 'h3'
import { Prisma } from '@prisma/client'
import type { HealthPostBody, HealthPostResponse, HealthResponse } from '#shared/types/health'
import { prisma } from './prisma'

function isDatabaseAuthError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P1000' ||
      error.code === 'P2010' ||
      error.message.includes('28P01') ||
      error.message.includes('authentication failed'))
  )
}

/**
 * Возвращает полный HealthResponse
 * Вся логика здесь — handler остаётся максимально тонким
 */
export async function getHealthPayload(): Promise<HealthResponse> {
  const config = useServerRuntimeConfig()

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: isDatabaseAuthError(error)
        ? 'Database authentication failed — проверьте пароль в DATABASE_URL (.env)'
        : 'Database unavailable',
    })
  }

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
