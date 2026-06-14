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
          'Сделано. Лог [nitro] method path на каждый HTTP-запрос до handler. На нед. 5 — duration, apiHandler.',
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
    goal: 'PostgreSQL + Prisma + CRUD tasks. Порядок: types → utils → GET/POST → PATCH/DELETE → curl verify → docs. Zod минимально; apiHandler — нед. 5. Темп: ~1–2 ч/день.',
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
        where: 'shared/types/task.ts, server/utils/tasks.ts, tasks.get.ts, tasks.post.ts.',
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
    theme: 'Страница /tasks + useTasks + optimistic',
    goal: 'Полноценная интерактивная страница задач поверх CRUD API (Неделя 2). Замкнуть цикл БД → API → UI: composables, состояния, optimistic updates, SSR, persistence. ~7–10 ч.',
    theory: theorySteps([
      {
        topic: 'useApiFetch + composables (useTasks())',
        description:
          'Единый composable как источник правды. useAsyncData / useApiFetch + кэширование. Методы: fetch, create, update, delete, toggleComplete.',
      },
      {
        topic: 'Управление состоянием на клиенте',
        description:
          'ref / computed для списка, формы, фильтров. Локальное состояние + синхронизация с сервером.',
      },
      {
        topic: 'Loading / Error / Empty states',
        description: 'Skeleton во время загрузки, пустое состояние, ошибка + кнопка «Повторить».',
      },
      {
        topic: 'SSR + клиентская гидратация',
        description: 'Данные на сервере, без лишних перезагрузок на клиенте. Проверка hydration.',
      },
      {
        topic: 'Оптимистичные обновления (базово)',
        description:
          'Toggle completed: меняем UI сразу, подтверждаем на сервере. Rollback при ошибке.',
      },
      {
        topic: 'Best practices Nuxt 4',
        description:
          'refresh() после мутаций, защита от двойных кликов, чистый переиспользуемый код.',
      },
    ]),
    practice: practiceSteps(3, [
      {
        label: '✅ День 1: app/composables/useTasks.ts',
        what: 'Composable-обёртка над API задач с кэшированием.',
        where: 'app/composables/useTasks.ts.',
        how: 'useApiFetch для списка; useApi для мутаций. Типы из shared/types/task.ts.',
        verify:
          'Composable возвращает tasks + pending/error + actions. Используется без дублирования fetch в компонентах.',
      },
      {
        label: '✅ День 2: Страница /tasks — список и создание',
        what: 'Базовый CRUD-интерфейс: список + форма добавления.',
        where: 'app/pages/tasks.vue (+ опц. мелкие компоненты в app/components/).',
        how: 'Карточки или таблица на $style. Форма (title + description). Кнопки Toggle / Edit / Delete. Подключить useTasks().',
        verify: 'Можно создать задачу через UI; список обновляется; данные приходят из БД.',
      },
      {
        label: '✅ День 3: Loading / Empty / Error + toast',
        what: 'Обязательные состояния интерфейса и обратная связь.',
        where: 'app/pages/tasks.vue + простой toast (composable или inline).',
        how: 'Skeleton при pending; Empty когда нет задач; Error + «Повторить»; уведомления об успехе/ошибке.',
        verify:
          'При ошибке сети — показывается error state с кнопкой. При пустом списке — empty. Toast появляется.',
      },
      {
        label: '✅ День 4: Optimistic toggle + rollback',
        what: 'UX без задержек: мгновенное изменение + безопасный откат.',
        where: 'useTasks.ts + tasks.vue (локальный список + mutate).',
        how: 'При toggle: сразу обновить completed в UI, вызвать API; при ошибке — откатить и показать toast. refresh после мутаций.',
        verify:
          'Toggle работает мгновенно. При сетевой ошибке состояние возвращается; данные консистентны.',
      },
      {
        label: '✅ День 5: SSR, persistence, фильтры',
        what: 'Проверка fullstack после перезапусков + удобство.',
        where: 'app/pages/tasks.vue + docker compose.',
        how: 'Проверить HTML при SSR (данные видны до гидратации). docker compose restart postgres + nuxt dev → данные на месте. Добавить фильтр (все/активные/завершённые) и сортировку.',
        verify: 'После рестарта БД и сервера список задач прежний. Фильтр работает, UI отзывается.',
      },
      {
        label: '✅ День 6-7: Рефакторинг + docs',
        what: 'Чистота кода и актуализация документации.',
        where: 'useTasks.ts, tasks.vue, docs/architecture.md.',
        how: 'Вынести дубли (если есть); добавить комментарии; обновить architecture.md (поток /tasks, useTasks → api → utils → prisma); полный ручной тест флоу.',
        verify:
          'lint + build зелёные. architecture.md содержит секцию по UI tasks. Полный цикл работает.',
      },
    ]),
    doneWhen: doneWhen(3, [
      '✅ Есть полноценная страница /tasks с CRUD',
      '✅ Работают loading, empty и error состояния',
      '✅ Используется composable useTasks()',
      '✅ Optimistic updates на toggle completed (с rollback)',
      '✅ Данные сохраняются после перезапуска Docker + Nuxt',
      '✅ Страница красиво выглядит и удобно используется',
      '✅ docs/architecture.md обновлён',
    ]),
  },
  {
    id: 4,
    title: 'Better Auth + RBAC',
    theme: 'День 1: установка + Prisma-схема + базовая настройка Better Auth',
    goal: 'Production-ready auth (Better Auth + Prisma): register/login/logout, защита API и UI, роли USER/ADMIN. День 1 — фундамент: пакеты, User/Session, betterAuth(), миграция, pnpm dev без ошибок. ~7–10 ч.',
    theory: theorySteps([
      {
        topic: 'День 1 — Что такое Better Auth? (30–45 мин)',
        description:
          'Современная auth-библиотека (2025–2026): email/password, cookie-sessions, OAuth, 2FA, organizations, rate limiting. Меньше boilerplate, чем Lucia. Интеграция с Nuxt: better-auth.com/docs/integrations/nuxt + модуль @onmax/nuxt-better-auth.',
      },
      {
        topic: 'День 1 — Ключевые понятия',
        description:
          'Adapter — связь Better Auth с Prisma (@better-auth/prisma-adapter). Better Auth Instance — главный объект betterAuth(). Schema Generation — CLI для таблиц User/Session (или ручная схема). runtimeConfig — AUTH_SECRET и др. только server-side.',
      },
      {
        topic: 'День 1 — Источники перед практикой',
        description:
          'Nuxt Integration: better-auth.com/docs/integrations/nuxt. Prisma Adapter: better-auth.com/docs/adapters/prisma. Модуль: @onmax/nuxt-better-auth@alpha.',
      },
      {
        topic: 'Nuxt integration (дни 2–5)',
        description:
          'Middleware, composables, routeRules. Меньше ручной работы с sessions/cookies vs Lucia.',
      },
      {
        topic: 'Server vs pages middleware',
        description: 'Guards для /api/tasks*; app/middleware/auth.ts для /tasks. 401 без сессии.',
      },
      {
        topic: 'Authentication vs authorization (RBAC)',
        description: 'День 6: role USER | ADMIN; owner checks; DELETE task — владелец или ADMIN.',
      },
      {
        topic: 'CJ-style UX',
        description: 'Loading/error states на login/register; редиректы после auth; user menu.',
      },
    ]),
    practice: practiceSteps(4, [
      {
        label: 'День 1 — Шаг 1: Установка пакетов',
        what: 'Основной пакет, Prisma adapter и Nuxt-модуль.',
        where: 'package.json.',
        how: 'pnpm add better-auth @better-auth/prisma-adapter @onmax/nuxt-better-auth@alpha.',
        verify: 'Пакеты в dependencies; pnpm install без ошибок.',
      },
      {
        label: 'День 1 — Шаг 2: Prisma schema (User + Session + Task.userId)',
        what: 'Модели Better Auth + role для RBAC + связь Task → User.',
        where: 'prisma/schema.prisma.',
        how: 'User (id, email, emailVerified, image, role @default("USER"), sessions, tasks). Session (token, expiresAt, userId, ipAddress, userAgent). Task: userId + relation onDelete Cascade.',
        verify: 'schema.prisma валиден; связи User ↔ Session ↔ Task согласованы.',
      },
      {
        label: 'День 1 — Шаг 3: server/utils/auth.ts',
        what: 'Better Auth instance с prismaAdapter и emailAndPassword.',
        where: 'server/utils/auth.ts.',
        how: 'betterAuth({ database: prismaAdapter(prisma, { provider: "postgresql" }), emailAndPassword: { enabled: true, autoSignIn: true, minPasswordLength: 8 }, appName: "Task Board", secret: process.env.AUTH_SECRET }).',
        verify: 'typecheck OK; импорт prisma из server/utils/prisma.ts.',
      },
      {
        label: 'День 1 — Шаг 4: nuxt.config.ts — модуль',
        what: 'Подключить @onmax/nuxt-better-auth.',
        where: 'nuxt.config.ts.',
        how: "modules: ['@onmax/nuxt-better-auth']; секция betterAuth: { … } по доке модуля.",
        verify: 'Nuxt стартует; модуль в списке modules.',
      },
      {
        label: 'День 1 — Шаг 5: Переменные окружения',
        what: 'DATABASE_URL и AUTH_SECRET (мин. 32 символа).',
        where: '.env, .env.example, nuxt.config runtimeConfig (private).',
        how: 'openssl rand -hex 32 для AUTH_SECRET. DATABASE_URL=postgresql://…. Не коммитить .env.',
        verify: 'AUTH_SECRET в private runtimeConfig; .env.example обновлён.',
      },
      {
        label: 'День 1 — Шаг 6: Миграция + generate',
        what: 'Применить схему к PostgreSQL.',
        where: 'prisma/migrations/.',
        how: 'pnpm exec prisma migrate dev --name add_better_auth && pnpm exec prisma generate.',
        verify: 'Миграция применена; Prisma Client сгенерирован.',
      },
      {
        label: 'День 1 — Шаг 7: Проверка старта',
        what: 'Сервер без ошибок Prisma/auth; таблицы в Studio.',
        where: 'терминал, Prisma Studio.',
        how: 'pnpm dev — смотреть логи Nitro. pnpm prisma studio — таблицы User и Session.',
        verify: 'Checkpoint: pnpm dev без ошибок auth/Prisma; User и Session видны в Studio.',
      },
      {
        label: 'День 2: Register / Login / Logout (API)',
        what: 'emailAndPassword + /api/auth/* handlers.',
        where: 'server/utils/auth.ts, server/api/auth/*, shared/types/auth.ts.',
        how: 'createAuth с plugins; catch-all или отдельные handlers по доке Nuxt.',
        verify: 'Checkpoint: register → login → logout через Postman/curl.',
      },
      {
        label: 'День 3: Protected routes (server)',
        what: '401 без сессии; Task.userId; guard на /api/tasks*.',
        where: 'server/middleware/ или guards в server/utils/auth.ts.',
        how: 'Защитить /api/tasks*; связать Task с User (миграция при необходимости).',
        verify: 'Checkpoint: GET /api/tasks без cookie → 401.',
      },
      {
        label: 'День 4: useAuth + Login/Register pages',
        what: 'Composable + формы; редиректы и loading states.',
        where: 'app/composables/useAuth.ts, app/pages/login.vue, app/pages/register.vue.',
        how: 'useApi для мутаций; редирект после логина → /tasks; CSS Modules.',
        verify: 'Checkpoint: полный флоу в браузере — register → login → задачи.',
      },
      {
        label: 'День 5: User menu + Pages middleware',
        what: 'Защита /tasks; условный UI; меню пользователя.',
        where: 'app/middleware/auth.ts, layout/header, useAuth().user.',
        how: 'Редирект с /tasks на /login; имя + кнопка «Выйти»; routeRules (опц.).',
        verify: 'Checkpoint: без логина /tasks недоступна.',
      },
      {
        label: 'День 6: RBAC + owner checks',
        what: 'Поле role; requireRole; ограничение DELETE.',
        where: 'prisma/schema.prisma (User.role), server/utils/auth.ts.',
        how: 'DELETE task — владелец или ADMIN; опц. GET /api/admin/users.',
        verify: 'Checkpoint: USER → admin-действия 403; ADMIN удаляет чужие задачи.',
      },
      {
        label: 'День 7: Refactor + security + architecture.md',
        what: 'Thin handlers, lint/build, полный тест auth flow.',
        where: 'server/utils/, docs/architecture.md.',
        how: 'pnpm lint:all && pnpm build; секция auth в architecture.md.',
        verify: 'Checkpoint: register → CRUD tasks → logout → 401; architecture.md с секцией auth.',
      },
    ]),
    doneWhen: doneWhen(4, [
      'День 1: better-auth + @better-auth/prisma-adapter + @onmax/nuxt-better-auth установлены',
      'День 1: prisma/schema.prisma — User + Session + Task.userId; server/utils/auth.ts с betterAuth()',
      'День 1: миграция add_better_auth + prisma generate; pnpm dev без ошибок',
      'День 1: AUTH_SECRET в runtimeConfig / .env (не в git)',
      'Register, login, logout (API + UI)',
      '/api/tasks защищён — 401 без сессии',
      '/tasks недоступна без логина (pages middleware)',
      'Роли USER/ADMIN; DELETE — владелец или ADMIN',
      'AUTH_SECRET только server-side',
      'docs/architecture.md обновлён',
      'pnpm lint:all, build — чисто',
    ]),
  },
  {
    id: 5,
    title: 'Error Handling + API + Zod',
    theme: 'apiHandler, unified responses, валидация',
    goal: 'Единый стиль API: apiHandler, createError, полная Zod-валидация, { data, success, error }.',
    theory: theoryItems(
      'REST, статусы, CORS (same-origin в Nuxt)',
      'Nitro middleware, createError',
    ),
    practice: practice(5, [
      'server/utils/apiHandler.ts — обёртка handler + try/catch',
      'server/middleware/log.ts — method + path + duration',
      'POST /api/echo + страница /playground',
      'docs/api-conventions.md — { data, success, error? }',
    ]),
    doneWhen: doneWhen(5, ['Ошибки → предсказуемый JSON', 'Middleware логирует duration в dev']),
  },
  {
    id: 6,
    title: 'Advanced CRUD + Projects',
    theme: 'Relations, пагинация, filters, optimistic',
    goal: 'Projects + relations, пагинация, filters, optimistic updates (CJ-style).',
    theory: theoryItems('Zod на границе API', 'Пагинация и фильтры в query'),
    practice: practice(6, [
      'readValidatedBody / server/utils/validate.ts',
      'Zod для tasks (create/update/query)',
      'Пагинация ?page=&limit=&q=',
      'Модель Project, relation с Task',
      '/projects, /projects/[id]',
    ]),
    doneWhen: doneWhen(6, ['Invalid body → 400 с issues', 'Пагинация на 20+ seed']),
  },
  {
    id: 7,
    title: 'Testing + File Uploads',
    theme: 'Vitest, avatars',
    goal: 'Vitest + file uploads (аватары, как в Travel Log).',
    theory: theoryItems('Vitest + @nuxt/test-utils', 'Upload и лимиты размера'),
    practice: practice(7, [
      'Vitest + @nuxt/test-utils',
      'Тесты: health, auth, task CRUD',
      'Upload avatar → POST /api/users/avatar',
      '/profile',
    ]),
    doneWhen: doneWhen(7, ['pnpm test проходит', 'Upload с лимитом размера']),
  },
  {
    id: 8,
    title: 'Logging, Cache, Deploy',
    theme: 'Pino, health, production',
    goal: 'Pino logging, health checks, deploy (Vercel/Railway + Prisma), migrations on start.',
    theory: theoryItems('Structured logging', 'Health check с DB', 'Deploy Nuxt + Postgres'),
    practice: practice(8, [
      'Pino в server/utils/logger.ts',
      '(Optional) Redis cache',
      'Health + DB check',
      'Deploy (Railway / Hetzner / Vercel)',
      'docs/deployment-production.md',
    ]),
    doneWhen: doneWhen(8, ['Staging URL, health db: connected', 'Migrations on deploy']),
  },
  {
    id: 9,
    title: 'Admin Dashboard',
    theme: 'Nuxt UI tables + /admin',
    goal: 'Admin Dashboard (@nuxt/ui + protected /admin).',
    theory: theoryItems('@nuxt/ui', 'Admin layout и таблицы'),
    practice: practice(9, [
      '@nuxt/ui, layout /admin',
      'Users, tasks, projects tables',
      'GET /api/admin/stats',
    ]),
    doneWhen: doneWhen(9, ['ADMIN в /admin', 'USER → 403']),
  },
  {
    id: 10,
    title: 'Real-time (SSE)',
    theme: 'Live updates задач',
    goal: 'SSE live updates на /tasks.',
    theory: theoryItems('SSE vs WebSocket в Nitro', 'Подписка на изменения tasks'),
    practice: practice(10, [
      'SSE /api/tasks/stream или WebSocket',
      'Live update на /tasks',
      'docs/realtime.md',
    ]),
    doneWhen: doneWhen(10, ['Два браузера — изменения синхронизируются']),
  },
  {
    id: 11,
    title: 'SaaS Core (Workspaces + Billing)',
    theme: 'Multi-tenant, Stripe',
    goal: 'Workspaces (multi-tenant) + Stripe webhooks.',
    theory: theoryItems('Workspace + members', 'Stripe test checkout', 'Free plan limits'),
    practice: practice(11, [
      'Workspace, WorkspaceMember',
      'Stripe test checkout + webhook',
      'Free plan: max 3 projects',
    ]),
    doneWhen: doneWhen(11, ['Stripe test session работает', 'Workspace изолирован от других']),
  },
  {
    id: 12,
    title: 'Polish + CI/CD + Docs',
    theme: 'Финальный релиз',
    goal: 'Polish, CI/CD, README — финальный релиз Task Board.',
    theory: theoryItems('CI pipeline', 'README и demo', 'Edge cases UX'),
    practice: practice(12, [
      '.github/workflows/ci.yml',
      'README: demo, stack, screenshots',
      'Полировка UX, edge cases',
    ]),
    doneWhen: doneWhen(12, ['CI зелёный', 'Можешь объяснить путь: кнопка → API → БД → UI']),
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
 * Bumped to 4 after Week 3 (Better Auth + RBAC — план 2026-06-10).
 */
export const CURRENT_ROADMAP_WEEK_ID = 4

export function getRoadmapTaskLabelMap(): Map<string, string> {
  const map = new Map<string, string>()

  for (const week of ROADMAP_WEEKS) {
    for (const item of [...week.practice, ...week.doneWhen]) {
      map.set(item.id, item.label)
    }
  }

  return map
}
