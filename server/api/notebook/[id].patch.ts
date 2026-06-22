import type { NotebookEntry, UpdateNotebookEntryInput } from '#shared/types/notebook'
import { trimToNull } from '../../utils/optionalText'
import { requireBody } from '../../utils/requestBody'

export default defineEventHandler(async (event): Promise<{ data: NotebookEntry | null }> => {
  const { id } = getRouterParams(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  }

  const body = await requireBody<UpdateNotebookEntryInput>(event)
  const userId = requireAuthUser(event).id

  const patch: UpdateNotebookEntryInput = {}

  if (body.title !== undefined) {
    const title = body.title.trim()
    if (!title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title is required',
      })
    }
    patch.title = title
  }

  if (body.description !== undefined) {
    patch.description = body.description === null ? null : trimToNull(body.description)
  }

  if (body.code !== undefined) {
    patch.code = body.code === null ? null : trimToNull(body.code)
  }

  if (Object.keys(patch).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No fields to update',
    })
  }

  const entry = await updateNotebookEntry(id, patch, userId)

  if (!entry) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Notebook entry not found',
    })
  }

  return { data: entry }
})
