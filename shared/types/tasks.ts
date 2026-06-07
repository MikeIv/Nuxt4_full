// Naming: plural "tasks" for the module/file (per mentor for Week 2 Day 4).
// Singular "Task" for the entity type itself.
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
