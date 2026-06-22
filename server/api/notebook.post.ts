import type { CreateNotebookEntryInput, NotebookEntry } from '#shared/types/notebook'
import { trimOptional } from '../utils/optionalText'
import { requireBody } from '../utils/requestBody'

export default defineEventHandler(async (event): Promise<{ data: NotebookEntry }> => {
  const body = await requireBody<CreateNotebookEntryInput>(event)
  const title = body.title?.trim()

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    })
  }

  const userId = requireAuthUser(event).id
  const entry = await createNotebookEntry(
    {
      title,
      description: trimOptional(body.description),
      code: trimOptional(body.code),
    },
    userId,
  )

  return { data: entry }
})
