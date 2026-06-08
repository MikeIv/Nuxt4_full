import type { Task, CreateTaskInput, UpdateTaskInput } from '#shared/types/tasks'

export const useTasks = () => {
  const {
    data: tasks,
    pending,
    error,
    refresh,
  } = useAsyncData<Task[]>(
    'tasks',
    async () => {
      const { data } = await useApiFetch<{ data: Task[] }>('/api/tasks')
      return data.value?.data || []
    },
    { default: () => [] },
  )

  const createTask = async (input: CreateTaskInput) => {
    const { data } = await useApiFetch<{ data: Task }>('/api/tasks', {
      method: 'POST',
      body: input,
    })

    await refresh()
    return data.value?.data
  }

  const updateTask = async (id: string, payload: UpdateTaskInput) => {
    const { data } = await useApiFetch<{ data: Task }>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: payload,
    })

    await refresh()
    return data.value?.data
  }

  const deleteTask = async (id: string) => {
    await useApiFetch(`/api/tasks/${id}`, { method: 'DELETE' })
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
