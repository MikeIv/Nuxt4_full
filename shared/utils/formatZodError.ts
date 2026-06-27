import type { ZodError } from 'zod'

/** Человекочитаемый список issues: `• field — сообщение`. */
export function formatZodError(error: ZodError, title = 'Ошибка валидации', hint?: string): string {
  const lines = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
    return `  • ${path} — ${issue.message}`
  })

  const parts = [`❌ ${title}:`, '', ...lines]
  if (hint) {
    parts.push('', hint)
  }

  return parts.join('\n')
}

/** Бросает Error без stack — удобно при fail-fast старте (env, boot). */
export function throwZodError(error: ZodError, title?: string, hint?: string): never {
  const e = new Error(formatZodError(error, title, hint))
  e.stack = ''
  throw e
}
