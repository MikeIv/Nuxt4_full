import { TaskQuerySchema } from '#shared/validations/task'

export default apiHandler(async (event) => {
  const user = await requireAuthUser(event)
  const query = await validateQuery(event, TaskQuerySchema)

  return getAllTasks(user.id, query)
})
