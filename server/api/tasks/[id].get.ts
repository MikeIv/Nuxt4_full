import type { Task } from '#shared/types/task'

export default defineEventHandler(async (event): Promise<{ data: Task | null }> => {
  const { id } = getRouterParams(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  }

  const userId = requireAuthUser(event).id
  const task = await getTaskById(id, userId)

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found',
    })
  }

  return { data: task }
})
