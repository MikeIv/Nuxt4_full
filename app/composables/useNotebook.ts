import type {
  CreateNotebookEntryInput,
  NotebookEntry,
  UpdateNotebookEntryInput,
} from '#shared/types/notebook'

type NotebookEntryEnvelope = { data: NotebookEntry }
type NotebookEntriesEnvelope = { data: NotebookEntry[] }

const OPTIMISTIC_ID_PREFIX = 'optimistic:'

const createOptimisticEntry = (input: CreateNotebookEntryInput): NotebookEntry => {
  const now = new Date().toISOString()

  return {
    id: `${OPTIMISTIC_ID_PREFIX}${globalThis.crypto.randomUUID()}`,
    title: input.title,
    description: input.description ?? null,
    code: input.code ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

const unwrapNotebookEntries = (response: unknown): NotebookEntry[] => {
  const envelope = response as NotebookEntriesEnvelope
  return envelope.data ?? []
}

function assertLoggedIn(loggedIn: Ref<boolean>) {
  if (!loggedIn.value) {
    throw new Error('Требуется авторизация')
  }
}

export const useNotebook = () => {
  const api = useApi()
  const { loggedIn } = useAuth()

  const {
    data: entries,
    pending,
    error,
    refresh,
    clear,
  } = useApiFetch<NotebookEntry[]>('/api/notebook', {
    key: 'notebook',
    transform: unwrapNotebookEntries,
    immediate: false,
    watch: false,
    server: false,
  })

  watch(
    loggedIn,
    (isLoggedIn) => {
      if (isLoggedIn) {
        refresh()
        return
      }

      clear()
    },
    { immediate: true },
  )

  const isCreating = ref(false)
  const updatingId = ref<string | null>(null)
  const deletingId = ref<string | null>(null)

  const getEntries = () => entries.value ?? []

  const prependEntryToCache = (entry: NotebookEntry) => {
    entries.value = [entry, ...getEntries()]
  }

  const removeEntryFromCache = (id: string): { entry: NotebookEntry; index: number } | null => {
    const list = getEntries()
    const index = list.findIndex((item) => item.id === id)
    const entry = list[index]
    if (index === -1 || !entry) return null

    entries.value = list.filter((item) => item.id !== id)
    return { entry, index }
  }

  const restoreEntryAt = (index: number, entry: NotebookEntry) => {
    entries.value = getEntries().toSpliced(index, 0, entry)
  }

  const patchEntryInCache = (id: string, patch: Partial<NotebookEntry>) => {
    const list = getEntries()
    const index = list.findIndex((item) => item.id === id)
    const current = list[index]
    if (index === -1 || !current) return

    entries.value = list.with(index, { ...current, ...patch })
  }

  const createEntry = async (input: CreateNotebookEntryInput) => {
    assertLoggedIn(loggedIn)
    if (isCreating.value) return

    const optimisticEntry = createOptimisticEntry(input)

    isCreating.value = true
    prependEntryToCache(optimisticEntry)

    try {
      const response = await api<NotebookEntryEnvelope>('/api/notebook', {
        method: 'POST',
        body: input,
      })

      removeEntryFromCache(optimisticEntry.id)
      prependEntryToCache(response.data)
      return response.data
    } catch (e) {
      removeEntryFromCache(optimisticEntry.id)
      throw e
    } finally {
      isCreating.value = false
    }
  }

  const updateEntry = async (id: string, payload: UpdateNotebookEntryInput) => {
    assertLoggedIn(loggedIn)
    if (updatingId.value !== null) return

    updatingId.value = id

    try {
      const response = await api<NotebookEntryEnvelope>(`/api/notebook/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      if (response.data) {
        patchEntryInCache(id, response.data)
      }

      return response.data
    } finally {
      updatingId.value = null
    }
  }

  const deleteEntry = async (id: string) => {
    assertLoggedIn(loggedIn)
    if (deletingId.value !== null) return

    const removed = removeEntryFromCache(id)
    if (!removed) return

    deletingId.value = id

    try {
      await api(`/api/notebook/${id}`, { method: 'DELETE' })
    } catch (e) {
      restoreEntryAt(removed.index, removed.entry)
      throw e
    } finally {
      deletingId.value = null
    }
  }

  const isUpdating = (id: string) => updatingId.value === id
  const isDeleting = (id: string) => deletingId.value === id
  const entriesView = computed(() => entries.value ?? [])

  return {
    entries: readonly(entriesView),
    pending: readonly(pending),
    error: readonly(error),
    isCreating: readonly(isCreating),
    refresh,
    createEntry,
    updateEntry,
    deleteEntry,
    isUpdating,
    isDeleting,
  }
}
