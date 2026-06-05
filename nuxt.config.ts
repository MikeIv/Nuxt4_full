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

  /** Публичные ключи доступны на клиенте; секреты — только в корне `runtimeConfig` без `public` */
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '',
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
  },
})
