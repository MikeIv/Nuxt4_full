import { ApiError } from '#shared/utils/apiError'
import type { FetchError } from 'ofetch'

interface ApiErrorPayload {
  statusMessage?: string
  message?: string
}

export function formatApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error && typeof error === 'object') {
    const fetchError = error as FetchError<ApiErrorPayload>

    if (typeof fetchError.statusMessage === 'string' && fetchError.statusMessage) {
      return fetchError.statusMessage
    }

    const data = fetchError.data
    if (data && typeof data === 'object') {
      if (typeof data.statusMessage === 'string' && data.statusMessage) {
        return data.statusMessage
      }
      if (typeof data.message === 'string' && data.message) {
        return data.message
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
