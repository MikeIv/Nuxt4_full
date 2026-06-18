export function getAuthActionError(error: { message?: string } | null, fallback: string): string {
  if (!error) {
    return ''
  }

  return typeof error.message === 'string' && error.message ? error.message : fallback
}
