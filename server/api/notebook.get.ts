import type { NotebookEntry } from '#shared/types/notebook'

export default defineEventHandler(async (event): Promise<{ data: NotebookEntry[] }> => {
  const userId = requireAuthUser(event).id
  const entries = await getAllNotebookEntries(userId)
  return { data: entries }
})
