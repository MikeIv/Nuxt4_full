import type { NotebookEntry } from '#shared/types/notebook'

export type NotebookSort = 'newest' | 'oldest'

export const NOTEBOOK_SORT_OPTIONS: { value: NotebookSort; label: string }[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
]

const toTimestamp = (value: string | Date) => new Date(value).getTime()

/** Клиентская сортировка списка заметок блокнота (без запросов к API). */
export const useNotebookFilters = (entries: Ref<readonly NotebookEntry[]>) => {
  const notebookSort = ref<NotebookSort>('newest')

  const hasAnyEntries = computed(() => entries.value.length > 0)

  const sortedEntries = computed(() => {
    const sortDirection = notebookSort.value === 'newest' ? 1 : -1
    const byDate = (a: NotebookEntry, b: NotebookEntry) =>
      (toTimestamp(b.createdAt) - toTimestamp(a.createdAt)) * sortDirection

    return entries.value.toSorted(byDate)
  })

  return {
    notebookSort,
    hasAnyEntries,
    sortedEntries,
    sortOptions: readonly(NOTEBOOK_SORT_OPTIONS),
  }
}
