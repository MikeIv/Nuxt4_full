import type { H3Event } from 'h3'
import { successResponse, errorResponse, sendApiResponse } from './response'

type HandlerError = Error & {
  statusCode?: number
  statusMessage?: string
  code?: string
  data?: unknown
}

function toHandlerError(err: unknown): HandlerError {
  if (err instanceof Error) {
    return err as HandlerError
  }

  if (typeof err === 'object' && err !== null) {
    return err as HandlerError
  }

  return new Error(String(err)) as HandlerError
}

export const apiHandler = <T>(handler: (event: H3Event) => Promise<T>) => {
  return defineEventHandler(async (event: H3Event) => {
    try {
      const data = await handler(event)
      return sendApiResponse(event, successResponse(data))
    } catch (err: unknown) {
      const error = toHandlerError(err)
      const statusCode = error.statusCode ?? 500
      const message = error.statusMessage ?? error.message ?? 'Internal Server Error'

      if (import.meta.dev) {
        console.error(`[API Error ${statusCode}]:`, error)
      }

      return sendApiResponse(event, errorResponse(message, statusCode, error.code, error.data))
    }
  })
}
