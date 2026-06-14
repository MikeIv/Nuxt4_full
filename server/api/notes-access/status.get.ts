import type { NotesAccessStatusResponse } from '#shared/types/notesAccess'

export default defineEventHandler(async (event): Promise<NotesAccessStatusResponse> => {
  return getNotesAccessStatus(event)
})
