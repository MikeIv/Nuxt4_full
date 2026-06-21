/**
 * Общие HTTP-типы без доменной логики. Контракт unified API — нед. 5+.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export type UnknownJson = Record<string, unknown>

/** Unified API envelope: server (response.ts) и client (useApi, день 5). */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
  statusCode: number
}
