// Entity types for Task CRUD — singular module name (как shared/types/health.ts).
export interface Task {
  id: string
  title: string
  description?: string | null
  completed: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export type { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../validations/task'

export interface TaskResponse extends Omit<Task, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}
