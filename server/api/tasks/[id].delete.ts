export default apiHandler(async (event) => {
  const { id } = getRouterParams(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  }

  const success = await deleteTask(id, requireAuthUser(event))

  if (!success) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  return { deleted: true }
})
