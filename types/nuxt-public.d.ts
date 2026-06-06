declare module 'nuxt/schema' {
  interface RuntimeConfig {
    /** Учебный private-ключ (нед. 1). Env: `NUXT_EXAMPLE_SECRET`. Только server. */
    exampleSecret: string
  }

  interface PublicRuntimeConfig {
    /** Env: `NUXT_PUBLIC_API_BASE`. Пусто = same-origin `/api/*`. */
    apiBase: string
    /** Env: `NUXT_PUBLIC_APP_VERSION` или fallback `package.json`. */
    appVersion: string
    /** Env: `NUXT_PUBLIC_APP_NAME`. */
    appName: string
  }
}

export {}
