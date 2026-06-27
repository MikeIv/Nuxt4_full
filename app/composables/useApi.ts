import { joinApiUrl, normalizeApiBaseUrl } from '#shared/utils/normalizeApiBaseUrl'
import { ApiError, isApiResponse, unwrapApiResponse } from '#shared/utils/apiError'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import type { FetchError } from 'ofetch'

function throwIfApiErrorBody(body: unknown): void {
  if (isApiResponse(body) && !body.success) {
    throw new ApiError(body as ApiResponse<null>)
  }
}

/**
 * Императивный HTTP-клиент (`ofetch`) с `baseURL` из `runtimeConfig.public.apiBase`.
 * Unified API (`{ success, data }`) разворачивается в `data`; при `success: false` — `ApiError`.
 */
export function useApi() {
  const baseURL = normalizeApiBaseUrl(useRuntimeConfig().public.apiBase)

  return $fetch.create({
    baseURL,
    credentials: 'include',
    onResponse({ response }) {
      response._data = unwrapApiResponse(response._data)
    },
    onResponseError(ctx) {
      throwIfApiErrorBody(ctx.response._data)

      if (import.meta.dev) {
        console.error('[useApi]', String(ctx.request), ctx.response.status, ctx.response._data)
      }
    },
  })
}

/**
 * Реактивный `useFetch` к тому же API, что и {@link useApi}: URL собирается из `apiBase` + путь.
 * Unified API разворачивается автоматически; legacy `{ data }` envelopes — без изменений.
 */
export function useApiFetch<T = unknown>(
  path: MaybeRefOrGetter<string>,
  options?: Omit<UseFetchOptions<unknown>, 'baseURL'>,
): AsyncData<T, FetchError | null> {
  const config = useRuntimeConfig()
  const { transform: userTransform, ...rest } = options ?? {}

  const request = computed(() => joinApiUrl(config.public.apiBase, String(toValue(path))))

  return useFetch(request, {
    credentials: 'include',
    ...rest,
    transform: (raw: unknown) => {
      const unwrapped = unwrapApiResponse<unknown>(raw)
      return userTransform ? userTransform(unwrapped) : (unwrapped as T)
    },
  }) as AsyncData<T, FetchError | null>
}
