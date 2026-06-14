import type {
  NotesDbPasswordResponse,
  NotesDbPasswordSaveResponse,
} from '#shared/types/notesAccess'
import { useAppToast } from '~/composables/useAppToast'

const DEFAULT_PASSWORD = 'НовыйСильныйПароль123!'

export function useNotesDbPassword(fallback = DEFAULT_PASSWORD) {
  const api = useApi()
  const toast = useAppToast()
  const { isUnlocked } = useNotesAccess()

  const savedPassword = useState('notes-db-password', () => fallback)
  const pending = ref(false)

  const loadFromServer = async () => {
    if (!isUnlocked.value || pending.value) {
      return
    }

    pending.value = true

    try {
      const data = await api<NotesDbPasswordResponse>('/api/notes-access/db-password')
      if (data.password) {
        savedPassword.value = data.password
      }
    } catch {
      toast.error('Не удалось загрузить пароль PostgreSQL')
    } finally {
      pending.value = false
    }
  }

  watch(
    isUnlocked,
    (unlocked) => {
      if (unlocked) {
        void loadFromServer()
      }
    },
    { immediate: true },
  )

  const persistPassword = async (value: string) => {
    const previous = savedPassword.value
    savedPassword.value = value

    if (!isUnlocked.value) {
      savedPassword.value = previous
      throw new Error('Раздел «Серверные доступы» закрыт')
    }

    try {
      await api<NotesDbPasswordSaveResponse>('/api/notes-access/db-password', {
        method: 'PUT',
        body: { password: value },
      })
    } catch (error) {
      savedPassword.value = previous
      throw error
    }
  }

  return {
    savedPassword,
    persistPassword,
    pending: readonly(pending),
  }
}
