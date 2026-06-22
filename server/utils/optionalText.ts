export function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

export function trimToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed || null
}
