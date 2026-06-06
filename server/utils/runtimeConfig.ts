import type { H3Event } from 'h3'

/**
 * runtimeConfig в server-контексте (public + private).
 * Не вызывать из app/pages — там доступен только public.*.
 */
export function useServerRuntimeConfig(event?: H3Event) {
  return event ? useRuntimeConfig(event) : useRuntimeConfig()
}

/**
 * Учебная проверка private-ключа (нед. 1). Секрет не логируем и не отдаём в API.
 */
export function warnIfExampleSecretMissing(event?: H3Event): void {
  if (!import.meta.dev) {
    return
  }

  const { exampleSecret } = useServerRuntimeConfig(event)

  if (!exampleSecret) {
    console.warn('[runtimeConfig] NUXT_EXAMPLE_SECRET не задан — private exampleSecret пустой')
  }
}
