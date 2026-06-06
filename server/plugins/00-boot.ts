// Один раз при старте Nitro — в отличие от server/middleware/log.ts (на каждый запрос)

export default defineNitroPlugin(() => {
  if (!import.meta.dev) {
    return
  }

  warnIfExampleSecretMissing()

  const { public: pub } = useServerRuntimeConfig()
  console.log(`[nitro] boot — ${pub.appName} v${pub.appVersion}`)
})
