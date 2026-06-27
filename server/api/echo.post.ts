import { CreateTaskSchema } from '#shared/validations/task'

import { apiHandler } from '../utils/apiHandler'
import { validateBody } from '../utils/validation'

/** Учебный route нед. 5 день 2 — apiHandler + validateBody + CreateTaskSchema. Публичный (auth middleware). */
export default apiHandler(async (event) => {
  const body = await validateBody(event, CreateTaskSchema)

  return {
    echo: body,
    receivedAt: new Date().toISOString(),
  }
})
