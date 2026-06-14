import type { NotesDbPasswordBody, NotesDbPasswordSaveResponse } from '#shared/types/notesAccess'

export default defineEventHandler(async (event): Promise<NotesDbPasswordSaveResponse> => {
  const body = await readBody<NotesDbPasswordBody>(event)

  if (!body || typeof body.password !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Укажите password в теле запроса',
    })
  }

  return saveNotesDbPassword(event, body.password)
})
