import type {
  NotesAccessActionResponse,
  NotesAccessSetupBody,
  NotesAccessStatusResponse,
  NotesAccessUnlockBody,
} from '#shared/types/notesAccess'

export const useNotesAccess = () => {
  const api = useApi()
  const sessionUnlocked = useState('notes-access-session-unlocked', () => false)

  const {
    data: status,
    pending,
    refresh,
  } = useApiFetch<NotesAccessStatusResponse>('/api/notes-access/status', {
    key: 'notes-access-status',
  })

  watch(
    status,
    (value) => {
      if (value?.unlocked) {
        sessionUnlocked.value = true
      }
    },
    { immediate: true },
  )

  const refreshStatus = async () => {
    await refresh()
    sessionUnlocked.value = status.value?.unlocked ?? false
  }

  const markUnlocked = async () => {
    sessionUnlocked.value = true
    await refresh()
  }

  const setupPassword = async (body: NotesAccessSetupBody) => {
    const response = await api<NotesAccessActionResponse>('/api/notes-access/setup', {
      method: 'POST',
      body,
    })
    await markUnlocked()
    return response
  }

  const unlock = async (body: NotesAccessUnlockBody) => {
    const response = await api<NotesAccessActionResponse>('/api/notes-access/unlock', {
      method: 'POST',
      body,
    })
    await markUnlocked()
    return response
  }

  const forgotPassword = () =>
    api<{ ok: true; sent: true }>('/api/notes-access/forgot', {
      method: 'POST',
    })

  const isConfigured = computed(() => status.value?.configured ?? false)
  const isUnlocked = computed(() => sessionUnlocked.value)

  return {
    status: readonly(status),
    pending: readonly(pending),
    isConfigured,
    isUnlocked,
    refresh: refreshStatus,
    setupPassword,
    unlock,
    forgotPassword,
  }
}
