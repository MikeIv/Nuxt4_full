import type { HealthResponse } from '#shared/types/health'

export default defineEventHandler(async (): Promise<HealthResponse> => {
  return getHealthPayload()
})
