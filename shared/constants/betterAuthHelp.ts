import type { CursorHelpCard } from './cursorHelp'

export const BETTER_AUTH_HELP_CARDS: CursorHelpCard[] = [
  {
    id: 'overview',
    title: 'Обзор модуля',
    hint: '@onmax/nuxt-better-auth, Prisma, cookie-сессии',
    accent: 'var(--fs-color-primary)',
    sections: [
      {
        heading: 'Стек',
        paragraphs: [
          'Better Auth — библиотека auth (email/password, OAuth, 2FA). В проекте подключён Nuxt-модуль @onmax/nuxt-better-auth: catch-all /api/auth/*, SSR-safe сессии, auto-import composables.',
          'Данные в PostgreSQL через Prisma adapter: таблицы users, sessions, accounts, verifications.',
        ],
        list: [
          'server/auth.config.ts — defineServerAuth({ prismaAdapter, emailAndPassword, role })',
          'app/auth.config.ts — defineClientAuth({})',
          'nuxt.config.ts — modules: [@onmax/nuxt-better-auth]',
          'Подробнее: docs/architecture.md → «Архитектура auth»',
        ],
      },
      {
        heading: 'Клиент',
        list: [
          'useUserSession() — user, session, loggedIn, ready, signOut',
          'useAuth() — обёртка + isAdmin (app/composables/useAuth.ts)',
          'useSignIn("email") / useSignUp("email") — формы /login и /register',
          'Страницы: /login, /register; защищённая /tasks',
        ],
      },
    ],
  },
  {
    id: 'flow',
    title: 'Поток и API',
    hint: 'sign-in, sign-up, get-session — не /session',
    accent: '#2563eb',
    sections: [
      {
        heading: 'Цепочка запроса',
        code: `Client → /api/auth/* (модуль)
     → server/auth.config.ts
     → Prisma → PostgreSQL`,
      },
      {
        heading: 'Основные endpoints',
        table: [
          { field: 'GET /api/auth/get-session', hint: 'Текущая сессия или null' },
          { field: 'POST /api/auth/sign-up/email', hint: 'Регистрация { email, password, name }' },
          { field: 'POST /api/auth/sign-in/email', hint: 'Вход' },
          { field: 'POST /api/auth/sign-out', hint: 'Выход, сброс cookie' },
        ],
      },
      {
        heading: 'Частые ошибки',
        list: [
          '/api/auth/session не существует — только get-session',
          'Пароль хранится в accounts.password (хеш), не в users',
          'CSRF: вход только через useSignIn, не raw fetch',
          'AUTH_SECRET и NUXT_BETTER_AUTH_SECRET — только server-side (.env)',
        ],
      },
    ],
  },
  {
    id: 'protection',
    title: 'Защита UI и API',
    hint: 'routeRules, middleware, requireUserSession',
    accent: '#059669',
    sections: [
      {
        heading: 'UI (Nuxt route rules)',
        table: [
          { field: '/tasks', hint: "auth: { only: 'user', redirectTo: '/login' }" },
          { field: '/login, /register', hint: "auth: { only: 'guest', redirectTo: '/tasks' }" },
        ],
        paragraphs: [
          'Дублируется definePageMeta({ auth }) на страницах. Без сессии /tasks недоступна — редирект на /login.',
        ],
      },
      {
        heading: 'API (Nitro)',
        code: `server/middleware/auth.ts
  пропуск: /api/auth/**, /api/health, /api/notes-access/**
  иначе: requireUserSession → event.context.user

server/api/tasks*.ts → requireAuthUser(event)`,
        paragraphs: [
          'Задачи фильтруются по userId из сессии. PATCH/DELETE чужой задачи → 404 (не раскрываем id).',
        ],
      },
    ],
  },
  {
    id: 'rbac',
    title: 'Роли USER / ADMIN',
    hint: 'Prisma role, requireRole, seed, Studio',
    accent: '#d97706',
    sections: [
      {
        heading: 'Модель',
        paragraphs: [
          'Поле User.role — enum USER | ADMIN (prisma/schema.prisma). В Better Auth — additionalFields.role в server/auth.config.ts. Типы на клиенте: types/auth-user.d.ts.',
        ],
        table: [
          { field: 'USER', hint: 'CRUD только своих задач; /api/admin/* → 403' },
          { field: 'ADMIN', hint: 'DELETE любых задач; GET /api/admin/users' },
        ],
      },
      {
        heading: 'Как назначить роль',
        list: [
          'Регистрация через /register — всегда USER (defaultValue в auth config)',
          'Prisma Studio → users → колонка role → ADMIN для нужного email',
          'pnpm db:seed — admin@example.com сразу ADMIN, test@example.com USER',
          'API: requireRole(event, "ADMIN") или requireUserSession(event, { user: { role: "ADMIN" } })',
        ],
      },
      {
        heading: 'Server helpers',
        list: [
          'requireAuthUser(event) — 401 без сессии (server/utils/requireAuthUser.ts)',
          'requireRole(event, "ADMIN") — 401/403 (server/utils/requireRole.ts)',
          'deleteTask — владелец или ADMIN (server/utils/tasks.ts)',
        ],
      },
    ],
  },
  {
    id: 'dev',
    title: 'Dev: seed и вход',
    hint: 'password123, pnpm db:seed, диагностика',
    accent: '#7c3aed',
    sections: [
      {
        heading: 'Тестовые аккаунты (после seed)',
        table: [
          { field: 'test@example.com', hint: 'password123 · USER' },
          { field: 'admin@example.com', hint: 'password123 · ADMIN' },
        ],
        code: 'pnpm db:seed',
        paragraphs: [
          'Повторный seed сбрасывает пароль seed-пользователей на password123 (upsert accounts). Удаляет битые credential-строки (accountId ≠ userId).',
        ],
      },
      {
        heading: 'Invalid email or password',
        list: [
          'Запустите pnpm db:seed — пользователь мог быть создан через /register с другим паролем',
          'Проверьте accounts: providerId = credential, password не пустой',
          'Проверьте .env: DATABASE_URL, AUTH_SECRET, NUXT_BETTER_AUTH_SECRET',
        ],
      },
      {
        heading: 'Env',
        table: [
          { field: 'DATABASE_URL', hint: 'PostgreSQL для Prisma' },
          { field: 'AUTH_SECRET', hint: 'openssl rand -hex 32' },
          { field: 'NUXT_BETTER_AUTH_SECRET', hint: 'Секрет модуля (см. .env.example)' },
        ],
      },
    ],
  },
]
