type EchoBody = {
  message?: string
}

/** Учебный route нед. 5 день 1 — проверка apiHandler + unified JSON. Публичный (см. auth middleware). */
export default apiHandler(async (event) => {
  const body = await readBody<EchoBody>(event)

  if (!body?.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'message is required',
    })
  }

  return {
    echo: body.message,
    receivedAt: new Date().toISOString(),
  }
})
