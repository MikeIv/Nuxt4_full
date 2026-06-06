// shared/types/health.ts

export interface HealthResponse {
  /** Статус здоровья сервиса */
  status: 'ok' | 'error'

  /** ISO timestamp когда был сформирован ответ */
  timestamp: string

  /** Версия приложения */
  version: string

  /** Название приложения (для удобства) */
  appName?: string

  /** Uptime сервера в секундах */
  uptime?: number
}

/** Тело учебного POST /api/health */
export interface HealthPostBody {
  message?: string
  /** false → handler вернёт 400 (демо createError) */
  test?: boolean
  ping?: number
}

/** POST /api/health: health + подтверждение и echo принятого тела */
export type HealthPostResponse = HealthResponse & {
  received: true
  echo: HealthPostBody
}
