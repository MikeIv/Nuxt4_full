// server/middleware/log.ts — выполняется до handler на каждый HTTP-запрос

export default defineEventHandler((event) => {
  console.log('[nitro]', event.method, event.path)
})
