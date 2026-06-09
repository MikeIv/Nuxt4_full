import type { Task } from '#shared/types/task'

export type TaskFilter = 'all' | 'active' | 'completed'
export type TaskSort = 'newest' | 'oldest'

export const TASK_FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Завершённые' },
]

export const TASK_SORT_OPTIONS: { value: TaskSort; label: string }[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
]

const toTimestamp = (value: string | Date) => new Date(value).getTime()

/** Клиентская фильтрация и сортировка списка задач (без запросов к API). */
export const useTaskFilters = (tasks: Ref<readonly Task[]>) => {
  const taskFilter = ref<TaskFilter>('all')
  const taskSort = ref<TaskSort>('newest')

  const hasAnyTasks = computed(() => tasks.value.length > 0)

  const filteredTasks = computed(() => {
    const filtered = tasks.value.filter((task) => {
      if (taskFilter.value === 'active') return !task.completed
      if (taskFilter.value === 'completed') return task.completed
      return true
    })

    const sortDirection = taskSort.value === 'newest' ? 1 : -1

    return [...filtered].sort(
      (a, b) => (toTimestamp(b.createdAt) - toTimestamp(a.createdAt)) * sortDirection,
    )
  })

  const isFilterEmpty = computed(() => hasAnyTasks.value && filteredTasks.value.length === 0)

  const resetFilter = () => {
    taskFilter.value = 'all'
  }

  return {
    taskFilter,
    taskSort,
    hasAnyTasks,
    filteredTasks,
    isFilterEmpty,
    resetFilter,
    filterOptions: TASK_FILTER_OPTIONS,
    sortOptions: TASK_SORT_OPTIONS,
  }
}
