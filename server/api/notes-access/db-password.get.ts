import type { NotesDbPasswordResponse } from '#shared/types/notesAccess'

export default defineEventHandler(async (event): Promise<NotesDbPasswordResponse> => {
  return getNotesDbPassword(event)
})
