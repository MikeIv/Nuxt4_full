# 12-недельный план: Nuxt 4 Fullstack (Better Auth + CJ Style)

**Стек**: Nuxt 4 (Nitro) + **Prisma** + **Better Auth** + TypeScript.
**Вдохновение**: архитектура, UX и full-stack flow из курса CJ (Syntax Travel Log).

**Главный продукт**: мини-SaaS «Task Board» (задачи, проекты, workspaces, роли, Stripe).

**Темп**: 7–10 ч/неделю. **Текущая неделя: 6** (недели 1–5 ✓).

---

## Как пользоваться

1. В начале недели — прочитай «Теорию», открой `.planning/brief.md` (из `brief-template.md`).
2. Реализуй только задачи недели.
3. В конце: `pnpm lint:all`, `pnpm build`, commit `week-N: …`.
4. В `.planning/state.md` (локально) веди текущую неделю и чекбоксы.

**Правила проекта:**

- API на клиенте — только `useApi` / `useApiFetch`.
- Server routes — `server/api/`; auth — [неделя 4](#неделя-4--better-auth--rbac--protected-routes) ✓; Zod + unified API — [неделя 5](#неделя-5--error-handling--unified-api--zod) ✓.
- Минимальный diff.

**Структура папок:** [architecture.md](architecture.md) — зачем `shared/`, куда класть handlers/utils/plugins, слои типов.

---

## Обзор

| Нед | Тема                                       | Ключевой результат                            |
| --- | ------------------------------------------ | --------------------------------------------- |
| 1   | ✅ Основы Nitro + Prisma + Tasks UI        | Health, CRUD Tasks, useTasks + optimistic     |
| 2   | ✅ Углубление Nitro + Prisma + Tasks       | Filters, middleware, validation, owner checks |
| 3   | ✅ Polish Tasks + Architecture + Auth prep | Refactor, architecture.md, UX, tests prep     |
| 4   | ✅ Better Auth + RBAC + Protected Routes   | Auth API/UI, middleware, roles USER/ADMIN     |
| 5   | ✅ Error Handling + Unified API + Zod      | apiHandler, Zod, useApi, errorHandler         |
| 6   | **Advanced CRUD + Projects**               | Relations, pagination, filters, optimistic    |
| 7   | Testing + File Uploads                     | Vitest, avatars, task attachments             |
| 8   | Logging, Cache, Deploy                     | Pino, Nitro cache, deploy, monitoring         |
| 9   | Admin Dashboard                            | Nuxt UI, /admin, RBAC, bulk actions           |
| 10  | Real-time (SSE)                            | Live updates, broadcaster, useSSE             |
| 11  | SaaS Core (Workspaces + Billing)           | Multi-tenant, Stripe, limits                  |
| 12  | Polish + CI/CD + Docs                      | Production-ready, CI, docs, deploy            |

---

## Неделя 1 — Основы Nitro + Prisma + Tasks UI ✅

**Цель недели:** построить крепкий фундамент проекта: серверную часть (Nitro), подключить базу данных (Prisma) и реализовать базовый CRUD для задач с удобным интерфейсом.

**Ключевые результаты недели:**

- Работающий dev-сервер и health check
- Подключённая PostgreSQL база через Prisma
- Полноценный CRUD задач (создание, чтение, обновление, удаление)
- Client-side composable `useTasks` с optimistic updates
- Базовая архитектура проекта (структура папок, utils, types)

| День | Checkpoint                                              |
| ---- | ------------------------------------------------------- |
| 1    | ✅ Контракт: HealthResponse в shared/types/             |
| 2    | ✅ Thin handler: health.get.ts + server/utils/health.ts |
| 3    | ✅ End-to-end: health на главной (useApiFetch + SSR)    |
| 4    | ✅ POST /api/health                                     |
| 5    | ✅ Middleware: лог каждого запроса                      |
| 6    | ✅ runtimeConfig + типизация                            |
| 7    | ✅ Актуализировать docs/architecture.md                 |
| 8    | ✅ Boot plugin 00-boot.ts                               |
| 9    | ✅ apiResponse.ok(data)                                 |

### ✅ Контракт: `shared/types/health.ts`

**Теория:**

Сделано. HealthResponse в shared/types/ (#shared) — один тип для handler, utils и useApiFetch. types/ в корне — только augmentation (nuxt-public.d.ts).

**Практика (пошагово):**

Зафиксировать форму JSON-ответа /api/health — shared/types/health.ts (#shared).

export interface HealthResponse { status, timestamp, version, … }.

Проверка: typecheck OK. Тип используется в handler, utils и useApiFetch.

### ✅ Thin handler: `health.get.ts` + `server/utils/health.ts`

**Теория:**

Сделано. server/api/health.get.ts → return getHealthPayload(). Вся логика в server/utils/health.ts. getHealthPayload автоимпортируется в Nitro после перезапуска dev-сервера.

**Практика (пошагово):**

Тонкий handler, логика в getHealthPayload() — server/api/health.get.ts + server/utils/health.ts.

Handler: return getHealthPayload(). Utils: полный HealthResponse.

Проверка: /api/health → JSON. Handler без бизнес-логики.

### ✅ End-to-end: health на главной (`useApiFetch` + SSR)

**Теория:**

Сделано. app/pages/index.vue: useApiFetch<HealthResponse>("/api/health") с pending/error. Полный цикл client ↔ server до POST и middleware.

**Практика (пошагово):**

Те же данные health на UI — полный цикл client ↔ server — app/pages/index.vue.

useApiFetch<HealthResponse>("/api/health") + pending/error.

Проверка: Главная и /api/health — одни поля. SSR в View Source.

### ✅ POST и naming convention Nitro

**Теория:**

Сделано. server/api/health.post.ts → POST /api/health. readHealthPostBody → buildHealthPostResponse. HealthPostBody/HealthPostResponse в shared/types/.

**Практика (пошагово):**

Учебный POST на тот же путь — readBody, naming convention Nitro — server/api/health.post.ts (не \_health.post.ts).

readHealthPostBody → buildHealthPostResponse. Типы в shared/types/health.ts.

Проверка: curl -X POST …/api/health -d '{"ping":1}' → JSON с received + echo. GET без регрессий.

### ✅ `server/middleware/log.ts` — порядок middleware → handler

**Теория:**

Сделано. Лог [nitro] method path на каждый HTTP-запрос до handler. На нед. 5 — duration, apiHandler.

**Практика (пошагово):**

Лог method + path; понимание порядка middleware → handler — server/middleware/log.ts.

console.log("[nitro]", event.method, event.path). Без секретов.

Проверка: Логи при запросах /, /api/health и POST /api/health.

### ✅ runtimeConfig + типизация

**Теория:**

Сделано. .env.example, types/nuxt-public.d.ts, server/utils/runtimeConfig.ts (useServerRuntimeConfig, warnIfExampleSecretMissing). Секреты не в браузере и не в JSON health.

**Практика (пошагово):**

Финализировать apiBase, nuxt-public.d.ts, .env.example, server/utils/runtimeConfig.ts — nuxt.config.ts, types/nuxt-public.d.ts, .env.example, server/utils/runtimeConfig.ts.

useServerRuntimeConfig в utils. warnIfExampleSecretMissing в 00-boot.ts (dev). version в health из config.

Проверка: useRuntimeConfig() на клиенте — только public.\*. TS без ошибок на config.public.appVersion.

### ✅ Документация: `docs/architecture.md`

**Теория:**

Сделано. GET/POST потоки, дерево server/, роли shared/types/, runtimeConfig. Client → middleware → api → utils → (DB).

**Практика (пошагово):**

Схема потока данных и роли папок — по фактическому коду недели — docs/architecture.md.

GET/POST потоки, дерево server/, shared/types/, runtimeConfig.

Проверка: Объясняешь путь /api/health без открытия кода.

### ✅ `server/plugins/00-boot.ts`

**Теория:**

Сделано. defineNitroPlugin — лог при старте Nitro (dev). Отличие от middleware/log.ts (на каждый запрос).

**Практика (пошагово):**

Лог один раз при старте Nitro — server/plugins/00-boot.ts.

defineNitroPlugin + useServerRuntimeConfig; dev-only console.log.

Проверка: Сообщение [nitro] boot при pnpm dev; не на каждый запрос.

### ✅ `server/utils/apiResponse.ts` — ok(data)

**Теория:**

Сделано. ok<T>(data) => { data }. На нед. 2 — { data, success, error? } в CRUD /api/tasks.

**Практика (пошагово):**

Заготовка единого формата ответа; на нед. 2 — в CRUD tasks — server/utils/apiResponse.ts.

ok<T>(data: T) => ({ data }).

Проверка: typecheck OK; health не использует ok().

**Done when (неделя):**

- ✅ Есть GET /api/health и POST /api/health
- ✅ Health отображается на главной странице (useApiFetch)
- ✅ Работает middleware-логгер (method + path)
- ✅ Понимаешь разницу public / private в runtimeConfig
- ✅ Есть и актуален docs/architecture.md
- ✅ Понимаешь структуру: app/, server/, shared/types/, server/utils/
- ✅ Handlers тонкие — бизнес-логика только в server/utils/

**UI `/roadmap`:** детальный чеклист — [неделя 1 на `/roadmap`](/roadmap) (вкладка «Нед 1»).

---

## Неделя 2 — Углубление в Nitro + Prisma + Улучшение Tasks ✅

**Цель недели:** углубить понимание серверной части Nuxt (Nitro), улучшить работу с Prisma и сделать CRUD задач более удобным и надёжным.

**Ключевые результаты недели:**

- PostgreSQL + Prisma singleton + модель Task
- CRUD /api/tasks — types → utils → handlers
- curl-чеклист + persistence после restart Docker
- Thin handlers — Prisma только в server/utils/

| День | Checkpoint                                   |
| ---- | -------------------------------------------- |
| 1    | ✅ День 1: docker-compose.yml + PostgreSQL   |
| 2    | ✅ День 2: Prisma init + prisma.ts singleton |
| 3    | ✅ День 3: модель Task + migrate + seed      |
| 4    | ✅ День 4: types + utils + GET/POST          |
| 5    | ✅ День 5: PATCH/DELETE + ошибки             |
| 6    | ✅ День 6: curl-чеклист + persistence        |
| 7    | ✅ День 7: architecture.md + lint/build      |

### Docker Compose + PostgreSQL

**Теория:**

docker-compose.yml, volumes, DATABASE_URL только server-side. Checkpoint дня 1: docker compose ps healthy.

### Prisma: init, singleton, migrate

**Теория:**

prisma init, singleton prisma.ts (globalThis в dev). Checkpoint дня 2: $connect() без ошибок.

### Модель Task + seed

**Теория:**

migrate dev + seed 3–5 задач (рекомендуется). Checkpoint дня 3: Prisma Studio с данными.

### Порядок endpoint: types → utils → handler

**Теория:**

День 4: shared/types/task.ts + utils + GET/POST. День 5: PATCH/DELETE + createError 404/400. Prisma не в handlers.

### Verify: curl-чеклист + persistence

**Теория:**

День 6: create → list → patch → delete → docker restart. День 7: architecture.md + lint/build. UI — нед. 3.

### ✅ День 1: docker-compose.yml + PostgreSQL

**Практика (пошагово):**

Локальная БД в Docker с persistent volume — docker-compose.yml, .env, .env.example.

PostgreSQL 16; docker compose up -d; DATABASE_URL в .env.

Checkpoint: docker compose ps — postgres healthy.

**Done when (день 1):** docker compose ps — postgres healthy.

### ✅ День 2: Prisma init + prisma.ts singleton

**Практика (пошагово):**

ORM подключён к Nitro; Client не на каждый запрос — prisma/schema.prisma, server/utils/prisma.ts, scripts db:migrate, db:studio.

pnpm add prisma @prisma/client; prisma init; singleton + runtimeConfig private.

Checkpoint: dev стартует; prisma $connect() OK.

**Done when (день 2):** dev стартует; prisma $connect() OK.

### ✅ День 3: модель Task + migrate + seed

**Практика (пошагово):**

Таблица Task и 3–5 seed-задач для быстрого GET — prisma/schema.prisma, prisma/seed.ts, package.json db:seed.

model Task { id, title, description, completed, createdAt, updatedAt }; prisma db seed.

Checkpoint: Prisma Studio — seed-данные видны.

**Done when (день 3):** Prisma Studio — seed-данные видны.

### ✅ День 4: types + utils + GET/POST

**Практика (пошагово):**

Первые endpoints после слоёв types/utils — не наоборот — shared/types/task.ts, server/utils/tasks.ts, tasks.get.ts, tasks.post.ts.

getAllTasks/createTask в utils; thin handlers (без Prisma в api).

Checkpoint: POST добавляет строку в БД (Postman); GET возвращает данные.

**Done when (день 4):** POST добавляет строку в БД (Postman); GET возвращает данные.

### ✅ День 5: PATCH/DELETE + ошибки

**Практика (пошагово):**

Оставшийся CRUD + 404/400 — server/utils/tasks.ts, tasks/[id].get|patch|delete.ts.

getTaskById/updateTask/deleteTask; createError 404; Zod на PATCH.

Checkpoint: patch/delete curl; bad id → 404 JSON.

**Done when (день 5):** patch/delete curl; bad id → 404 JSON.

### ✅ День 6: curl-чеклист + persistence

**Практика (пошагово):**

Обязательная ручная verify всего CRUD — terminal + docker compose restart.

create → list → patch → delete → restart → list (см. roadmap).

Checkpoint: все 5 шагов OK; данные в volume после restart.

**Done when (день 6):** все 5 шагов OK; данные в volume после restart.

### ✅ День 7: architecture.md + lint/build

**Практика (пошагово):**

Handlers без Prisma; документ потока данных — docs/architecture.md, все server/api/tasks\*.

Рефактор если нужно; pnpm lint:all && pnpm build.

Checkpoint: architecture.md актуален; сборка зелёная.

**Done when (день 7):** architecture.md актуален; сборка зелёная.

**Done when (неделя):**

- ✅ PostgreSQL запущен через Docker
- ✅ Prisma singleton подключён
- ✅ Seed + migrate выполнены
- ✅ curl-чеклист CRUD пройден
- ✅ Данные после restart Docker
- ✅ Prisma только в server/utils/tasks.ts
- ✅ Обновлён docs/architecture.md

**UI `/roadmap`:** детальный чеклист — [неделя 2 на `/roadmap`](/roadmap) (вкладка «Нед 2»).

---

## Неделя 3 — Fullstack UI: Tasks ✅

**Цель недели:** довести работу с задачами до хорошего уровня: composables, состояния, optimistic updates, SSR и полный цикл БД → API → UI.

**Ключевые результаты недели:**

- Composable useTasks() как источник правды
- Страница /tasks с loading, empty, error
- Optimistic toggle с rollback
- Данные сохраняются после перезапуска Docker + Nuxt

| День | Checkpoint                                 |
| ---- | ------------------------------------------ |
| 1    | ✅ День 1: app/composables/useTasks.ts     |
| 2    | список и создание                          |
| 3    | ✅ День 3: Loading / Empty / Error + toast |
| 4    | ✅ День 4: Optimistic toggle + rollback    |
| 5    | ✅ День 5: SSR, persistence, фильтры       |
| 6-7  | ✅ День 6-7: Рефакторинг + docs            |

### useApiFetch + composables (useTasks())

**Теория:**

Единый composable как источник правды. useAsyncData / useApiFetch + кэширование. Методы: fetch, create, update, delete, toggleComplete.

### Управление состоянием на клиенте

**Теория:**

ref / computed для списка, формы, фильтров. Локальное состояние + синхронизация с сервером.

### Loading / Error / Empty states

**Теория:**

Skeleton во время загрузки, пустое состояние, ошибка + кнопка «Повторить».

### SSR + клиентская гидратация

**Теория:**

Данные на сервере, без лишних перезагрузок на клиенте. Проверка hydration.

### Оптимистичные обновления (базово)

**Теория:**

Toggle completed: меняем UI сразу, подтверждаем на сервере. Rollback при ошибке.

### Best practices Nuxt 4

**Теория:**

refresh() после мутаций, защита от двойных кликов, чистый переиспользуемый код.

### ✅ День 1: app/composables/useTasks.ts

**Практика (пошагово):**

Composable-обёртка над API задач с кэшированием — app/composables/useTasks.ts.

useApiFetch для списка; useApi для мутаций. Типы из shared/types/task.ts.

Проверка: Composable возвращает tasks + pending/error + actions. Используется без дублирования fetch в компонентах.

**Done when (день 1):** Composable возвращает tasks + pending/error + actions. Используется без дублирования fetch в компонентах.

### ✅ День 2: Страница /tasks — список и создание

**Практика (пошагово):**

Базовый CRUD-интерфейс: список + форма добавления — app/pages/tasks.vue (+ опц. мелкие компоненты в app/components/).

Карточки или таблица на $style. Форма (title + description). Кнопки Toggle / Edit / Delete. Подключить useTasks().

Проверка: Можно создать задачу через UI; список обновляется; данные приходят из БД.

**Done when (день 2):** Можно создать задачу через UI; список обновляется; данные приходят из БД.

### ✅ День 3: Loading / Empty / Error + toast

**Практика (пошагово):**

Обязательные состояния интерфейса и обратная связь — app/pages/tasks.vue + простой toast (composable или inline).

Skeleton при pending; Empty когда нет задач; Error + «Повторить»; уведомления об успехе/ошибке.

Проверка: При ошибке сети — показывается error state с кнопкой. При пустом списке — empty. Toast появляется.

**Done when (день 3):** При ошибке сети — показывается error state с кнопкой. При пустом списке — empty. Toast появляется.

### ✅ День 4: Optimistic toggle + rollback

**Практика (пошагово):**

UX без задержек: мгновенное изменение + безопасный откат — useTasks.ts + tasks.vue (локальный список + mutate).

При toggle: сразу обновить completed в UI, вызвать API; при ошибке — откатить и показать toast. refresh после мутаций.

Проверка: Toggle работает мгновенно. При сетевой ошибке состояние возвращается; данные консистентны.

**Done when (день 4):** Toggle работает мгновенно. При сетевой ошибке состояние возвращается; данные консистентны.

### ✅ День 5: SSR, persistence, фильтры

**Практика (пошагово):**

Проверка fullstack после перезапусков + удобство — app/pages/tasks.vue + docker compose.

Проверить HTML при SSR (данные видны до гидратации). docker compose restart postgres + nuxt dev → данные на месте. Добавить фильтр (все/активные/завершённые) и сортировку.

Проверка: После рестарта БД и сервера список задач прежний. Фильтр работает, UI отзывается.

**Done when (день 5):** После рестарта БД и сервера список задач прежний. Фильтр работает, UI отзывается.

### ✅ День 6-7: Рефакторинг + docs

**Практика (пошагово):**

Чистота кода и актуализация документации — useTasks.ts, tasks.vue, docs/architecture.md.

Вынести дубли (если есть); добавить комментарии; обновить architecture.md (поток /tasks, useTasks → api → utils → prisma); полный ручной тест флоу.

Проверка: lint + build зелёные. architecture.md содержит секцию по UI tasks. Полный цикл работает.

**Done when (день 6):** lint + build зелёные. architecture.md содержит секцию по UI tasks. Полный цикл работает.

**Done when (неделя):**

- ✅ Есть полноценная страница /tasks с CRUD
- ✅ Работают loading, empty и error состояния
- ✅ Используется composable useTasks()
- ✅ Optimistic updates на toggle completed (с rollback)
- ✅ Данные сохраняются после перезапуска Docker + Nuxt
- ✅ Страница красиво выглядит и удобно используется
- ✅ docs/architecture.md обновлён

**UI `/roadmap`:** детальный чеклист — [неделя 3 на `/roadmap`](/roadmap) (вкладка «Нед 3»).

---

## Неделя 4 — Better Auth + RBAC + Protected Routes ✅

**Цель недели:** внедрить современную production-ready систему авторизации с минимальным boilerplate и настроить защиту роутов на сервере и клиенте.

**Ключевые результаты недели:**

- Better Auth + Prisma adapter + Nuxt module
- Register / login / logout (API + UI)
- Protected /api/tasks и /tasks
- RBAC USER / ADMIN

| День | Checkpoint                                          |
| ---- | --------------------------------------------------- |
| 1    | Шаг 1: Установка пакетов                            |
| 1    | Шаг 2: Prisma schema (User + Session + Task.userId) |
| 1    | Шаг 3: server/utils/auth.ts                         |
| 1    | Шаг 4: nuxt.config.ts — модуль                      |
| 1    | Шаг 5: Переменные окружения                         |
| 1    | Шаг 6: Миграция + generate                          |
| 1    | Шаг 7: Проверка старта                              |
| 2    | Шаг 1: Catch-all /api/auth/\*                       |
| 2    | Шаг 2: Register / Login / Logout (curl)             |
| 2    | Шаг 3: getSession в server/utils/auth.ts            |
| 2    | Шаг 4: server/middleware/auth.ts                    |
| 2    | Шаг 5: /api/tasks\* → userId из сессии              |
| 3    | Шаг 1: Проверка всех tasks routes                   |
| 3    | Шаг 2: Owner checks в utils                         |
| 3    | Шаг 3: Типизация event.context                      |
| 4    | ✅ День 4: useAuth + Login/Register pages           |
| 5    | ✅ День 5: User menu + Pages middleware             |
| 6    | ✅ День 6: RBAC + owner checks                      |
| 7    | ✅ День 7: Refactor + security + architecture.md    |

### День 1 — Что такое Better Auth?

**Теория (30–45 мин):**

Современная auth-библиотека (2025–2026): email/password, cookie-sessions, OAuth, 2FA, organizations, rate limiting. Меньше boilerplate, чем Lucia. Интеграция с Nuxt: better-auth.com/docs/integrations/nuxt + модуль @onmax/nuxt-better-auth.

Adapter — связь Better Auth с Prisma (@better-auth/prisma-adapter). Better Auth Instance — главный объект betterAuth(). Schema Generation — CLI для таблиц User/Session (или ручная схема). runtimeConfig — AUTH_SECRET и др. только server-side.

Nuxt Integration: better-auth.com/docs/integrations/nuxt. Prisma Adapter: better-auth.com/docs/adapters/prisma. Модуль: @onmax/nuxt-better-auth@alpha.

**Практика (пошагово):**

Основной пакет, Prisma adapter и Nuxt-модуль — package.json.

pnpm add better-auth @better-auth/prisma-adapter @onmax/nuxt-better-auth@alpha.

Проверка: Пакеты в dependencies; pnpm install без ошибок.

Модели Better Auth + role для RBAC + связь Task → User — prisma/schema.prisma.

User (id, email, emailVerified, image, role @default("USER"), sessions, tasks). Session (token, expiresAt, userId, ipAddress, userAgent). Task: userId + relation onDelete Cascade.

Проверка: schema.prisma валиден; связи User ↔ Session ↔ Task согласованы.

Better Auth instance с prismaAdapter и emailAndPassword — server/utils/auth.ts.

betterAuth({ database: prismaAdapter(prisma, { provider: "postgresql" }), emailAndPassword: { enabled: true, autoSignIn: true, minPasswordLength: 8 }, appName: "Task Board", secret: process.env.AUTH_SECRET }).

Проверка: typecheck OK; импорт prisma из server/utils/prisma.ts.

Подключить @onmax/nuxt-better-auth — nuxt.config.ts.

modules: ['@onmax/nuxt-better-auth']; секция betterAuth: { … } по доке модуля.

Проверка: Nuxt стартует; модуль в списке modules.

DATABASE_URL и AUTH_SECRET (мин. 32 символа) — .env, .env.example, nuxt.config runtimeConfig (private).

openssl rand -hex 32 для AUTH_SECRET. DATABASE_URL=postgresql://…. Не коммитить .env.

Проверка: AUTH_SECRET в private runtimeConfig; .env.example обновлён.

Применить схему к PostgreSQL — prisma/migrations/.

pnpm exec prisma migrate dev --name add_better_auth && pnpm exec prisma generate.

Проверка: Миграция применена; Prisma Client сгенерирован.

Сервер без ошибок Prisma/auth; таблицы в Studio — терминал, Prisma Studio.

pnpm dev — смотреть логи Nitro. pnpm prisma studio — таблицы User и Session.

Checkpoint: pnpm dev без ошибок auth/Prisma; User и Session видны в Studio.

**Done when (день 1):** Пакеты в dependencies; pnpm install без ошибок.

### Nuxt integration (дни 2–5)

**Теория:**

Middleware, composables, routeRules. Меньше ручной работы с sessions/cookies vs Lucia.

### Server vs pages middleware

**Теория:**

Guards для /api/tasks\*; app/middleware/auth.ts для /tasks. 401 без сессии.

### Authentication vs authorization (RBAC)

**Теория:**

День 6: role USER | ADMIN; owner checks; DELETE task — владелец или ADMIN.

### CJ-style UX

**Теория:**

Loading/error states на login/register; редиректы после auth; user menu.

### ✅ День 2 — Шаг 1: Catch-all /api/auth/\*

**Практика (пошагово):**

Проксировать все auth-запросы в Better Auth handler — server/api/auth/[...all].ts, server/utils/auth.ts.

import { auth } from "../../utils/auth"; auth.handler(toWebRequest(event)). Официальная дока Nuxt/Better Auth — с toWebRequest; без него можно только если проверил, что handler отвечает.

Проверка: pnpm dev; GET /api/auth/sign-in/email → 405 (method not allowed) — норма.

Проверить email/password API без UI — терминал / Postman.

POST /api/auth/sign-up/email { email, password, name }; POST /api/auth/sign-in/email; POST /api/auth/sign-out; GET /api/auth/get-session. Не /api/auth/session — такого endpoint нет.

Проверка: sign-up → user в БД; sign-in → Set-Cookie + session; get-session → user; sign-out → null.

Утилита для чтения сессии из заголовков запроса — server/utils/auth.ts.

export async function getSession(event) { return auth.api.getSession({ headers: event.headers }) }.

Проверка: typecheck OK; после sign-in getSession возвращает { session, user }.

401 для защищённых API без сессии — server/middleware/auth.ts.

Пропускать /api/auth/**, /api/health, /api/notes-access/**. Иначе getSession → 401. event.context.session и event.context.user для handlers.

Проверка: GET /api/tasks без cookie → 401 JSON Unauthorized.

Thin handlers читают user из context; Prisma-фильтр в utils — server/api/tasks\*.ts, server/utils/tasks.ts.

const userId = event.context.user?.id; getAllTasks(userId), createTask(body, userId). Убрать resolveDefaultTaskUserId после проверки.

Проверка: С сессией — только свои задачи; без сессии — 401 (middleware).

**Done when (день 2):** pnpm dev; GET /api/auth/sign-in/email → 405 (method not allowed) — норма.

### ✅ День 3 — Шаг 1: Проверка всех tasks routes

**Практика (пошагово):**

401 на GET/POST/PATCH/DELETE без cookie — curl / Postman.

Прогнать все /api/tasks\* без cookie → 401. С cookie после login → 200/201.

Checkpoint: 5 endpoints tasks защищены одинаково.

PATCH/DELETE чужой задачи → 404 (не раскрывать существование) — server/utils/tasks.ts, server/api/tasks/[id].\*.

getTaskById/updateTask/deleteTask с userId; handler → createError 404 если null.

Проверка: User A не видит и не меняет задачи User B.

session и user в Nitro context без any — types/nuxt-h3.d.ts или server/types/.

declare module h3 { interface H3EventContext { session?: …; user?: … } } — типы из auth.$Infer.Session.

Проверка: typecheck OK; handlers используют event.context.user.id.

**Done when (день 3):** 5 endpoints tasks защищены одинаково.

### ✅ День 4: useAuth + Login/Register pages

**Практика (пошагово):**

Composable + формы; редиректы и loading states — app/composables/useAuth.ts (или composables модуля @onmax/nuxt-better-auth), app/pages/login.vue, app/pages/register.vue.

useApi для POST sign-in/email, sign-up/email; useApiFetch get-session при старте; редирект после логина → /tasks; CSS Modules.

Checkpoint: полный флоу в браузере — register → login → задачи.

**Done when (день 4):** полный флоу в браузере — register → login → задачи.

### ✅ День 5: User menu + Pages middleware

**Практика (пошагово):**

Защита /tasks; условный UI; меню пользователя — app/middleware/auth.ts, layout/header.

/tasks без сессии → /login; /login|/register с сессией → /tasks. Имя + «Выйти». routeRules — опционально.

Checkpoint: без логина /tasks недоступна; с логином /login редиректит.

**Done when (день 5):** без логина /tasks недоступна; с логином /login редиректит.

### ✅ День 6: RBAC + owner checks

**Практика (пошагово):**

Поле role; requireRole; ограничение DELETE — prisma/schema.prisma (User.role), server/utils/auth.ts.

DELETE task — владелец или ADMIN; опц. GET /api/admin/users.

Checkpoint: USER → admin-действия 403; ADMIN удаляет чужие задачи.

**Done when (день 6):** USER → admin-действия 403; ADMIN удаляет чужие задачи.

### ✅ День 7: Refactor + security + architecture.md

**Практика (пошагово):**

Thin handlers, lint/build, полный тест auth flow — server/utils/, docs/architecture.md.

pnpm lint:all && pnpm build; секция auth в architecture.md.

Checkpoint: register → CRUD tasks → logout → 401; architecture.md с секцией auth.

**Done when (день 7):** register → CRUD tasks → logout → 401; architecture.md с секцией auth.

**Done when (неделя):**

- ✅ День 1: better-auth + @better-auth/prisma-adapter + @onmax/nuxt-better-auth установлены
- ✅ День 1: prisma/schema.prisma — User + Session + Task.userId; server/utils/auth.ts с betterAuth()
- ✅ День 1: миграция add_better_auth_verification + prisma generate; pnpm dev без ошибок
- ✅ День 1: AUTH_SECRET в runtimeConfig / .env (не в git)
- ✅ День 1: docs/architecture.md — секция auth (день 1)
- ✅ Register, login, logout (API + UI)
- ✅ /api/tasks защищён — 401 без сессии
- ✅ /tasks недоступна без логина (pages middleware)
- ✅ Роли USER/ADMIN; DELETE — владелец или ADMIN
- ✅ AUTH_SECRET только server-side
- ✅ pnpm lint:all, build — чисто

**UI `/roadmap`:** детальный чеклист — [неделя 4 на `/roadmap`](/roadmap) (вкладка «Нед 4»).

---

## Неделя 5 — Error Handling + Unified API + Zod ✅

**Цель недели:** внедрить единообразный слой API с валидацией, обработкой ошибок и понятными ответами для клиента.

**Ключевые результаты недели:**

- Unified response format (`{ success, data, error? }`)
- `apiHandler` — обёртка для всех роутов
- Zod-валидация на сервере
- Адаптированный client-side (`useApi` / `useApiFetch`)

| День | Checkpoint                             |
| ---- | -------------------------------------- |
| 1    | Шаг 1: server/utils/response.ts        |
| 1    | Шаг 2: server/utils/apiHandler.ts      |
| 1    | Шаг 3: nuxt.config (при необходимости) |
| 2    | Шаг 1: Zod + схемы tasks               |
| 2    | Шаг 2: server/utils/validation.ts      |
| 3    | GET и POST /api/tasks                  |
| 4    | PATCH, DELETE, GET [id] + owner checks |
| 5    | useApi / useApiFetch                   |
| 6    | Глобальный error handler               |
| 7    | Verify + docs + commit                 |

### День 1 — Unified API responses

**Теория:**

Контракт { data, success, error? } вместо «голого» JSON. successResponse / errorResponse / sendApiResponse в server/utils/response.ts. apiHandler — обёртка handler с try/catch и единым форматом ответа.

**Практика (пошагово):**

Утилиты successResponse, errorResponse, sendApiResponse — единый контракт { data, success, error? } — server/utils/response.ts (рядом с apiResponse.ts; постепенная миграция с ok()).

successResponse(data) → { data, success: true }; errorResponse(message, code?) → { success: false, error }; sendApiResponse(event, payload, status?).

Проверка: typecheck OK; импорт из Nitro handler без циклических deps.

Главная обёртка handler: try/catch, маппинг createError → errorResponse, успех → successResponse — server/utils/apiHandler.ts.

export function apiHandler<T>(fn: (event: H3Event) => Promise<T>) => defineEventHandler(async (event) => { … }).

Проверка: Тестовый handler через apiHandler возвращает { success: true, data } или { success: false, error }.

Подключить alias, env, nitro.errorHandler hook — только если нужно для дня 1 — nuxt.config.ts, shared/config/env.ts (опц.).

Без лишних изменений srcDir/ESLint. errorHandler — заготовка на день 6.

Проверка: pnpm dev стартует; checkpoint: есть apiHandler, ответы идут через response utils.

**Done when (день 1):** typecheck OK; импорт из Nitro handler без циклических deps.

### День 2 — Zod на границе API

**Теория:**

Схемы в shared/validations/; validateBody / validateQuery в server/utils/validation.ts. z.infer для типов без дублирования. Invalid body → 400 с issues.

**Практика (пошагово):**

CreateTaskSchema, UpdateTaskSchema (+ опц. query). Типы через z.infer — shared/validations/task.ts (или shared/validations/tasks.ts).

pnpm add zod (если ещё нет). title min(1), description optional, completed boolean optional.

Проверка: typecheck: export type CreateTaskInput = z.infer<typeof CreateTaskSchema>.

validateBody, validateQuery — parse + createError 400 с Zod issues — server/utils/validation.ts.

schema.safeParse(body) → throw createError({ statusCode: 400, data: { issues } }) при fail.

Проверка: Invalid JSON body → 400 с issues в ответе (через apiHandler на день 3+).

**Done when (день 2):** typecheck: export type CreateTaskInput = z.infer<typeof CreateTaskSchema>.

### Дни 3–4 — Рефакторинг tasks API

**Теория:**

Thin handlers: apiHandler + Zod + utils. PATCH (не PUT) для update. Owner checks и RBAC из нед. 4 сохраняются.

### День 5 — Клиент: useApi / useApiFetch

**Теория:**

Обёртки разворачивают success: true → data; success: false → throw с понятной ошибкой. Совместимость с SSR useApiFetch.

**Практика (пошагово):**

Клиент разворачивает success: true → data; иначе throw ApiError — app/composables/useApi.ts, useApiFetch (если отдельно).

После $fetch проверить payload.success; типизировать ApiResponse<T>. useTasks без ручного .data.data.

Checkpoint: useTasks/createTask возвращает чистые данные или кидает ошибку с message.

**Done when (день 5):** useTasks/createTask возвращает чистые данные или кидает ошибку с message.

### День 6 — nitro.errorHandler

**Теория:**

Необработанные ошибки (Zod, Prisma P2002/P2025, Better Auth) → тот же JSON-формат. server/error-handler.ts.

**Практика (пошагово):**

nitro.errorHandler + маппинг Zod, Prisma, Auth → unified JSON — server/error-handler.ts, nuxt.config.ts nitro.errorHandler.

H3Error → errorResponse; Prisma P2025 → 404; P2002 → 409; необработанное → 500 без stack в prod.

Checkpoint: throw без catch в handler → тот же { success: false, error } формат.

**Done when (день 6):** throw без catch в handler → тот же { success: false, error } формат.

### REST, статусы, createError

**Теория:**

Same-origin в Nuxt — CORS не нужен для /api/\*. createError для контролируемых 4xx/5xx внутри handler.

### ✅ День 3 — GET и POST /api/tasks

**Практика (пошагово):**

Переписать tasks.get.ts и tasks.post.ts на apiHandler + Zod — server/api/tasks.get.ts, server/api/tasks.post.ts.

export default apiHandler(async (event) => { requireAuthUser; validateBody для POST; return success data из utils }).

Checkpoint: GET/POST с сессией — { success: true, data }; POST invalid body → 400.

**Done when (день 3):** GET/POST с сессией — { success: true, data }; POST invalid body → 400.

### ✅ День 4 — PATCH, DELETE, GET [id] + owner checks

**Практика (пошагово):**

Остальные tasks routes в едином стиле; owner/RBAC без регрессий — server/api/tasks/[id].get.ts, [id].patch.ts, [id].delete.ts.

apiHandler + validateBody на PATCH; 404 чужой задачи; DELETE — владелец или ADMIN.

Checkpoint: полный CRUD curl/браузер; чужая задача → 404; USER не удаляет чужие.

**Done when (день 4):** полный CRUD curl/браузер; чужая задача → 404; USER не удаляет чужие.

### ✅ День 7 — Verify + docs + commit

**Практика (пошагово):**

Полный auth + tasks flow; lint, typecheck, build; architecture.md — docs/architecture.md, docs/api-conventions.md (опц.).

register → CRUD tasks → invalid body → logout; pnpm verify && pnpm build; секция API conventions.

Checkpoint: pnpm lint:all && pnpm typecheck && pnpm build — чисто; коммит нед. 5.

**Done when (день 7):** pnpm lint:all && pnpm typecheck && pnpm build — чисто; коммит нед. 5.

**Done when (неделя):**

- ✅ apiHandler + response.ts — все новые/рефакторенные handlers через обёртку
- ✅ CreateTaskSchema / UpdateTaskSchema + validateBody
- ✅ GET/POST/PATCH/DELETE /api/tasks — { data, success, error? }
- ✅ useApi разворачивает success и бросает на error
- ✅ nitro.errorHandler — необработанные ошибки в едином формате
- ✅ pnpm lint:all, typecheck, build — чисто
- ✅ docs/architecture.md — секция unified API (день 7)

**UI `/roadmap`:** детальный чеклист — [неделя 5 на `/roadmap`](/roadmap) (вкладка «Нед 5»).

---

## Неделя 6 — Advanced CRUD + Projects (Relations, Pagination, Filters, Optimistic Updates)

**Цель недели:** перейти от простых задач к реальной многосущностной системе: связи между таблицами, пагинация, фильтры и отзывчивый интерфейс с optimistic updates.

**Ключевые результаты недели:**

- Полноценная модель **Project** с связями User → Project → Task
- CRUD проектов + задач внутри проекта
- Пагинация, фильтры и сортировка на API
- Optimistic updates с rollback

| День | Checkpoint                    |
| ---- | ----------------------------- |
| 1    | Relations + Prisma Schema     |
| 2    | Server Utils + CRUD Projects  |
| 3    | Пагинация + Filters (Server)  |
| 4    | Client-side Composables       |
| 5    | UI + Pages (Projects + Tasks) |
| 6    | Optimistic Updates + Refactor |
| 7    | Testing, Polish + Commit      |

### День 1 — Теория Relations + Prisma Schema

**Теория (40–60 мин):**

В реальных приложениях данные почти всегда связаны: один пользователь владеет несколькими проектами, один проект содержит много задач.

• Виды связей (one-to-many, many-to-one) — как описывать «один ко многим»
• @relation в Prisma — как ORM понимает связи между таблицами
• onDelete: Cascade — автоматическое удаление задач при удалении проекта (без «сирот»)
• include / select — один запрос: проект + все его задачи
• Пагинация: cursor-based (эффективнее на больших списках) vs offset (проще для page/limit)
• Naming conventions — projectId, tasks, userId (owner)

**Практика (пошагово):**

Открой prisma/schema.prisma и добавь модель Project:

model Project {
id String @id @default(cuid())
name String
description String?
ownerId String
owner User @relation(fields: [ownerId], references: [id], onDelete: Cascade)
tasks Task[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

В модели Task добавь:

projectId String?
project Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)

(SetNull — чтобы задача осталась, если проект удалили.)

Создай миграцию:
pnpm prisma migrate dev --name add_projects
pnpm prisma generate

Проверь в Prisma Studio: создай проект, задачу с projectId, убедись что связь видна.

Обнови shared/types/: Project, CreateProjectDto, UpdateProjectDto.

Добавь Zod в shared/validations/: name — не пустой, до 100; description — опционально, до 2000.

### День 2 — Server Utils + CRUD Projects

**Теория (30–50 мин):**

Хорошая архитектура — минимум кода в роутах. Вся бизнес-логика и запросы к БД живут в server/utils/ (эталон: tasks.ts).

• Thin handlers — route только вызывает utils и возвращает unified response
• Организация server/utils/projects.ts — getAll, create, getById, update, delete
• Owner checks — пользователь видит и меняет только свои проекты (requireProjectOwner)
• Nested queries — getProjectWithTasks через Prisma include
• Привязка Task → Project при create/update задачи

**Практика (пошагово):**

Создай server/utils/projects.ts:
• createProject(data, userId) — валидирует, сохраняет, возвращает проект
• getAllProjects(userId, query) — проекты пользователя с фильтрами
• getProjectWithTasks(id, userId) — проверяет владельца, include: { tasks: true }
• updateProject, deleteProject — с проверкой ownerId === userId

Создай роуты server/api/projects/:
• .get.ts → getAllProjects
• .post.ts → validate body → createProject
• [id].get.ts, [id].patch.ts, [id].delete.ts

Обнови server/utils/tasks.ts:
• projectId при создании задачи
• фильтр по проекту в getAllTasks

Owner checks: project.ownerId === userId, иначе 403.

### День 3 — Пагинация + Filters (Server)

**Теория (40–60 мин):**

Когда данных много, их загружают порциями и фильтруют на сервере — клиент не должен тянуть весь список.

• Cursor-based pagination — стабильнее при добавлении новых записей; nextCursor в meta
• Offset pagination (page + limit) — проще для таблиц с номерами страниц
• Фильтры и поиск через Prisma where (contains, equals, in)
• Комбинирование: пагинация + search + status + projectId
• Zod query-схемы — валидация ?limit=&cursor=&search= на границе API

**Практика (пошагово):**

В shared/validations/ создай ProjectQuerySchema и TaskQuerySchema:
• page, limit, search, status, sortBy, order
• page > 0, limit 1–100, sortBy только из белого списка

Обнови getAllProjects и getAllTasks:
• распарси query через Zod
• построй where из фильтров
• пагинация через skip и take
• верни { items, total }

Обнови GET-роуты:
• validateQuery → utils → { success: true, data: { items, total } }

### День 4 — Client-side Composables

**Теория (35–50 мин):**

Composables инкапсулируют загрузку данных и состояние — страницы остаются тонкими, логика переиспользуется.

• useProjects() — список проектов, CRUD, loading/error/pending
• useTasks() — фильтр по projectId, refetch при смене проекта
• Reactivity: ref, computed, watch(route.params.id)
• Интеграция с useApi / useApiFetch (unified { data, success })
• Подготовка к optimistic: snapshot списка перед мутацией

**Практика (пошагово):**

Создай app/composables/useProjects.ts:
• состояние: projects, loading, error
• методы: fetchProjects(query), createProject, updateProject, deleteProject
• optimistic: snapshot → мутация → rollback в catch

Обнови app/composables/useTasks.ts:
• параметр projectId
• optimistic create/delete — добавь/убери из локального массива до ответа API

Подключи: const { projects, fetchProjects } = useProjects()

### День 5 — UI + Pages (Projects + Tasks)

**Теория (40–60 мин):**

Интерфейс для работы с несколькими проектами: навигация, контекст текущего проекта, задачи внутри него.

• Nested routing — /projects, /projects/[id] (file-based routing Nuxt)
• Shared layouts и компоненты — sidebar или tabs для переключения проектов
• UX: loading skeleton, empty state («нет проектов»), error + retry
• Nuxt UI — Card, Table, Button для списков и форм
• Опционально: drag & drop задач между проектами (PATCH projectId)

**Практика (пошагово):**

Страницы:
• /projects — список с фильтрами и таблицей (Nuxt UI Table)
• /projects/[id] — карточка проекта + таблица задач
• обнови /tasks — фильтр по проекту

Sidebar или tabs — useProjects() для переключения проектов.

Состояния: spinner при loading; «Нет проектов» при empty; error + «Повторить».

Nuxt UI: Table, Card, Modal для create/edit.

### День 6 — Optimistic Updates + Refactor

**Теория (30–50 мин):**

Optimistic updates — UI обновляется сразу, сервер работает в фоне. При ошибке — откат к snapshot и toast.

• Optimistic create — добавить элемент с temp-id до ответа API
• Optimistic update/delete — мгновенный toggle, edit, remove
• Rollback в catch — восстановить предыдущий массив
• invalidate / refresh — синхронизация с сервером после успеха
• Общий паттерн для useTasks и useProjects — без TanStack Query, вручную

**Практика (пошагово):**

Доработай useTasks и useProjects:
• перед мутацией — snapshot текущего списка
• при успехе — обнови UI; при ошибке — верни snapshot

Invalidate-стратегия:
• после create project → fetchProjects()
• для tasks: create — добавь в список; delete — убери локально

Рефакторинг: единообразный optimistic без дублирования.

Обнови docs/architecture.md — relations, pagination, optimistic flow.

### День 7 — Testing, Polish + Commit недели

**Теория:**

Закрепление недели: полный пользовательский сценарий, проверки качества, документация.

• Smoke-test: register → create project → create tasks → filters → optimistic toggle
• pnpm lint:all && pnpm typecheck && pnpm build
• docs/architecture.md — relations, pagination, optimistic flow
• roadmap-12-weeks.md (✅ нед. 6), .planning/state.md
• Коммит: feat(week-6): Advanced CRUD + Projects with relations, pagination and optimistic updates

**Практика (пошагово):**

Smoke-test:
• register → login → create project → tasks in project
• filters и pagination
• optimistic create/delete + rollback при ошибке

pnpm lint:all
pnpm typecheck
pnpm build

Обнови docs/architecture.md, roadmap-12-weeks.md (✅ нед. 6), .planning/state.md.

Коммит: feat(week-6): Advanced CRUD + Projects with relations, pagination and optimistic updates

**Done when (неделя):**

- Модель Project + relation Task ↔ Project; миграция применена
- CRUD Projects + задачи внутри проекта (API + owner checks)
- GET /api/tasks?limit=10&cursor=… и фильтры (search, status) работают
- useProjects + useTasks с projectId на клиенте
- Страницы /projects и /projects/[id]; управление задачами в проекте
- Optimistic create/update/delete с rollback при ошибке
- pnpm lint:all, typecheck, build — чисто
- docs/architecture.md обновлён (relations, pagination, optimistic)

**UI `/roadmap`:** детальный чеклист — [неделя 6 на `/roadmap`](/roadmap) (вкладка «Нед 6»).

---

## Неделя 7 — Testing + File Uploads

**Цель недели:** научиться тестировать код и добавить функциональность загрузки файлов (аватары пользователей, attachments к задачам).

**Ключевые результаты недели:**

- Базовый слой тестов (Vitest)
- Загрузка и хранение файлов
- Аватары пользователей
- Тесты на ключевые сценарии (auth, CRUD, validation)

| День | Checkpoint                          |
| ---- | ----------------------------------- |
| 1    | Vitest setup + первые unit-тесты    |
| 2    | Integration tests API routes        |
| 3    | Upload API + storage + лимиты       |
| 4    | User avatars — API + UI             |
| 5    | Attachment model + task attachments |
| 6    | Upload tests + refactor storage     |
| 7    | pnpm test + verify + commit         |

### День 1 — Введение в Testing с Vitest

**Теория (40–60 мин):**

Тестирование — важная часть профессиональной разработки. Помогает ловить баги раньше и уверенно рефакторить код.

Vitest + Nuxt Test Utils — стандартный стек для Nuxt 4. Unit tests проверяют изолированные функции (validation, response helpers); integration tests — API routes и composables.

Mocking Prisma и auth — ключ к тестам server/utils без реальной БД. Checkpoint дня: несколько работающих тестов и команда pnpm test.

**Практика (пошагово):**

Настрой Vitest в проекте: vitest.config.ts, скрипт pnpm test в package.json.

Напиши первые тесты для validateBody, response helpers (successResponse, errorResponse) и простых utils. Опционально — тест composable useTasks с mock fetch.

Проверка: pnpm test проходит; несколько green tests в CI-ready формате.

**Done when (день 1):** несколько работающих тестов и команда pnpm test.

### День 2 — Тестирование API Routes

**Теория (35–55 мин):**

Тестируем серверную часть — самое важное в fullstack-приложении.

defineEventHandler / apiHandler можно вызывать через @nuxt/test-utils или supertest-подход. Mock session для protected routes; тесты на 401 без cookie, 400 при invalid body, 403/404 при owner checks.

Покрыть CRUD /api/tasks, health, auth-guarded endpoints. Checkpoint: основные API-роуты покрыты тестами.

**Практика (пошагово):**

Добавь тесты для /api/tasks (CRUD): create → list → patch → delete с mock session.

Тесты protected routes — GET /api/tasks без cookie → 401. Тесты на 400 (invalid body через Zod), 404 (чужая задача), 403 где применимо.

Mock getSession / event.context.user для авторизованных запросов.

**Done when (день 2):** основные API-роуты покрыты тестами.

### День 3 — File Uploads: теория и базовая настройка

**Теория (40–60 мин):**

Безопасный приём, валидация и хранение файлов.

multipart/form-data — формат загрузки; Nitro readMultipartFormData для парсинга. Ограничения size/MIME на сервере; хранение локально (public/uploads) или облако (S3, Vercel Blob).

Безопасность: sanitize filename, защита от path traversal, лимиты размера. Checkpoint: файл загружается через API и сохраняется.

**Практика (пошагово):**

Создай server/api/upload.post.ts и server/utils/storage.ts.

Используй readMultipartFormData; проверяй MIME (image/\*, pdf) и max size (например 5 MB). Сохраняй в public/uploads с uuid-именем; возвращай URL через apiHandler.

Проверка: curl/Postman multipart upload → файл на диске + JSON с url.

**Done when (день 3):** файл загружается через API и сохраняется.

### День 4 — Аватары пользователей + Storage

**Теория (35–50 мин):**

Привязываем загрузку файлов к пользователям.

Обновление модели User (avatarUrl / image); уникальные имена файлов; POST /api/users/avatar сохраняет путь в БД.

Обновление useAuth и user menu; отображение на /profile. Опционально: оптимизация изображений (sharp). Checkpoint: пользователь загружает и видит свой аватар.

**Практика (пошагово):**

Добавь POST /api/users/avatar — принимает файл, сохраняет через storage.ts, обновляет User.avatarUrl в Prisma.

Страница /profile или форма в user menu: input type=file, preview, loading state.

Обнови useAuth — refetch user после upload; аватар в header/layout.

**Done when (день 4):** пользователь загружает и видит свой аватар.

### День 5 — Attachments к задачам

**Теория (35–50 мин):**

Расширяем задачи — прикрепление файлов.

One-to-many Task ↔ Attachment: новая модель Attachment в Prisma, миграция, API upload/list/delete attachments.

Загрузка нескольких файлов к задаче; отображение в интерфейсе задач. Owner checks: только владелец задачи может прикреплять файлы.

**Практика (пошагово):**

Миграция: модель Attachment (id, taskId, filename, url, size, mimeType, createdAt).

API: POST /api/tasks/[id]/attachments, GET list, DELETE [attachmentId]. Owner check через task.userId.

UI на /tasks или /projects/[id]: список attachments, кнопка upload, удаление файла.

### День 6 — Тесты на File Uploads + Refactor

**Теория (30–45 мин):**

Тестируем upload и проводим рефакторинг storage-слоя.

Mock files в Vitest; integration tests auth + upload; рефакторинг server/utils/storage.ts — единая точка save/delete/validate.

Обновление docs/architecture.md — секция uploads и storage.

**Практика (пошагово):**

Vitest-тесты upload endpoints с mock multipart и mock storage.

Рефактор server/utils/storage.ts: validateFile, saveFile, deleteFile, buildPublicUrl. Убери дубли из avatar и attachment handlers.

Обнови docs/architecture.md — uploads, storage, лимиты.

### День 7 — Полный Verify + Commit недели

**Теория (30–45 мин):**

Закрепление недели: полный прогон pnpm test, lint, typecheck, build.

Smoke-test: upload avatar → виден в UI; attach file к задаче → list attachments. Коммит week-7: testing + file uploads; обновить roadmap и .planning/state.md.

**Практика (пошагово):**

Полный прогон: pnpm test && pnpm lint:all && pnpm typecheck && pnpm build.

Smoke: register → upload avatar → create task → attach file → list → delete.

Коммит: week-7: testing + file uploads. Обнови roadmap-12-weeks.md (✅ нед. 7).

**Done when (неделя):**

- Vitest настроен; pnpm test проходит (utils + API + upload)
- POST upload с лимитом size/MIME; storage.ts без дублирования
- Аватар: POST /api/users/avatar + отображение в UI
- Attachment model + API + UI для задач
- Protected upload routes — только авторизованный owner
- docs/architecture.md — секция file uploads
- pnpm lint:all, typecheck, build — чисто

**UI `/roadmap`:** детальный чеклист — [неделя 7 на `/roadmap`](/roadmap) (вкладка «Нед 7»).

---

## Неделя 8 — Logging, Cache, Deploy

**Цель недели:** подготовить приложение к реальной продакшен-среде: логирование, кэширование и деплой.

**Ключевые результаты недели:**

- Структурированное логирование (Pino)
- Кэширование ответов (Nitro Cache)
- Production-ready сборка и деплой (Vercel / Railway / VPS)
- Мониторинг и базовые health checks

| День | Checkpoint                          |
| ---- | ----------------------------------- |
| 1    | Pino + request logging              |
| 2    | Nitro cache + invalidation          |
| 3    | Environment + runtimeConfig         |
| 4    | Production build + security headers |
| 5    | Deploy + PostgreSQL + migrations    |
| 6    | Health check + external monitoring  |
| 7    | docs + verify + commit              |

### День 1 — Logging с Pino

**Теория (35–55 мин):**

Хорошее логирование — ключ к пониманию приложения в production.

Pino — быстрый structured logger с JSON-логами и уровнями (info, warn, error). Dev: pino-pretty; prod: JSON для агрегаторов.

Middleware для автологирования запросов: method, path, duration, status, userId (без секретов). Логи ключевых событий: auth, CRUD errors.

**Практика (пошагово):**

Создай server/utils/logger.ts — pino instance с level из env.

Расширь server/middleware/log.ts: duration, statusCode, userId из context. Замени console.log на logger.info/warn/error.

Dev: pino-pretty; prod: JSON. Проверка: структурированные логи при каждом запросе.

**Done when (день 1):** структурированные логи при каждом запросе.

### День 2 — Cache (Nitro Cache)

**Теория (35–50 мин):**

Кэш ускоряет приложение и снижает нагрузку на БД.

Nitro Cache API: routeRules, defineCachedEventHandler. Cache keys с учётом auth — не кэшировать персональные данные чужого пользователя.

TTL для GET tasks/projects; invalidation при POST/PATCH/DELETE мутациях. Trade-off: stale data vs performance.

**Практика (пошагово):**

Добавь cache rules в nuxt.config.ts для безопасных GET (например public health).

defineCachedEventHandler для GET /api/projects с ключом userId + query hash. При POST/PATCH/DELETE projects — invalidate cache (clearNitroCache или custom key bust).

Не кэшируй персональные tasks без user scope в ключе.

### День 3 — Environment + Config

**Теория (30–45 мин):**

Правильная работа с окружениями — основа безопасного деплоя.

.env vs runtimeConfig: public (appVersion) vs private (DATABASE_URL, AUTH_SECRET, STRIPE_KEY). development, staging, production — разные .env.example секции.

useRuntimeConfig() на клиенте — только public.\*; useServerRuntimeConfig() на сервере.

**Практика (пошагово):**

Обнови .env.example: DATABASE_URL, AUTH_SECRET, NODE_ENV, LOG_LEVEL, APP_URL.

Проверь types/nuxt-public.d.ts и server/utils/runtimeConfig.ts — warnIfMissingSecrets в dev boot plugin.

Раздели dev/prod конфиги в nuxt.config (sourcemap, devtools off in prod).

### День 4 — Production Build & Optimization

**Теория (35–55 мин):**

Что происходит при pnpm build и как оптимизировать сборку.

Nitro presets: vercel, node-server. Code splitting, tree shaking. Security headers в routeRules (X-Frame-Options, CSP basics). Compression.

Анализ .output/ — понимание server/client bundles.

**Практика (пошагово):**

pnpm build — проанализируй .output/server и .output/public.

routeRules: security headers (X-Content-Type-Options, Referrer-Policy). Выбери nitro preset под целевой хостинг.

Checkpoint: production build без ошибок; размер bundles разумный.

**Done when (день 4):** production build без ошибок; размер bundles разумный.

### День 5 — Deploy (Vercel + VPS/Railway)

**Теория (40–60 мин):**

Платформы деплоя и production БД.

Vercel (serverless) vs Railway/VPS (Node server) — trade-offs для Prisma/long connections. Managed PostgreSQL: Neon, Supabase, Railway.

Environment variables на хостинге; prisma migrate deploy при деплое. CI/CD basics — GitHub Actions preview.

**Практика (пошагово):**

Задеплой на Vercel или Railway; подключи managed PostgreSQL.

Настрой env vars на хостинге. Добавь postbuild или start script: prisma migrate deploy.

Проверка: публичный URL открывается; login + CRUD работают на staging.

**Done when (день 5):** публичный URL открывается; login + CRUD работают на staging.

### День 6 — Monitoring + Health Checks

**Теория (30–45 мин):**

Как понимать, что приложение «живое» в production.

Health check /api/health + db status (Prisma $queryRaw SELECT 1). UptimeRobot / Better Stack — внешний ping.

Опционально: Sentry для error tracking. Логи на production-хостинге.

**Практика (пошагово):**

Расширь GET /api/health: status, version, db: connected | error, timestamp.

Prisma ping в getHealthPayload. Настрой UptimeRobot ping каждые 5 мин.

Проверь логи на хостинге после деплоя.

### День 7 — Polish + Commit недели

**Теория (30–45 мин):**

Финальный рефакторинг logger/cache config; docs/deployment-production.md.

pnpm lint:all && pnpm typecheck && pnpm build. Staging URL доступен; health db: connected. Коммит week-8: logging, cache, production deploy.

**Практика (пошагово):**

Напиши docs/deployment-production.md: env, migrate deploy, cache, logging.

pnpm lint:all && pnpm typecheck && pnpm build.

Коммит: week-8: logging, cache, production deploy. Staging URL + health db: connected.

**Done when (неделя):**

- Pino structured logging; request duration в middleware
- Nitro cache на безопасных GET + invalidation при мутациях
- Production build зелёный; security headers в routeRules
- Deploy на Vercel/Railway; staging URL доступен
- Health check с db: connected
- prisma migrate deploy при деплое
- docs/deployment-production.md актуален

**UI `/roadmap`:** детальный чеклист — [неделя 8 на `/roadmap`](/roadmap) (вкладка «Нед 8»).

---

## Неделя 9 — Admin Dashboard

**Цель недели:** создать удобную административную панель для управления пользователями, задачами и проектами.

**Ключевые результаты недели:**

- Админ-панель с таблицами и формами
- Расширенный CRUD с Nuxt UI
- Role-based доступ (только ADMIN)
- Фильтры, пагинация и bulk actions

| День | Checkpoint                               |
| ---- | ---------------------------------------- |
| 1    | Admin layout + sidebar + middleware      |
| 2    | Users table (server pagination, actions) |
| 3    | Projects & tasks admin + relations       |
| 4    | Bulk actions, filters, CSV (опц.)        |
| 5    | Forms + modals + Zod                     |
| 6    | Dashboard stats + recent activity        |
| 7    | Security polish + commit                 |

### День 1 — Admin layout + navigation

**Теория (45–60 мин):**

Админ-панель как отдельный «контекст» приложения: свой layout, навигация, права доступа и отдельный набор компонентов. В Nuxt — app/layouts/admin.vue и middleware.

Protected admin routes (/admin/\*): middleware выполняется до рендера; нельзя полагаться только на скрытие ссылок — URL должен блокироваться на сервере.

Role guard (только ADMIN): на сервере getSession → role === ADMIN → иначе 403/redirect. Nuxt UI AppBar, Sidebar, Card — SSR/CSR нюансы интерактивности.

**Практика (пошагово):**

Создай app/layouts/admin.vue: NLayout, NAppBar, NSidebar со ссылками /admin, /admin/users, /admin/projects, /admin/tasks, /admin/dashboard.

app/middleware/admin.ts: user.role === ADMIN, иначе navigateTo('/login'). app/pages/admin/index.vue: definePageMeta({ layout: 'admin', middleware: 'admin' }).

Проверка: /admin без auth → redirect; под ADMIN → страница открывается; active link подсветка.

**Done when (день 1):** /admin без auth → redirect; под ADMIN → страница открывается; active link подсветка.

### День 2 — Users management table

**Теория (50–70 мин):**

Таблицы в админке: пагинация, сортировка и поиск на сервере — не «fetch всё и sort в JS».

Параметры page, pageSize, sortBy, order, search → API → Prisma skip/take → { items, total }.

CRUD-действия (изменить роль, удалить) — отдельные PATCH/DELETE; сервер повторно проверяет ADMIN. Modal confirm перед destructive actions.

**Практика (пошагово):**

server/api/admin/users.get.ts — query page, pageSize, search, sortBy, order; Prisma + requireRole('ADMIN'); return { items, total }.

app/pages/admin/users/index.vue — useFetch/composable, Nuxt UI DataTable, pagination UI.

Actions: PATCH role, DELETE user с modal confirm; server/api/admin/users/[id].patch.ts.

### День 3 — Projects & tasks admin

**Теория (45–60 мин):**

Связанные данные в админке: задачи внутри проекта, статусы, исполнители — JOIN или include на бэкенде.

Фильтры: status, projectId, assignee, date range. Переиспользуй server/utils/projects.ts и tasks.ts с requireRole('ADMIN').

UI: на странице проекта — список задач; у задачи — название проекта.

**Практика (пошагово):**

Admin API: server/api/admin/projects._ и admin/tasks._ — CRUD + filters projectId, status.

app/pages/admin/projects/index.vue и admin/tasks/index.vue — таблицы + фильтры.

Связи в UI: на странице проекта список задач; у задачи — название проекта (include).

### День 4 — Advanced table features

**Теория (45–60 мин):**

Bulk actions — операции над несколькими строками; confirm modal обязателен.

Advanced filters: sync query в URL — состояние сохраняется при пагинации. Export CSV на бэкенде с теми же фильтрами (Content-Type: text/csv).

Inline editing: input on click, PATCH on blur, toast при ошибке без full refetch.

**Практика (пошагово):**

Чекбоксы выбора строк в таблицах users, projects, tasks.

Bulk delete — массив ID → server endpoint; confirm «Удалить N записей?». Bulk change status для tasks. Sync filters в URL query.

Опц.: Export CSV endpoint + кнопка Download; inline edit PATCH on blur.

### День 5 — Forms + modals + Zod

**Теория (40–60 мин):**

Формы в админке: валидация на клиенте (UX) и на сервере (security).

Zod-схемы в shared/validations/ — userSchema, projectSchema; один источник для client + server. AdminModal: props title, open, onClose; UForm + Save/Cancel.

File upload в админке (cover/avatar) — FormData, связь с entity (нед. 7).

**Практика (пошагово):**

Zod: userSchema (name, email, role), projectSchema в shared/validations/.

Компонент AdminModal — create/edit user и project: client Zod → POST/PATCH через useApi.

При успехе закрыть modal и refetch таблицы; при ошибке показать issues. Опц.: upload cover/avatar через FormData.

### День 6 — Analytics + dashboard overview

**Теория (35–50 мин):**

Статистика: counts users/projects/tasks; breakdown по статусам; активность за неделю.

Recent activity — лента последних изменений (audit). Charts: tasks by status (Chart.js или Nuxt UI Charts).

GET /api/admin/stats — requireRole ADMIN; dashboard cards + loading states.

**Практика (пошагово):**

server/api/admin/stats.get.ts — counts, breakdown по статусам, recent 10 changes.

app/pages/admin/dashboard/index.vue — UCard metrics, activity feed, loading skeleton.

Опц.: chart tasks by status. Сетка карточек с заголовками.

### День 7 — Polish + security + commit

**Теория (30–45 мин):**

UI pass: empty states, error + retry, mobile responsive. Security: /admin без auth → redirect; API без ADMIN → 403.

pnpm lint:all && pnpm typecheck && pnpm build. docs/architecture.md — admin section. Коммит week-9: admin dashboard with Nuxt UI.

**Практика (пошагово):**

UI pass: empty «Нет данных», error + «Повторить», mobile. Security audit: curl /api/admin/\* без ADMIN cookie → 403.

pnpm lint:all && pnpm typecheck && pnpm build. docs/architecture.md admin section. Коммит week-9: admin dashboard with Nuxt UI.

**Done when (неделя):**

- /admin и /api/admin/\* только для ADMIN; USER → 403
- Admin layout + sidebar + middleware блокирует не-админов
- Users table: server pagination, search, sort, role patch, delete
- Projects & tasks admin CRUD + filters + relations в UI
- Bulk actions с confirm; filters sync в URL
- Dashboard stats GET /api/admin/stats
- pnpm lint:all, typecheck, build — чисто

**UI `/roadmap`:** детальный чеклист — [неделя 9 на `/roadmap`](/roadmap) (вкладка «Нед 9»).

---

## Неделя 10 — Real-time (SSE)

**Цель недели:** добавить живые обновления в приложение, чтобы пользователи видели изменения задач и проектов в реальном времени без перезагрузки страницы.

**Ключевые результаты недели:**

- Server-Sent Events (SSE) инфраструктура
- Real-time обновления задач (create, update, delete)
- Broadcasting изменений между пользователями
- Клиентская обработка событий

| День | Checkpoint                         |
| ---- | ---------------------------------- |
| 1    | SSE theory + /api/events heartbeat |
| 2    | Server broadcaster + CRUD hooks    |
| 3    | useSSE composable + event handling |
| 4    | Live UI updates + toasts           |
| 5    | Typing, comments, presence (опц.)  |
| 6    | Reconnect, cleanup, rate limit     |
| 7    | Testing + docs + commit            |

### День 1 — Теория Real-time в Nuxt

**Теория (35–55 мин):**

Real-time — приложение мгновенно реагирует на изменения других пользователей.

SSE vs WebSockets: SSE — односторонний поток server→client по HTTP; проще для уведомлений. WebSocket — двусторонний, для чата позже.

Nitro streaming: text/event-stream, data: {...}\n\n. Heartbeat для keep-alive. Trade-off: проще деплой vs только server→client.

**Практика (пошагово):**

Изучи Nitro SSE API — Content-Type: text/event-stream.

Создай server/api/events.get.ts — базовый stream с heartbeat каждые 30s (event: heartbeat\ndata: {"ts":...}\n\n).

Тест: EventSource в браузере DevTools или curl -N — события приходят.

### День 2 — Server-side broadcasting

**Теория (40–60 мин):**

Event emitter / broadcaster — server/utils/events.ts: register, unregister, broadcast.

Хранение активных соединений: Set/Map writers; cleanup при disconnect. После CRUD в tasks.ts — task:created, task:updated, task:deleted.

Связь /api/events ↔ broadcaster — подписчики получают JSON payload.

**Практика (пошагово):**

server/utils/events.ts — registerClient(writer), unregister, broadcast(event, payload).

Интегрируй в server/utils/tasks.ts: после create/update/delete → broadcast('task:created' | 'task:updated' | 'task:deleted', { id, ... }).

Свяжи /api/events с register при connect и cleanup on close.

### День 3 — Client-side SSE handling

**Теория (35–50 мин):**

EventSource API: new EventSource('/api/events'), onmessage, onerror — только client-side.

Reconnection с exponential backoff; не дублировать подписки. useSSE composable: connect, disconnect, events ref.

Типы событий: heartbeat, task:_, project:_ — парсинг JSON → callback в useTasks.

**Практика (пошагово):**

app/composables/useSSE.ts — connect(), disconnect(), events ref, onEvent(type, handler).

Reconnection с backoff (1s, 2s, 4s, max 30s). Парсинг JSON из event.data.

Подключи в layout или /tasks page — auto connect on mount.

### День 4 — Real-time updates в UI

**Теория (35–55 мин):**

Optimistic + real-time: свои действия — optimistic; чужие — merge из SSE.

Live список: upsert/delete по id без full refetch. Toast «Задача обновлена другим пользователем» — без спама на свои правки.

Фильтр событий по projectId — только релевантные updates на /tasks.

**Практика (пошагово):**

Обнови useTasks — merge SSE events: upsert task by id, remove on deleted.

Live обновление списка на /tasks без full refetch. Toast через Nuxt UI при чужих изменениях (ignore own userId).

Фильтр по текущему projectId.

### День 5 — Advanced real-time (typing, comments)

**Теория (30–50 мин):**

«Пользователь пишет…» — typing:start/stop с таймаутом.

Опц.: real-time комментарии comment:created broadcast. Presence — кто онлайн в проекте; heartbeat + lastSeen.

Тест нескольких вкладок / пользователей.

**Практика (пошагово):**

Индикатор «пользователь пишет…» в форме задачи — broadcast typing:start/stop.

Опц.: Comment model + comment:created SSE. Presence: online users в project header.

Тест: 2 вкладки — typing indicator и live comments видны.

### День 6 — Performance + error handling SSE

**Теория (30–45 мин):**

Reconnection strategy: backoff, max retries, UI «переподключение…».

Cleanup: onUnmounted → close EventSource; server remove connection. Rate limiting broadcast; debounce/throttle; разумный heartbeat interval.

Логирование SSE подключений в dev/Pino.

**Практика (пошагово):**

Улучши стабильность: onUnmounted close EventSource; server remove stale writers.

UI banner «Переподключение…» при onerror. Debounce broadcast при bulk updates.

Логи connect/disconnect в Pino (dev).

### День 7 — Polish + testing + commit

**Теория (30–45 мин):**

Тест: 2 браузера — create/update/delete/reconnect. docs/realtime.md — архитектура, типы событий.

pnpm lint:all && pnpm typecheck && pnpm build. Коммит week-10: real-time updates with SSE.

**Практика (пошагово):**

Manual test: 2 браузера/профиля — create task в A → появляется в B; delete, reconnect.

Напиши docs/realtime.md — flow, event types, broadcaster diagram.

pnpm lint:all && pnpm typecheck && pnpm build. Коммит week-10: real-time updates with SSE.

**Done when (неделя):**

- GET /api/events — SSE stream с heartbeat
- server/utils/events.ts broadcaster + hooks в tasks CRUD
- useSSE composable с reconnect backoff
- Live merge в useTasks на /tasks
- Два браузера — create/update/delete синхронизируются
- docs/realtime.md актуален
- pnpm lint:all, typecheck, build — чисто

**UI `/roadmap`:** детальный чеклист — [неделя 10 на `/roadmap`](/roadmap) (вкладка «Нед 10»).

---

## Неделя 11 — SaaS Core (Workspaces + Billing)

**Цель недели:** превратить проект в настоящую multi-tenant SaaS-систему с рабочими пространствами и монетизацией.

**Ключевые результаты недели:**

- Модель Workspace (организация/команда)
- Multi-tenant архитектура (данные разделены по workspaces)
- Приглашение пользователей в workspace
- Базовая интеграция Stripe (тарифы и подписки)

| День | Checkpoint                           |
| ---- | ------------------------------------ |
| 1    | Workspace model + switcher           |
| 2    | Members + invites + workspace RBAC   |
| 3    | Data isolation (workspaceId scope)   |
| 4    | Stripe products + checkout           |
| 5    | Subscription + webhooks + billing UI |
| 6    | Limits + feature gates               |
| 7    | Security audit + commit              |

### День 1 — Workspace model + multi-tenant

**Теория (40–60 мин):**

Multi-tenant — одно приложение обслуживает много независимых организаций (workspaces).

Модель Workspace: name, slug, plan. User ↔ Workspace many-to-many через WorkspaceMember (userId, workspaceId, role).

Row-level scope: каждый query фильтруется по workspaceId. Контекст workspace — переключатель в UI; current workspace в session/composable.

**Практика (пошагово):**

Prisma: Workspace, WorkspaceMember; миграция. workspaceId на Project (и Task через project).

server/utils/workspaces.ts + CRUD API. useWorkspace composable + switcher в header.

Middleware определяет current workspace из cookie/header. Проверка: создать workspace, переключиться между двумя.

**Done when (день 1):** создать workspace, переключиться между двумя.

### День 2 — Membership & invites

**Теория (35–55 мин):**

WorkspaceMember роли: owner, admin, member.

Приглашения по email: token, expiry, status pending/accepted. Accept flow: /invite/[token] → WorkspaceMember.

RBAC внутри workspace: owner — billing; admin — members; member — tasks/projects.

**Практика (пошагово):**

API: invite member by email → token link; POST /api/invites/accept.

Страница /invite/[token]. RBAC checks: owner/admin/member в workspace utils.

UI: members list, invite form, role dropdown. Accept invite → join workspace.

### День 3 — Data isolation (multi-tenant logic)

**Теория (40–60 мин):**

Automatic filtering by workspaceId — helper getWorkspaceScope() во всех utils.

Обновление tasks.ts, projects.ts — только текущий workspace. Security: нет workspace в context → 403; чужой id → 404 (не раскрывать).

Тесты изоляции: user A не видит workspace B.

**Практика (пошагово):**

getWorkspaceScope(event) во всех utils — фильтр workspaceId в every Prisma query.

Обнови tasks.ts, projects.ts — scope + tests: user A не видит workspace B data.

403 без workspace context; 404 при чужом resource id.

### День 4 — Stripe integration basics

**Теория (40–60 мин):**

Stripe Products и Prices — Free / Pro в test mode.

Checkout Session — redirect на Stripe Hosted Checkout. Webhooks: verify signature; checkout.session.completed.

Subscription model: Stripe Customer + Subscription привязаны к workspace.

**Практика (пошагово):**

server/utils/stripe.ts; env STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.

Products/Prices в Stripe Dashboard (test). Страница /pricing — Free vs Pro.

POST /api/billing/checkout — create Checkout Session для current workspace → redirect URL.

### День 5 — Subscription management

**Теория (35–55 мин):**

Сохранение subscription в БД: plan, status, stripeSubscriptionId на Workspace.

Проверка активной подписки перед premium features. Upgrade/downgrade/cancel — Customer Portal или новый checkout.

Webhook handler /api/stripe/webhook — idempotent processing.

**Практика (пошагово):**

Поля plan, stripeCustomerId, stripeSubscriptionId на Workspace (или Subscription model).

POST /api/stripe/webhook — verify signature, handle checkout.session.completed, customer.subscription.updated/deleted.

Страница /settings/billing — plan status, Customer Portal link.

### День 6 — Limits & feature gates

**Теория (30–50 мин):**

Feature flags по подписке — plan определяет возможности.

Free plan limits: max 3 projects, N members. Soft limits (warning) vs hard limits (block + Upgrade UI).

server/utils/limits.ts — check перед create project/member.

**Практика (пошагово):**

server/utils/limits.ts — canCreateProject(workspace), canInviteMember(workspace).

Free: max 3 projects — block + Upgrade modal. Pro: unlimited.

Upgrade prompts: banner на /projects при лимите. Тест Free vs Pro flows.

### День 7 — Polish + security review + commit

**Теория (30–45 мин):**

Аудит multi-tenant: все API scoped by workspaceId. SaaS flow test: workspace → invite → pay → limits.

pnpm lint:all && pnpm typecheck && pnpm build. Коммит week-11: workspaces + stripe billing.

**Практика (пошагово):**

Security audit: все admin/billing/tasks/projects API проверяют workspaceId scope.

E2E: create workspace → invite → accept → checkout (test card) → Pro limits lifted.

pnpm lint:all && pnpm typecheck && pnpm build. Коммит week-11: workspaces + stripe billing.

**Done when (неделя):**

- Workspace + WorkspaceMember; switcher в UI
- Invites: create, accept, RBAC owner/admin/member
- Data isolation — workspaceId scope во всех utils
- Stripe test checkout session работает
- Webhook обновляет plan на workspace
- Free plan: max 3 projects (limits.ts)
- Security audit multi-tenant пройден

**UI `/roadmap`:** детальный чеклист — [неделя 11 на `/roadmap`](/roadmap) (вкладка «Нед 11»).

---

## Неделя 12 — Polish + CI/CD + Docs (Финальный релиз)

**Цель недели:** довести проект до уровня production-ready продукта, настроить автоматизацию и подготовить к демонстрации/дальнейшей разработке.

**Ключевые результаты недели:**

- Полная полировка UX/UI
- CI/CD пайплайн
- Качественная документация
- Финальный релиз и ревью всего проекта

| День | Checkpoint                         |
| ---- | ---------------------------------- |
| 1    | UX/UI polish + a11y + mobile       |
| 2    | Error boundaries + empty states    |
| 3    | GitHub Actions CI + preview deploy |
| 4    | README + API docs + quick setup    |
| 5    | Performance audit + optimizations  |
| 6    | Security review + regression       |
| 7    | Production deploy + reflection     |

### День 1 — UX/UI polish & accessibility

**Теория (40–60 мин):**

Хороший продукт — функциональный и приятный.

Дизайн-система и consistency — единые паттерны на tasks, projects, admin. Accessibility: ARIA labels, контраст, keyboard nav, focus-visible.

Mobile responsiveness: sidebar collapse, touch targets. Micro-interactions без перегруза.

**Практика (пошагово):**

Полировка страниц tasks, projects, admin — единые отступы, typography, colors.

Accessibility audit: axe DevTools или Lighthouse a11y. Fix: aria-label на icon buttons, focus-visible, contrast.

Mobile: responsive sidebar, tables scroll, touch-friendly buttons. Опц.: dark mode.

### День 2 — Error boundaries & user feedback

**Теория (30–50 мин):**

Global error boundary — error.vue, NuxtErrorBoundary.

Toast-уведомления — единый feedback из API errors (useApi). Empty states с CTA; fallback «Повторить» при ошибках.

User-friendly сообщения — без stack trace в UI.

**Практика (пошагово):**

Улучши app/error.vue и NuxtErrorBoundary на ключевых страницах.

Empty states для всех списков: tasks, projects, admin tables — иконка + CTA. Единый toast composable для success/error из useApi.

Проверка: simulate 500 → user sees friendly message + retry.

**Done when (день 2):** simulate 500 → user sees friendly message + retry.

### День 3 — CI/CD + GitHub Actions

**Теория (40–60 мин):**

GitHub Actions workflow на push и PR.

Pipeline: lint + typecheck + build + test (Vitest). Merge только при green CI. Автоматический deploy Vercel: preview на PR, production на main.

Secrets в GitHub Actions — не в коде.

**Практика (пошагово):**

Создай .github/workflows/ci.yml — on push/pull_request:

jobs: lint (pnpm lint:all), typecheck, build, test (pnpm test). Node 20, pnpm cache.

Подключи Vercel GitHub integration — preview deploy на PR. Проверка: PR → green checks.

**Done when (день 3):** PR → green checks.

### День 4 — Documentation & README

**Теория (35–55 мин):**

README.md — stack, demo URL, screenshots, env setup, scripts.

API documentation — ключевые endpoints. Architecture overview в docs/architecture.md. One-command start: docker compose up + migrate + pnpm dev.

Новый разработчик запускает проект за 10 минут.

**Практика (пошагово):**

Полное обновление README.md: badges, demo link, stack table, screenshots, env vars table, pnpm scripts.

docs/api.md или секция в architecture — endpoints list. Setup script или Makefile: docker up, migrate, seed, dev.

Проверка: clone fresh → follow README → app runs.

**Done when (день 4):** clone fresh → follow README → app runs.

### День 5 — Performance audit & optimizations

**Теория (30–50 мин):**

Lighthouse audit: performance, a11y, best practices на /tasks, /projects, /admin.

Bundle size — nuxt analyze; lazy load тяжёлых компонентов. DB: indexes, N+1 fix. Cache review — без утечки personal data.

Целевые метрики Lighthouse > 80.

**Практика (пошагово):**

Lighthouse на /, /tasks, /projects — fix top issues.

pnpm nuxt analyze — lazy import admin charts, heavy modals. Prisma: add indexes on userId, workspaceId, projectId; fix N+1 with include.

Review Nitro cache keys — no cross-user leakage.

### День 6 — Security review + final testing

**Теория (35–55 мин):**

Security checklist: auth, upload, multi-tenant, admin, Stripe webhook signature.

Rate limiting на auth и sensitive endpoints. Zod на всех inputs. Regression test всех фич недель 1–11 — full user journey.

Fix critical bugs before release.

**Практика (пошагово):**

Пройди security checklist: AUTH_SECRET server-only, upload limits, workspace isolation, admin RBAC, Stripe webhook verify.

Regression: register → workspace → project → tasks → SSE → billing → admin. Fix critical bugs.

Опц.: rate limit /api/auth/\* in middleware.

### День 7 — Финальный релиз + рефлексия

**Теория (30–45 мин):**

Production deploy — smoke test live URL. Рефлексия по 12-недельному пути — .planning/PROJECT.md.

Коммит week-12: final polish, ci/cd, documentation. Portfolio-ready case study: кнопка → API → БД → UI.

**Практика (пошагово):**

Production deploy; smoke: health, login, CRUD, billing webhook test.

Обнови .planning/PROJECT.md — reflection, next steps. Final commit week-12: final polish, ci/cd, documentation.

Celebrate: fullstack Nuxt 4 case study ready for portfolio/demo.

**Done when (неделя):**

- UX polish + a11y fixes на основных страницах
- error.vue + empty states + toast feedback
- .github/workflows/ci.yml — lint, typecheck, build, test green
- README: demo, stack, screenshots, setup instructions
- Lighthouse performance/a11y — хорошие показатели
- Security checklist пройден; regression test OK
- Production deploy live; CI зелёный
- Можешь объяснить путь: кнопка → API → БД → UI

**Поздравление:** ты прошёл полный цикл modern fullstack-разработки на Nuxt 4!

**UI `/roadmap`:** детальный чеклист — [неделя 12 на `/roadmap`](/roadmap) (вкладка «Нед 12»).

---

## Недели 1–6 и 7–12 (коротко)

**Неделя 1**: см. [детальный план выше](#неделя-1--основы-nitro--prisma--tasks-ui).

**Неделя 2**: см. [детальный план выше](#неделя-2--углубление-в-nitro--prisma--улучшение-tasks).

**Неделя 3**: см. [детальный план выше](#неделя-3--polish-tasks--architecture--подготовка-к-auth).

**Неделя 4**: см. [детальный план выше](#неделя-4--better-auth--rbac--protected-routes).

**Неделя 5**: см. [детальный план выше](#неделя-5--error-handling--unified-api--zod).

**Неделя 6**: см. [детальный план выше](#неделя-6--advanced-crud--projects-relations-pagination-filters).

**Неделя 7**: см. [детальный план выше](#неделя-7--testing--file-uploads).

**Неделя 8**: см. [детальный план выше](#неделя-8--logging-cache-deploy).

**Неделя 9**: см. [детальный план выше](#неделя-9--admin-dashboard).

**Неделя 10**: см. [детальный план выше](#неделя-10--real-time-sse).

**Неделя 11**: см. [детальный план выше](#неделя-11--saas-core-workspaces--billing).

**Неделя 12**: см. [детальный план выше](#неделя-12--polish--cicd--docs-финальный-релиз).

### Целевая структура (CJ-inspired)

```
app/
  composables/     useAuth, useTasks, useProjects...
  middleware/      auth.ts
  pages/           login, register, tasks, projects, admin...
server/
  api/             auth/, tasks/ ...
  utils/           auth.ts, prisma.ts, tasks.ts, response.ts, apiHandler.ts, validation.ts
  middleware/
shared/types/      auth.ts, tasks.ts...
prisma/
docs/
```

---

## Рекомендации по параллельному изучению CJ курса

1. Смотри разделы:
   - Auth / Protected routes
   - Composables & State management
   - File uploads & Optimistic updates
   - Error handling & UX polish
2. Адаптируй идеи под Prisma + Better Auth (не копируй Drizzle 1:1).
3. После недели 6–7 реши, добавить ли `@onmax/nuxt-better-auth` модуль для declarative protection.

**Next step**: Неделя 6 — Advanced CRUD + Projects (relations, пагинация, filters). Checkpoint в `.planning/state.md`.
