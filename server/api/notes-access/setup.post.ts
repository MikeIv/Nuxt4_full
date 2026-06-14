import type { NotesAccessActionResponse, NotesAccessSetupBody } from '#shared/types/notesAccess'
import { requireBody } from '../../utils/requestBody'

export default defineEventHandler(async (event): Promise<NotesAccessActionResponse> => {
  const body = await requireBody<NotesAccessSetupBody>(event)

  return setupNotesAccessPassword(event, body.password ?? '', body.confirmPassword ?? '')
})
