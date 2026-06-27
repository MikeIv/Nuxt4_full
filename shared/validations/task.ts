import { z } from 'zod'

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Заголовок обязателен').max(255, 'Заголовок слишком длинный'),
  description: z.string().optional(),
  completed: z.boolean().optional(),
})

export const UpdateTaskSchema = CreateTaskSchema.partial()

export const TaskQuerySchema = z.object({
  completed: z.coerce.boolean().optional(),
  search: z.string().optional(),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
export type TaskQueryInput = z.infer<typeof TaskQuerySchema>
