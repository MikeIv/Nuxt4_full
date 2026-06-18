import type { Task, CreateTaskInput } from '#shared/types/task'
import { requireBody } from '../utils/requestBody'

// Thin handler — validation minimal, business logic in server/utils/tasks.ts.
export default defineEventHandler(async (event): Promise<{ data: Task }> => {
  const body = await requireBody<CreateTaskInput>(event)

  if (!body.title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    })
  }

  const userId = requireAuthUser(event).id
  const task = await createTask(body, userId)
  return { data: task }
})
