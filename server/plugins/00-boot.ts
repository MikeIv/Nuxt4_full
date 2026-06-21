// Один раз при старте Nitro — в отличие от server/middleware/log.ts (на каждый запрос)

import { getEnv } from '#shared/config/env'

export default defineNitroPlugin(() => {
  getEnv()

  if (!import.meta.dev) {
    return
  }

  warnIfExampleSecretMissing()

  const { public: pub } = useServerRuntimeConfig()
  console.log(`[nitro] boot — ${pub.appName} v${pub.appVersion}`)
})
