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
