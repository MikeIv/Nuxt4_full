import { CreateTaskSchema } from '#shared/validations/task'

export default apiHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await validateBody(event, CreateTaskSchema)

  return createTask(body, user.id)
})
