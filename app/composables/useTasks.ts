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
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return

    await updateTask(id, { completed: !task.completed })
  }

  return {
    tasks: readonly(tasks),
    pending: readonly(pending),
    error: readonly(error),
    refresh,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  }
}
