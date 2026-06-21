import type { H3Event } from 'h3'
import type { ApiResponse } from '#shared/types/api'

export function successResponse<T>(data: T, statusCode = 200): ApiResponse<T> {
  return { success: true, data, statusCode }
}

export function errorResponse(
  message: string,
  statusCode = 400,
  code?: string,
  details?: unknown,
): ApiResponse<null> {
  return {
    success: false,
    error: { message, code, details },
    statusCode,
  }
}

export function sendApiResponse<T>(event: H3Event, response: ApiResponse<T>) {
  setResponseStatus(event, response.statusCode)
  return response
}
