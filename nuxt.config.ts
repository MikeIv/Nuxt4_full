import packageJson from './package.json' with { type: 'json' }

const isDev = (process.env.NODE_ENV ?? 'development') === 'development'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  /** Исходники приложения в `app/`. Каталог `server/` — в корне репозитория. */
  srcDir: 'app/',

  alias: {
    '@shared': './shared',
  },

  css: ['~/assets/styles/main.scss'],

  modules: ['@nuxt/eslint', '@onmax/nuxt-better-auth'],

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
    authSecret: process.env.AUTH_SECRET,
    notesAccessResetEmail: process.env.NOTES_ACCESS_RESET_EMAIL ?? 'gagarahome@yandex.ru',
    smtpHost: process.env.SMTP_HOST ?? '',
    smtpPort: process.env.SMTP_PORT ?? '465',
    smtpUser: process.env.SMTP_USER ?? '',
    smtpPass: process.env.SMTP_PASS ?? '',
    smtpFrom: process.env.SMTP_FROM ?? '',

    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '',
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION ?? packageJson.version,
      appName: process.env.NUXT_PUBLIC_APP_NAME ?? 'Nuxt4 Fullstack',
    },
  },

  features: {
    /** Логи Nuxt devtools в production не нужны */
    devLogs: isDev,
  },

  routeRules: {
    '/tasks': { auth: { only: 'user', redirectTo: '/login' } },
    '/login': { auth: { only: 'guest', redirectTo: '/tasks' } },
    '/register': { auth: { only: 'guest', redirectTo: '/tasks' } },
  },

  vite: {
    build: {
      target: 'esnext',
      cssMinify: true,
    },
  },

  nitro: {
    logLevel: isDev ? 'debug' : 'info',
    compressPublicAssets: true,
    preset: 'node-server',
    /** Поднимаем target, чтобы работал top-level await в server/utils (нужен для Prisma singleton + ESM interop). */
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
    /** Better Auth: полный trace @better-auth/core (иначе на Linux PM2 — ERR_MODULE_NOT_FOUND env/index.mjs). */
    externals: {
      inline: [
        'better-auth',
        '@better-auth/core',
        '@better-auth/telemetry',
        '@better-auth/utils',
        '@better-auth/prisma-adapter',
      ],
    },
  },
})
