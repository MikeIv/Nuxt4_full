import { auth } from '../../utils/auth'

import { defineEventHandler, toWebRequest } from 'h3'

export default defineEventHandler(async (event) => {
  return auth.handler(toWebRequest(event))
})
