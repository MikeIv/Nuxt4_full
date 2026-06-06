export interface RoadmapTheoryItem {
  /** Название темы (блок «Тема» в UI) */
  title: string
  /** Описание темы (блок «Описание» в UI) */
  comment?: string
}

interface TheoryStep {
  topic: string
  description: string
}

export interface RoadmapCheckItem {
  id: string
  label: string
  /** Развёрнутый комментарий: Что / Где / Как / Проверка (неделя 1+) */
  comment?: string
}

export interface RoadmapWeek {
  id: number
  title: string
  theme: string
  goal: string
  theory: RoadmapTheoryItem[]
  practice: RoadmapCheckItem[]
  doneWhen: RoadmapCheckItem[]
}

function theoryItems(...titles: string[]): RoadmapTheoryItem[] {
  return titles.map((title) => ({ title }))
}

function theorySteps(steps: TheoryStep[]): RoadmapTheoryItem[] {
  return steps.map((step) => ({
    title: step.topic,
    comment: step.description,
  }))
}

function practice(weekId: number, labels: string[]): RoadmapCheckItem[] {
  return labels.map((label, index) => ({
    id: `w${weekId}:p:${index}`,
    label,
  }))
}

interface PracticeStep {
  label: string
  what: string
  where: string
  how: string
  verify: string
}

function practiceSteps(weekId: number, steps: PracticeStep[]): RoadmapCheckItem[] {
  return steps.map((step, index) => ({
    id: `w${weekId}:p:${index}`,
    label: step.label,
    comment: `Что: ${step.what}\n\nГде: ${step.where}\n\nКак: ${step.how}\n\nПроверка: ${step.verify}`,
  }))
}

function doneWhen(weekId: number, labels: string[]): RoadmapCheckItem[] {
  return labels.map((label, index) => ({
    id: `w${weekId}:d:${index}`,
    label,
  }))
}

export const ROADMAP_WEEKS: RoadmapWeek[] = [
  {
    id: 1,
    title: 'Nitro и первый backend',
    theme: 'шаги 1–7 ✓ — опционально: boot plugin, apiResponse',
    goal: 'Понять backend Nuxt 4 (Nitro): типизированные API, end-to-end frontend ↔ backend, правильная архитектура. Обязательные шаги 1–7 сделаны; рекомендуемые: 00-boot.ts, apiResponse.ok().',
    theory: theorySteps([
      {
        topic: '✅ Контракт: `shared/types/health.ts`',
        description:
          'Сделано. HealthResponse в shared/types/ (#shared) — один тип для handler, utils и useApiFetch. types/ в корне — только augmentation (nuxt-public.d.ts).',
      },
      {
        topic: '✅ Thin handler: `health.get.ts` + `server/utils/health.ts`',
        description:
          'Сделано. server/api/health.get.ts → return getHealthPayload(). Вся логика в server/utils/health.ts. getHealthPayload автоимпортируется в Nitro после перезапуска dev-сервера.',
      },
      {
        topic: '✅ End-to-end: health на главной (`useApiFetch` + SSR)',
        description:
          'Сделано. app/pages/index.vue: useApiFetch<HealthResponse>("/api/health") с pending/error. Полный цикл client ↔ server до POST и middleware.',
      },
      {
        topic: '✅ POST и naming convention Nitro',
        description:
          'Сделано. server/api/health.post.ts → POST /api/health. readHealthPostBody → buildHealthPostResponse. HealthPostBody/HealthPostResponse в shared/types/.',
      },
      {
        topic: '✅ `server/middleware/log.ts` — порядок middleware → handler',
        description:
          'Сделано. Лог [nitro] method path на каждый HTTP-запрос до handler. Цепочка: middleware → api route → utils. На нед. 2 — errors, CORS.',
      },
      {
        topic: '✅ runtimeConfig + типизация',
        description:
          'Сделано. .env.example, types/nuxt-public.d.ts, server/utils/runtimeConfig.ts (useServerRuntimeConfig, warnIfExampleSecretMissing). Секреты не в браузере и не в JSON health.',
      },
      {
        topic: '✅ Документация: `docs/architecture.md`',
        description:
          'Сделано. GET/POST потоки, дерево server/, роли shared/types/, runtimeConfig. Client → middleware → api → utils → (DB).',
      },
      {
        topic: '[Рекомендуется] `server/plugins/00-boot.ts`',
        description: 'Один раз при старте Nitro — отличие plugin от middleware/log.ts.',
      },
      {
        topic: '[Рекомендуется] `server/utils/apiResponse.ts` — ok(data)',
        description:
          'Начало единого формата { data } — полноценно на нед. 2. Health на нед. 1 остаётся плоским объектом.',
      },
    ]),
    practice: practiceSteps(1, [
      {
        label: '✅ Контракт: HealthResponse в shared/types/',
        what: 'Зафиксировать форму JSON-ответа /api/health.',
        where: 'shared/types/health.ts (#shared).',
        how: 'export interface HealthResponse { status, timestamp, version, … }.',
        verify: 'typecheck OK. Тип используется в handler, utils и useApiFetch.',
      },
      {
        label: '✅ Thin handler: health.get.ts + server/utils/health.ts',
        what: 'Тонкий handler, логика в getHealthPayload().',
        where: 'server/api/health.get.ts + server/utils/health.ts.',
        how: 'Handler: return getHealthPayload(). Utils: полный HealthResponse.',
        verify: '/api/health → JSON. Handler без бизнес-логики.',
      },
      {
        label: '✅ End-to-end: health на главной (useApiFetch + SSR)',
        what: 'Те же данные health на UI — полный цикл client ↔ server.',
        where: 'app/pages/index.vue.',
        how: 'useApiFetch<HealthResponse>("/api/health") + pending/error.',
        verify: 'Главная и /api/health — одни поля. SSR в View Source.',
      },
      {
        label: '✅ POST /api/health',
        what: 'Учебный POST на тот же путь — readBody, naming convention Nitro.',
        where: 'server/api/health.post.ts (не _health.post.ts).',
        how: 'readHealthPostBody → buildHealthPostResponse. Типы в shared/types/health.ts.',
        verify: `curl -X POST …/api/health -d '{"ping":1}' → JSON с received + echo. GET без регрессий.`,
      },
      {
        label: '✅ Middleware: лог каждого запроса',
        what: 'Лог method + path; понимание порядка middleware → handler.',
        where: 'server/middleware/log.ts.',
        how: 'console.log("[nitro]", event.method, event.path). Без секретов.',
        verify: 'Логи при запросах /, /api/health и POST /api/health.',
      },
      {
        label: '✅ runtimeConfig + типизация',
        what: 'Финализировать apiBase, nuxt-public.d.ts, .env.example, server/utils/runtimeConfig.ts.',
        where:
          'nuxt.config.ts, types/nuxt-public.d.ts, .env.example, server/utils/runtimeConfig.ts.',
        how: 'useServerRuntimeConfig в utils. warnIfExampleSecretMissing в dev. version в health из config.',
        verify:
          'useRuntimeConfig() на клиенте — только public.*. TS без ошибок на config.public.appVersion.',
      },
      {
        label: '✅ Актуализировать docs/architecture.md',
        what: 'Схема потока данных и роли папок — по фактическому коду недели.',
        where: 'docs/architecture.md.',
        how: 'GET/POST потоки, дерево server/, shared/types/, runtimeConfig.',
        verify: 'Объясняешь путь /api/health без открытия кода.',
      },
      {
        label: '[Рекомендуется] Boot plugin 00-boot.ts',
        what: 'Лог один раз при старте Nitro.',
        where: 'server/plugins/00-boot.ts',
        how: 'defineNitroPlugin, dev-only console.log.',
        verify: 'Сообщение при pnpm dev; не на каждый запрос.',
      },
      {
        label: '[Рекомендуется] apiResponse.ok(data)',
        what: 'Заготовка единого формата ответа под нед. 2.',
        where: 'server/utils/apiResponse.ts',
        how: 'ok<T>(data: T) => ({ data }).',
        verify: 'Файл компилируется; health не обязан использовать ok().',
      },
    ]),
    doneWhen: doneWhen(1, [
      'Есть GET /api/health и POST /api/health',
      'Health отображается на главной странице (useApiFetch)',
      'Работает middleware-логгер (method + path)',
      'Понимаешь разницу public / private в runtimeConfig',
      'Есть и актуален docs/architecture.md',
      'Понимаешь структуру: app/, server/, shared/types/, server/utils/',
      'Handlers тонкие — бизнес-логика только в server/utils/',
    ]),
  },
  {
    id: 2,
    title: 'HTTP, middleware, ошибки',
    theme: 'Единый формат API',
    goal: 'Единый стиль API и централизованные ошибки.',
    theory: theoryItems(
      'REST, статусы, CORS (same-origin в Nuxt)',
      'Nitro middleware, createError',
    ),
    practice: practice(2, [
      'server/utils/apiHandler.ts',
      'server/middleware/log.ts — method + path + duration',
      'POST /api/echo + страница /playground',
      'docs/api-conventions.md — { data } / { error }',
    ]),
    doneWhen: doneWhen(2, ['Ошибки → предсказуемый JSON', 'Middleware логирует в dev']),
  },
  {
    id: 3,
    title: 'Docker, PostgreSQL, Prisma',
    theme: 'БД в Docker, schema',
    goal: 'БД локально + Prisma в Nitro.',
    theory: theoryItems(
      'Docker Compose, volumes',
      'Prisma: schema, migrate, seed',
      'DATABASE_URL только server-side',
    ),
    practice: practice(3, [
      'docker-compose.yml — PostgreSQL 16',
      'Prisma: модель User (без auth)',
      'server/utils/prisma.ts — singleton',
      'GET /api/users + seed',
      'Скрипты: db:migrate, db:seed, db:studio',
      'Обновить .env.example',
    ]),
    doneWhen: doneWhen(3, ['docker compose up + migrate + seed', '/api/users из Postgres']),
  },
  {
    id: 4,
    title: 'Fullstack CRUD: Todo',
    theme: 'Todo без auth',
    goal: 'Vertical slice: UI ↔ API ↔ Prisma.',
    theory: theoryItems('CRUD-паттерн в Nitro', 'useApiFetch + composable для списка'),
    practice: practice(4, [
      'Prisma: модель Todo',
      'CRUD /api/todos',
      'UI /todos, composable useTodos()',
      'loading / error states',
    ]),
    doneWhen: doneWhen(4, ['CRUD после restart dev + Docker', 'Данные в volume Postgres']),
  },
  {
    id: 5,
    title: 'Аутентификация',
    theme: 'Register, login, session',
    goal: 'Sessions, register, login.',
    theory: theoryItems(
      'Session vs JWT, cookies httpOnly',
      'Выбрать один: nuxt-auth-utils (рекомендуется) или Lucia',
    ),
    practice: practice(5, [
      'User + passwordHash',
      '/api/auth/register, login, logout, me',
      '/login, /register, middleware auth.ts',
      'Todo → userId',
    ]),
    doneWhen: doneWhen(5, ['Без login нельзя создавать «свои» todos', 'Session secret в .env']),
  },
  {
    id: 6,
    title: 'Авторизация (RBAC)',
    theme: 'Роли, защита routes',
    goal: 'Authentication vs authorization.',
    theory: theoryItems('RBAC на server-side', 'requireUser / requireAdmin helpers'),
    practice: practice(6, [
      'Role: USER, ADMIN',
      'requireUser, requireAdmin',
      'GET /api/admin/users — только ADMIN',
      'DELETE todo — владелец или ADMIN',
    ]),
    doneWhen: doneWhen(6, ['USER → admin API = 403', 'Защита на server, не только UI']),
  },
  {
    id: 7,
    title: 'Zod, API design',
    theme: 'Валидация, пагинация',
    goal: 'Валидация и «взрослый» REST.',
    theory: theoryItems('Zod на границе API', 'Пагинация и фильтры в query'),
    practice: practice(7, [
      'readValidatedBody(event, schema)',
      'Zod для auth и todos',
      'Пагинация ?page=&limit=&q=',
      'Модель Project, relation с Todo',
      '/projects, /projects/[id]',
    ]),
    doneWhen: doneWhen(7, ['Invalid body → 400 с issues', 'Пагинация на 20+ seed']),
  },
  {
    id: 8,
    title: 'Тестирование и файлы',
    theme: 'Vitest, upload',
    goal: 'Тесты API и загрузка файлов.',
    theory: theoryItems('Vitest + @nuxt/test-utils', 'Upload и лимиты размера'),
    practice: practice(8, [
      'Vitest + @nuxt/test-utils',
      'Тесты: health, auth, todo CRUD',
      'Upload avatar → POST /api/users/avatar',
      '/profile',
    ]),
    doneWhen: doneWhen(8, ['pnpm test проходит', 'Upload с лимитом размера']),
  },
  {
    id: 9,
    title: 'Логи, кэш, деплой',
    theme: 'Pino, Redis (opt), production',
    goal: 'Production-ready observability и деплой.',
    theory: theoryItems('Structured logging', 'Health check с DB', 'Deploy Nuxt + Postgres'),
    practice: practice(9, [
      'Pino в server/utils/logger.ts',
      '(Optional) Redis cache',
      'Health + DB check',
      'Deploy (Railway / Hetzner / Vercel)',
      'docs/deployment-production.md',
    ]),
    doneWhen: doneWhen(9, ['Staging URL, health db: connected', 'Migrations on deploy']),
  },
  {
    id: 10,
    title: 'Админка',
    theme: 'Dashboard / Nuxt UI',
    goal: 'Admin UI для управления данными.',
    theory: theoryItems('@nuxt/ui', 'Admin layout и таблицы'),
    practice: practice(10, [
      '@nuxt/ui, layout /admin',
      'Users, todos, projects tables',
      'GET /api/admin/stats',
    ]),
    doneWhen: doneWhen(10, ['ADMIN в /admin', 'USER → 403']),
  },
  {
    id: 11,
    title: 'Real-time',
    theme: 'SSE / WebSocket',
    goal: 'Live updates на клиенте.',
    theory: theoryItems('SSE vs WebSocket в Nitro', 'Подписка на изменения todos'),
    practice: practice(11, [
      'SSE /api/todos/stream или WebSocket',
      'Live update на /todos',
      'docs/realtime.md',
    ]),
    doneWhen: doneWhen(11, ['Два браузера — изменения синхронизируются']),
  },
  {
    id: 12,
    title: 'Capstone: mini-SaaS',
    theme: 'Stripe, CI/CD, polish',
    goal: 'Финальный продукт Task Board с billing.',
    theory: theoryItems('Multi-tenant workspace', 'Stripe webhooks', 'CI pipeline'),
    practice: practice(12, [
      'Workspace, WorkspaceMember',
      'Stripe test checkout + webhook',
      'Free plan: max 3 projects',
      '.github/workflows/ci.yml',
      'README: demo, stack, screenshots',
    ]),
    doneWhen: doneWhen(12, [
      'CI зелёный',
      'Stripe test session работает',
      'Можешь объяснить путь: кнопка → API → БД → UI',
    ]),
  },
]

export function getRoadmapWeekTaskIds(week: RoadmapWeek): string[] {
  return [...week.practice, ...week.doneWhen].map((item) => item.id)
}

export function getAllRoadmapTaskIds(): string[] {
  return ROADMAP_WEEKS.flatMap(getRoadmapWeekTaskIds)
}
