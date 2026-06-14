import type {
  NotesAccessActionResponse,
  NotesAccessSetupBody,
  NotesAccessStatusResponse,
  NotesAccessUnlockBody,
} from '#shared/types/notesAccess'

export const useNotesAccess = () => {
  const api = useApi()

  const {
    data: status,
    pending,
    refresh,
  } = useApiFetch<NotesAccessStatusResponse>('/api/notes-access/status', {
    key: 'notes-access-status',
  })

  const setupPassword = (body: NotesAccessSetupBody) =>
    api<NotesAccessActionResponse>('/api/notes-access/setup', {
      method: 'POST',
      body,
    })

  const unlock = (body: NotesAccessUnlockBody) =>
    api<NotesAccessActionResponse>('/api/notes-access/unlock', {
      method: 'POST',
      body,
    })

  const forgotPassword = () =>
    api<{ ok: true; sent: true }>('/api/notes-access/forgot', {
      method: 'POST',
    })

  const isConfigured = computed(() => status.value?.configured ?? false)
  const isUnlocked = computed(() => status.value?.unlocked ?? false)

  return {
    status: readonly(status),
    pending: readonly(pending),
    isConfigured,
    isUnlocked,
    refresh,
    setupPassword,
    unlock,
    forgotPassword,
  }
}
