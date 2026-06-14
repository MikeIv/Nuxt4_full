import type { Ref } from 'vue'
import { useAppToast } from '~/composables/useAppToast'

const DEFAULT_SUCCESS_MESSAGE = 'Скопировано в буфер обмена'
const DEFAULT_ERROR_MESSAGE = 'Не удалось скопировать'
const DEFAULT_COPIED_RESET_MS = 2000

async function writeClipboard(text: string): Promise<boolean> {
  if (import.meta.server) {
    return false
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fallback ниже
    }
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', 'true')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  } catch {
    return false
  }
}

export function useCopyToClipboard() {
  const { success, error } = useAppToast()

  const copyToClipboard = async (
    text: string,
    options?: { successMessage?: string; errorMessage?: string },
  ): Promise<boolean> => {
    const copied = await writeClipboard(text)

    if (copied) {
      success(options?.successMessage ?? DEFAULT_SUCCESS_MESSAGE)
      return true
    }

    error(options?.errorMessage ?? DEFAULT_ERROR_MESSAGE)
    return false
  }

  const copyWithFeedback = async (
    text: string,
    isCopied: Ref<boolean>,
    resetMs = DEFAULT_COPIED_RESET_MS,
    options?: { successMessage?: string; errorMessage?: string },
  ): Promise<boolean> => {
    const ok = await copyToClipboard(text, options)
    if (!ok) {
      return false
    }

    isCopied.value = true
    window.setTimeout(() => {
      isCopied.value = false
    }, resetMs)
    return true
  }

  return { copyToClipboard, copyWithFeedback }
}
