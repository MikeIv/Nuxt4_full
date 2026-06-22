import type { NotebookEntry } from '#shared/types/notebook'

export default defineEventHandler(async (event): Promise<{ data: NotebookEntry | null }> => {
  const { id } = getRouterParams(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  }

  const userId = requireAuthUser(event).id
  const entry = await getNotebookEntryById(id, userId)

  if (!entry) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Notebook entry not found',
    })
  }

  return { data: entry }
})
