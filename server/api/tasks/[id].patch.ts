import type { Task, UpdateTaskInput } from '#shared/types/task'
import { requireBody } from '../../utils/requestBody'

export default defineEventHandler(async (event): Promise<{ data: Task | null }> => {
  const { id } = getRouterParams(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  }

  const body = await requireBody<UpdateTaskInput>(event)
  const task = await updateTask(id, body)

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found',
    })
  }

  return { data: task }
})
