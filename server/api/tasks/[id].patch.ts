import { UpdateTaskSchema } from '#shared/validations/task'

export default apiHandler(async (event) => {
  const { id } = getRouterParams(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  }

  const body = await validateBody(event, UpdateTaskSchema)
  const task = await updateTask(id, body, requireAuthUser(event).id)

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  return task
})
