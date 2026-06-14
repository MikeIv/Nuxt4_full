const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

/** ISO / Date → «14.06.2026, 14:00:27» (ru-RU, локальная TZ) */
export function formatDateTime(value: string | Date | undefined | null): string {
  if (!value) {
    return '—'
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return dateTimeFormatter.format(date)
}
