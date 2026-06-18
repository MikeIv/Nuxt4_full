export default defineEventHandler(async (event): Promise<{ data: { success: boolean } }> => {
  const { id } = getRouterParams(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID is required',
    })
  }

  const user = requireAuthUser(event)
  const success = await deleteTask(id, user)

  if (!success) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found',
    })
  }

  return { data: { success: true } }
})
