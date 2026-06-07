// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  /** Исходники приложения в `app/`. Каталог `server/` — в корне репозитория. */
  srcDir: 'app/',

  css: ['~/assets/styles/main.scss'],

  modules: ['@nuxt/eslint'],

  eslint: {
    config: {
      stylistic: false,
    },
  },

  devtools: {
    /** В production-сборке DevTools не подключаем — меньше шум и размер. */
    enabled: isDev,
    timeline: { enabled: isDev },
  },

  typescript: {
    strict: true,
    /** Проверка типов на `nuxt build` / `nuxt generate`, без замедления каждого сохранения в dev */
    typeCheck: 'build',
  },

  /**
   * public.* — доступно на клиенте (NUXT_PUBLIC_* в .env).
   * Корень без public — только server (NUXT_* без PUBLIC).
   */
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '',
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION ?? process.env.npm_package_version ?? '0.0.0',
      appName: process.env.NUXT_PUBLIC_APP_NAME ?? 'Nuxt4 Fullstack',
    },
  },

  features: {
    /** Логи Nuxt devtools в production не нужны */
    devLogs: isDev,
  },

  vite: {
    build: {
      target: 'esnext',
      cssMinify: true,
    },
  },

  nitro: {
    compressPublicAssets: true,
    /** Поднимаем target, чтобы работал top-level await в server/utils (нужен для Prisma singleton + ESM interop). */
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
  },
})
