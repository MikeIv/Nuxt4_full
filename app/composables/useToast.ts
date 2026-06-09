export type ToastVariant = 'success' | 'error'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

const TOAST_DURATION_MS = 4000
const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function useToast() {
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
    const id = globalThis.crypto.randomUUID()
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
