export type ToastVariant = 'success' | 'error'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

const TOAST_DURATION_MS = 4000
const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>()

function createToastId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Проектные toast-уведомления (не путать с @nuxt/ui useToast). */
export function useAppToast() {
  const toasts = useState<ToastItem[]>('ui-toasts', () => [])

  const dismiss = (id: string) => {
    const timer = dismissTimers.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      dismissTimers.delete(id)
    }

    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  const push = (message: string, variant: ToastVariant) => {
    const id = createToastId()
    toasts.value = [...toasts.value, { id, message, variant }]

    dismissTimers.set(
      id,
      setTimeout(() => {
        dismiss(id)
      }, TOAST_DURATION_MS),
    )
  }

  const success = (message: string) => {
    push(message, 'success')
  }

  const error = (message: string) => {
    push(message, 'error')
  }

  return {
    toasts,
    success,
    error,
    dismiss,
  }
}
