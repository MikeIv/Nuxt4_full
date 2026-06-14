// Entity types for Task CRUD — singular module name (как shared/types/health.ts).
export interface Task {
  id: string
  title: string
  description?: string | null
  completed: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateTaskInput {
  title: string
  description?: string
  completed?: boolean
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  completed?: boolean
}

export interface TaskResponse extends Omit<Task, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}
