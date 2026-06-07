import type { Task, CreateTaskInput } from '#shared/types/tasks'
import { readBody } from 'h3'

// Thin handler — validation minimal, business logic in server/utils/tasks.ts.
export default defineEventHandler(async (event): Promise<{ data: Task }> => {
  const body = await readBody<CreateTaskInput>(event)

  if (!body.title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    })
  }

  const task = await createTask(body)
  return { data: task }
})
