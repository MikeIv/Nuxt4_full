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
    theme: 'неделя 1 ✓ (включая boot plugin и apiResponse)',
    goal: 'Понять backend Nuxt 4 (Nitro): типизированные API, end-to-end frontend ↔ backend, правильная архитектура. Шаги 1–7 и рекомендуемые 00-boot.ts, apiResponse.ok() — сделаны.',
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
          'Сделано. Лог [nitro] method path на каждый HTTP-запрос до handler. На нед. 4 — duration, apiHandler.',
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
        topic: '✅ `server/plugins/00-boot.ts`',
        description:
          'Сделано. defineNitroPlugin — лог при старте Nitro (dev). Отличие от middleware/log.ts (на каждый запрос).',
      },
      {
        topic: '✅ `server/utils/apiResponse.ts` — ok(data)',
        description:
          'Сделано. ok<T>(data) => { data }. На нед. 2 — { data, success, error? } в CRUD /api/tasks.',
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
        how: 'useServerRuntimeConfig в utils. warnIfExampleSecretMissing в 00-boot.ts (dev). version в health из config.',
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
        label: '✅ Boot plugin 00-boot.ts',
        what: 'Лог один раз при старте Nitro.',
        where: 'server/plugins/00-boot.ts',
        how: 'defineNitroPlugin + useServerRuntimeConfig; dev-only console.log.',
        verify: 'Сообщение [nitro] boot при pnpm dev; не на каждый запрос.',
      },
      {
        label: '✅ apiResponse.ok(data)',
        what: 'Заготовка единого формата ответа; на нед. 2 — в CRUD tasks.',
        where: 'server/utils/apiResponse.ts',
        how: 'ok<T>(data: T) => ({ data }).',
        verify: 'typecheck OK; health не использует ok().',
      },
    ]),
    doneWhen: doneWhen(1, [
      '✅ Есть GET /api/health и POST /api/health',
      '✅ Health отображается на главной странице (useApiFetch)',
      '✅ Работает middleware-логгер (method + path)',
      '✅ Понимаешь разницу public / private в runtimeConfig',
      '✅ Есть и актуален docs/architecture.md',
      '✅ Понимаешь структуру: app/, server/, shared/types/, server/utils/',
      '✅ Handlers тонкие — бизнес-логика только в server/utils/',
    ]),
  },
  {
    id: 2,
    title: 'Prisma + PostgreSQL + Task CRUD',
    theme: 'Docker, schema, CRUD /api/tasks (v2)',
    goal: 'PostgreSQL + Prisma + CRUD tasks. Порядок: types → utils → GET/POST → PATCH/DELETE → curl verify → docs. Zod минимально; apiHandler — нед. 4. Темп: ~1–2 ч/день.',
    theory: theorySteps([
      {
        topic: 'Docker Compose + PostgreSQL',
        description:
          'docker-compose.yml, volumes, DATABASE_URL только server-side. Checkpoint дня 1: docker compose ps healthy.',
      },
      {
        topic: 'Prisma: init, singleton, migrate',
        description:
          'prisma init, singleton prisma.ts (globalThis в dev). Checkpoint дня 2: $connect() без ошибок.',
      },
      {
        topic: 'Модель Task + seed',
        description:
          'migrate dev + seed 3–5 задач (рекомендуется). Checkpoint дня 3: Prisma Studio с данными.',
      },
      {
        topic: 'Порядок endpoint: types → utils → handler',
        description:
          'День 4: shared/types/task.ts + utils + GET/POST. День 5: PATCH/DELETE + createError 404/400. Prisma не в handlers.',
      },
      {
        topic: 'Verify: curl-чеклист + persistence',
        description:
          'День 6: create → list → patch → delete → docker restart. День 7: architecture.md + lint/build. UI — нед. 3.',
      },
    ]),
    practice: practiceSteps(2, [
      {
        label: '✅ День 1: docker-compose.yml + PostgreSQL',
        what: 'Локальная БД в Docker с persistent volume.',
        where: 'docker-compose.yml, .env, .env.example.',
        how: 'PostgreSQL 16; docker compose up -d; DATABASE_URL в .env.',
        verify: 'Checkpoint: docker compose ps — postgres healthy.',
      },
      {
        label: '✅ День 2: Prisma init + prisma.ts singleton',
        what: 'ORM подключён к Nitro; Client не на каждый запрос.',
        where: 'prisma/schema.prisma, server/utils/prisma.ts, scripts db:migrate, db:studio.',
        how: 'pnpm add prisma @prisma/client; prisma init; singleton + runtimeConfig private.',
        verify: 'Checkpoint: dev стартует; prisma $connect() OK.',
      },
      {
        label: '✅ День 3: модель Task + migrate + seed',
        what: 'Таблица Task и 3–5 seed-задач для быстрого GET.',
        where: 'prisma/schema.prisma, prisma/seed.ts, package.json db:seed.',
        how: 'model Task { id, title, description, completed, createdAt, updatedAt }; prisma db seed.',
        verify: 'Checkpoint: Prisma Studio — seed-данные видны.',
      },
      {
        label: '✅ День 4: types + utils + GET/POST',
        what: 'Первые endpoints после слоёв types/utils — не наоборот.',
        where: 'shared/types/tasks.ts, server/utils/tasks.ts, tasks.get.ts, tasks.post.ts.',
        how: 'getAllTasks/createTask в utils; thin handlers (без Prisma в api).',
        verify: 'Checkpoint: POST добавляет строку в БД (Postman); GET возвращает данные.',
      },
      {
        label: '✅ День 5: PATCH/DELETE + ошибки',
        what: 'Оставшийся CRUD + 404/400.',
        where: 'server/utils/tasks.ts, tasks/[id].get|patch|delete.ts.',
        how: 'getTaskById/updateTask/deleteTask; createError 404; Zod на PATCH.',
        verify: 'Checkpoint: patch/delete curl; bad id → 404 JSON.',
      },
      {
        label: '✅ День 6: curl-чеклист + persistence',
        what: 'Обязательная ручная verify всего CRUD.',
        where: 'terminal + docker compose restart.',
        how: 'create → list → patch → delete → restart → list (см. roadmap).',
        verify: 'Checkpoint: все 5 шагов OK; данные в volume после restart.',
      },
      {
        label: '✅ День 7: architecture.md + lint/build',
        what: 'Handlers без Prisma; документ потока данных.',
        where: 'docs/architecture.md, все server/api/tasks*.',
        how: 'Рефактор если нужно; pnpm lint:all && pnpm build.',
        verify: 'Checkpoint: architecture.md актуален; сборка зелёная.',
      },
    ]),
    doneWhen: doneWhen(2, [
      '✅ PostgreSQL запущен через Docker',
      '✅ Prisma singleton подключён',
      '✅ Seed + migrate выполнены',
      '✅ curl-чеклист CRUD пройден',
      '✅ Данные после restart Docker',
      '✅ Prisma только в server/utils/tasks.ts',
      '✅ Обновлён docs/architecture.md',
    ]),
  },
  {
    id: 3,
    title: 'Fullstack UI: Tasks',
    theme: 'Страница /tasks, composable',
    goal: 'Vertical slice на UI: страница задач поверх CRUD API недели 2.',
    theory: theoryItems('useApiFetch + composable useTasks()', 'loading / error / empty states'),
    practice: practice(3, [
      'app/composables/useTasks.ts',
      'app/pages/tasks.vue — список, создание, toggle completed',
      'Типы из shared/types/task.ts',
      'SSR + client без регрессий',
    ]),
    doneWhen: doneWhen(3, [
      'CRUD с UI после restart dev + Docker',
      'Данные в volume Postgres между перезапусками',
    ]),
  },
  {
    id: 4,
    title: 'HTTP, middleware, ошибки',
    theme: 'apiHandler, единый формат API',
    goal: 'Единый стиль API — унификация createError и { data, success } из нед. 2.',
    theory: theoryItems(
      'REST, статусы, CORS (same-origin в Nuxt)',
      'Nitro middleware, createError',
    ),
    practice: practice(4, [
      'server/utils/apiHandler.ts',
      'server/middleware/log.ts — method + path + duration',
      'POST /api/echo + страница /playground',
      'docs/api-conventions.md — { data, success, error? }',
    ]),
    doneWhen: doneWhen(4, ['Ошибки → предсказуемый JSON', 'Middleware логирует duration в dev']),
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
      'Task → userId',
    ]),
    doneWhen: doneWhen(5, ['Без login нельзя создавать «свои» tasks', 'Session secret в .env']),
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
      'DELETE task — владелец или ADMIN',
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
      'Zod для auth и tasks',
      'Пагинация ?page=&limit=&q=',
      'Модель Project, relation с Task',
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
      'Тесты: health, auth, task CRUD',
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
      'Users, tasks, projects tables',
      'GET /api/admin/stats',
    ]),
    doneWhen: doneWhen(10, ['ADMIN в /admin', 'USER → 403']),
  },
  {
    id: 11,
    title: 'Real-time',
    theme: 'SSE / WebSocket',
    goal: 'Live updates на клиенте.',
    theory: theoryItems('SSE vs WebSocket в Nitro', 'Подписка на изменения tasks'),
    practice: practice(11, [
      'SSE /api/tasks/stream или WebSocket',
      'Live update на /tasks',
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

/** Пункт с ✅ в начале label — выполнен по умолчанию (пока пользователь явно не снял галочку). */
export function isRoadmapLabelCompletedByDefault(label: string): boolean {
  return /^\s*✅/.test(label)
}

/**
 * The week the student is currently actively working on.
 * This determines the default active tab when opening /roadmap.
 * Bumped to 3 after Week 2 reached 100% (all practice + doneWhen items marked completed via ✅ defaults).
 */
export const CURRENT_ROADMAP_WEEK_ID = 3

export function getRoadmapTaskLabelMap(): Map<string, string> {
  const map = new Map<string, string>()

  for (const week of ROADMAP_WEEKS) {
    for (const item of [...week.practice, ...week.doneWhen]) {
      map.set(item.id, item.label)
    }
  }

  return map
}
