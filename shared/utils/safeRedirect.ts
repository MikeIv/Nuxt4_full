/** Безопасный post-login redirect — только same-origin относительные пути. */
export function getSafeRedirectPath(value: unknown, fallback = '/tasks'): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return fallback
  }

  return value
}
