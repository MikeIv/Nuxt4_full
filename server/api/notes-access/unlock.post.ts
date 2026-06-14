import type { NotesAccessActionResponse, NotesAccessUnlockBody } from '#shared/types/notesAccess'
import { requireBody } from '../../utils/requestBody'

export default defineEventHandler(async (event): Promise<NotesAccessActionResponse> => {
  const body = await requireBody<NotesAccessUnlockBody>(event)

  return unlockNotesAccess(event, body.password ?? '')
})
