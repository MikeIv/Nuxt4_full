declare module 'nuxt/schema' {
  interface RuntimeConfig {
    /** Учебный private-ключ (нед. 1). Только server, не NUXT_PUBLIC_. */
    exampleSecret: string
  }

  interface PublicRuntimeConfig {
    /** Базовый URL HTTP API (без завершающего `/`). Пример: `https://api.example.com` или `/api` для прокси. */
    apiBase: string
    appVersion: string
    appName: string
  }
}

export {}
