import type { ApiResponse } from '#shared/types/api'

export class ApiError extends Error {
  readonly statusCode: number
  readonly code?: string
  readonly details?: unknown

  constructor(response: ApiResponse<null>) {
    super(response.error?.message ?? 'Request failed')
    this.name = 'ApiError'
    this.statusCode = response.statusCode
    this.code = response.error?.code
    this.details = response.error?.details
  }
}

export function isApiResponse(value: unknown): value is ApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as ApiResponse).success === 'boolean' &&
    'statusCode' in value
  )
}

/** Unified `{ success, data }` → data; legacy payloads pass through unchanged. */
export function unwrapApiResponse<T>(payload: unknown): T {
  if (!isApiResponse(payload)) {
    return payload as T
  }

  if (payload.success) {
    return payload.data as T
  }

  throw new ApiError(payload as ApiResponse<null>)
}
