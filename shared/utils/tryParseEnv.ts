import type { ZodObject, ZodRawShape, z } from 'zod'

import { throwZodError } from '#shared/utils/formatZodError'

const ENV_ERROR_TITLE = 'Неверные переменные окружения (.env)'
const ENV_ERROR_HINT = 'Проверьте .env и .env.example.'

/**
 * Парсит env по Zod-схеме. При ошибке — читаемое сообщение без stack (паттерн CJ / nuxt-travel-log).
 * @see https://github.com/w3cj/nuxt-travel-log/blob/main/lib/try-parse-env.ts
 */
export function tryParseEnv<T extends ZodRawShape>(
  envSchema: ZodObject<T>,
  buildEnv: Record<string, string | undefined> = process.env,
): z.infer<ZodObject<T>> {
  const result = envSchema.safeParse(buildEnv)

  if (!result.success) {
    throwZodError(result.error, ENV_ERROR_TITLE, ENV_ERROR_HINT)
  }

  return result.data
}
