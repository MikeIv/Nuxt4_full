import type { Task, CreateTaskInput, UpdateTaskInput } from '#shared/types/tasks'

export const useTasks = () => {
  const api = useApi()

  const {
    data: tasks,
    pending,
    error,
    refresh,
  } = useAsyncData<Task[]>(
    'tasks',
    async () => {
      const response = await api<{ data: Task[] }>('/api/tasks')
      return response.data ?? []
    },
    { default: () => [] },
  )

  const togglingId = ref<string | null>(null)

  const patchTaskInCache = (id: string, patch: Partial<Task>) => {
    const index = tasks.value.findIndex((task) => task.id === id)
    const current = tasks.value[index]
    if (index === -1 || !current) return

    tasks.value = tasks.value.with(index, { ...current, ...patch })
  }

  const createTask = async (input: CreateTaskInput) => {
    const response = await api<{ data: Task }>('/api/tasks', {
      method: 'POST',
      body: input,
    })

    await refresh()
    return response.data
  }

  const updateTask = async (id: string, payload: UpdateTaskInput) => {
    const response = await api<{ data: Task }>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: payload,
    })

    await refresh()
    return response.data
  }

  const deleteTask = async (id: string) => {
    await api(`/api/tasks/${id}`, { method: 'DELETE' })
    await refresh()
  }

  const toggleTask = async (id: string) => {
    if (togglingId.value !== null) return

    const task = tasks.value.find((item) => item.id === id)
    if (!task) return

    const previousCompleted = task.completed
    const nextCompleted = !previousCompleted

    togglingId.value = id
    patchTaskInCache(id, { completed: nextCompleted })

    try {
      const response = await api<{ data: Task }>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: { completed: nextCompleted },
      })

      if (response.data) {
        patchTaskInCache(id, response.data)
      }
    } catch (e) {
      patchTaskInCache(id, { completed: previousCompleted })
      throw e
    } finally {
      togglingId.value = null
    }
  }

  const isToggling = (id: string) => togglingId.value === id

  return {
    tasks: readonly(tasks),
    pending: readonly(pending),
    error: readonly(error),
    refresh,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    isToggling,
  }
}
