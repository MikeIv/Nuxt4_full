import { Prisma } from '@prisma/client'
import type { H3Error } from 'h3'
import { sendError } from 'h3'
import { ZodError } from 'zod'

import { errorResponse, sendApiResponse } from './utils/response'

type MappedError = {
  message: string
  statusCode: number
  code?: string
  details?: unknown
}

function isH3Error(error: unknown): error is H3Error {
  return typeof error === 'object' && error !== null && 'statusCode' in error
}

function mapNitroError(error: unknown): MappedError {
  if (error instanceof ZodError) {
    return {
      message: 'Validation Error',
      statusCode: 400,
      details: { issues: error.issues },
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return { message: 'Not found', statusCode: 404, code: error.code }
    }
    if (error.code === 'P2002') {
      return { message: 'Conflict', statusCode: 409, code: error.code }
    }
  }

  if (isH3Error(error)) {
    return {
      message: error.statusMessage ?? error.message ?? 'Error',
      statusCode: error.statusCode ?? 500,
      details: error.data,
    }
  }

  if (error instanceof Error) {
    return {
      message: import.meta.dev ? error.message : 'Internal Server Error',
      statusCode: 500,
    }
  }

  return { message: 'Internal Server Error', statusCode: 500 }
}

function shouldUseUnifiedApiError(path: string): boolean {
  return path.startsWith('/api/') && !path.startsWith('/api/auth')
}

export default defineNitroErrorHandler((error, event) => {
  if (!shouldUseUnifiedApiError(event.path)) {
    sendError(event, error as H3Error)
    return
  }

  const mapped = mapNitroError(error)

  if (import.meta.dev) {
    console.error(`[nitro:error] ${mapped.statusCode} ${event.path}`, error)
  }

  sendApiResponse(
    event,
    errorResponse(mapped.message, mapped.statusCode, mapped.code, mapped.details),
  )
})
