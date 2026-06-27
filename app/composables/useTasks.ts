/**
 * Единый источник правды для UI задач (Неделя 3).
 * — Список: useApiFetch (SSR, key `tasks`).
 * — Мутации: useApi (императивно); create/delete/toggle — optimistic + rollback.
 */
import type { Task, CreateTaskInput, UpdateTaskInput } from '#shared/types/task'

const OPTIMISTIC_ID_PREFIX = 'optimistic:'

const createOptimisticTask = (input: CreateTaskInput): Task => {
  const now = new Date().toISOString()

  return {
    id: `${OPTIMISTIC_ID_PREFIX}${globalThis.crypto.randomUUID()}`,
    title: input.title,
    description: input.description ?? null,
    completed: false,
    createdAt: now,
    updatedAt: now,
  }
}

export const useTasks = () => {
  const api = useApi()

  const {
    data: tasks,
    pending,
    error,
    refresh,
  } = useApiFetch<Task[]>('/api/tasks', {
    key: 'tasks',
  })

  const togglingId = ref<string | null>(null)
  const isCreating = ref(false)
  const deletingId = ref<string | null>(null)

  const getTasks = () => tasks.value ?? []

  const patchTaskInCache = (id: string, patch: Partial<Task>) => {
    const list = getTasks()
    const index = list.findIndex((task) => task.id === id)
    const current = list[index]
    if (index === -1 || !current) return

    tasks.value = list.with(index, { ...current, ...patch })
  }

  const prependTaskToCache = (task: Task) => {
    tasks.value = [task, ...getTasks()]
  }

  const removeTaskFromCache = (id: string): { task: Task; index: number } | null => {
    const list = getTasks()
    const index = list.findIndex((task) => task.id === id)
    const task = list[index]
    if (index === -1 || !task) return null

    tasks.value = list.filter((item) => item.id !== id)
    return { task, index }
  }

  const restoreTaskAt = (index: number, task: Task) => {
    tasks.value = getTasks().toSpliced(index, 0, task)
  }

  const createTask = async (input: CreateTaskInput) => {
    if (isCreating.value) return

    const optimisticTask = createOptimisticTask(input)

    isCreating.value = true
    prependTaskToCache(optimisticTask)

    try {
      const task = await api<Task>('/api/tasks', {
        method: 'POST',
        body: input,
      })

      await refresh()
      return task
    } catch (e) {
      removeTaskFromCache(optimisticTask.id)
      throw e
    } finally {
      isCreating.value = false
    }
  }

  const updateTask = async (id: string, payload: UpdateTaskInput) => {
    const task = await api<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: payload,
    })

    await refresh()
    return task
  }

  const deleteTask = async (id: string) => {
    if (deletingId.value !== null) return

    const removed = removeTaskFromCache(id)
    if (!removed) return

    deletingId.value = id

    try {
      await api(`/api/tasks/${id}`, { method: 'DELETE' })
      await refresh()
    } catch (e) {
      restoreTaskAt(removed.index, removed.task)
      throw e
    } finally {
      deletingId.value = null
    }
  }

  const toggleTask = async (id: string) => {
    if (togglingId.value !== null) return

    const task = getTasks().find((item) => item.id === id)
    if (!task) return

    const previousCompleted = task.completed
    const nextCompleted = !previousCompleted

    togglingId.value = id
    patchTaskInCache(id, { completed: nextCompleted })

    try {
      const updated = await api<Task>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: { completed: nextCompleted },
      })

      patchTaskInCache(id, updated)
    } catch (e) {
      patchTaskInCache(id, { completed: previousCompleted })
      throw e
    } finally {
      togglingId.value = null
    }
  }

  const isToggling = (id: string) => togglingId.value === id
  const isDeleting = (id: string) => deletingId.value === id
  const tasksView = computed(() => tasks.value ?? [])

  return {
    tasks: readonly(tasksView),
    pending: readonly(pending),
    error: readonly(error),
    isCreating: readonly(isCreating),
    refresh,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    isToggling,
    isDeleting,
  }
}
