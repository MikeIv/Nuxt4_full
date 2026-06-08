# 12-недельный план: Nuxt 4 Fullstack

План для последовательного изучения backend и реализации в **Nuxt4_full**.
Расчёт: **~7–10 часов в неделю** (1–2 ч в день). Предполагается, что [развёртывание](deployment-plan.md) завершено.

**Главный продукт к концу:** мини-SaaS «Task Board» — задачи, проекты, роли, админка, деплой, Stripe webhook-заготовки.

---

## Как пользоваться

1. В начале недели — прочитай «Теорию», открой `.planning/brief.md` (из `brief-template.md`).
2. Реализуй только задачи недели.
3. В конце: `pnpm lint:all`, `pnpm build`, commit `week-N: …`.
4. В `.planning/state.md` (локально) веди текущую неделю и чекбоксы.

**Правила проекта:**

- API на клиенте — только `useApi` / `useApiFetch`.
- Server routes — `server/api/`, знакомство с Zod — с [недели 2](#неделя-2--prisma--postgresql--task-crud); углублённая валидация — нед. 7.
- Минимальный diff.

**Структура папок:** [architecture.md](architecture.md) — зачем `shared/`, куда класть handlers/utils/plugins, слои типов.

---

## Обзор

| Нед | Тема                        | Результат                                |
| --- | --------------------------- | ---------------------------------------- |
| 1   | Nitro + первый API          | Health, структура server/, типы, plugins |
| 2   | Prisma + PostgreSQL + Tasks | Docker, schema, CRUD `/api/tasks`        |
| 3   | Fullstack UI: Tasks         | /tasks + useTasks + optimistic + states  |
| 4   | HTTP, ошибки, API design    | apiHandler, `{ data, success, error? }`  |
| 5   | Аутентификация              | Register, login, session                 |
| 6   | Авторизация (RBAC)          | Роли, защита routes                      |
| 7   | Zod + API design            | Валидация, пагинация                     |
| 8   | Тестирование + файлы        | Vitest, upload                           |
| 9   | Логи, кэш, деплой           | Pino, Redis (opt), production            |
| 10  | Админка                     | Dashboard / Directus                     |
| 11  | Real-time                   | SSE / WebSocket                          |
| 12  | Capstone SaaS               | Stripe, CI/CD, polish                    |

---

## Неделя 1 — Nitro и первый backend

### Цель

Полностью понять backend в Nuxt 4 (Nitro): типизированные API, end-to-end frontend ↔ backend, правильная архитектура — до CRUD и БД.

### Текущий прогресс

- ✅ Структура проекта
- ✅ `runtimeConfig` + типизация (`types/nuxt-public.d.ts`)
- ✅ `shared/types/health.ts`
- ✅ `server/utils/health.ts` + thin handler
- ✅ `server/api/health.get.ts`
- ✅ Health на главной (`useApiFetch`)

### Теория (2–3 ч)

Порядок тем **совпадает с практикой**. Неделя 1 — сделана (шаги 1–7 + рекомендуемые).

1. **Тема:** ✅ Контракт — `shared/types/health.ts`
2. **Тема:** ✅ Thin handler — `health.get.ts` + `server/utils/health.ts`
3. **Тема:** ✅ End-to-end — `useApiFetch` + SSR
4. **Тема:** ✅ POST — `health.post.ts` (`readBody`)
5. **Тема:** ✅ `server/middleware/log.ts` (middleware → handler)
6. **Тема:** ✅ `runtimeConfig` — apiBase, `nuxt-public.d.ts`, `runtimeConfig.ts`
7. **Тема:** ✅ `docs/architecture.md` — актуализировать схему
8. **Тема:** ✅ `server/plugins/00-boot.ts` (рекомендуется)
9. **Тема:** ✅ `server/utils/apiResponse.ts` — `ok(data)` (рекомендуется)

### Практика

**Сделано** — подсказки: [/roadmap](/roadmap) → «Неделя 1».

1. [x] Контракт `shared/types/health.ts`
2. [x] Thin handler `health.get.ts` + `server/utils/health.ts`
3. [x] Health на главной (`useApiFetch` + SSR)
4. [x] POST `/api/health`
5. [x] Middleware `server/middleware/log.ts`
6. [x] `runtimeConfig` + типизация
7. [x] `docs/architecture.md`
8. [x] `server/plugins/00-boot.ts` (рекомендуется)
9. [x] `server/utils/apiResponse.ts` — `ok(data)` (рекомендуется)

### Структура (неделя 1)

**Порядок выполнения** (актуальный roadmap ментора):

```
✅ 1. shared/types/health.ts
✅ 2. server/utils/health.ts + server/api/health.get.ts
✅ 3. app/pages/index.vue (useApiFetch)
✅ 4. server/api/health.post.ts
✅ 5. server/middleware/log.ts
✅ 6. nuxt.config.ts + types/nuxt-public.d.ts + .env.example + runtimeConfig.ts
✅ 7. docs/architecture.md
✅ 8. server/plugins/00-boot.ts (рекомендуется)
✅ 9. server/utils/apiResponse.ts (рекомендуется)
```

**Дерево файлов** (итог недели):

```
shared/types/health.ts
server/utils/health.ts
server/api/health.get.ts
server/api/health.post.ts
server/middleware/log.ts
app/pages/index.vue
nuxt.config.ts
types/nuxt-public.d.ts
docs/architecture.md
server/utils/runtimeConfig.ts
server/utils/apiResponse.ts
server/plugins/00-boot.ts
```

`shared/` не переносить в `app/` — официальный isomorphic-слой Nuxt 4.

### Done when

- [x] Есть GET и POST `/api/health`
- [x] Health отображается на главной странице
- [x] Работает middleware-логгер
- [x] Понимаешь **public** / **private** в `runtimeConfig`
- [x] Актуален `docs/architecture.md`
- [x] Понимаешь структуру: `app/`, `server/`, `shared/types/`, `server/utils/`
- [x] Handlers тонкие — бизнес-логика только в `server/utils/`

### Промпты Cursor

- «Объясни lifecycle: useApiFetch → Nitro → defineEventHandler → utils»
- «Сделай health.get.ts как thin handler с Promise<HealthResponse>»
- «Чем server/middleware/log.ts отличается от server/plugins?»
- «Почему POST — health.post.ts, а не \_health.post.ts?»

---

## Неделя 2 — Prisma + PostgreSQL + Task CRUD

### Цель

Научиться работать с настоящей БД внутри Nuxt 4: Docker + PostgreSQL, Prisma, CRUD задач и безопасный доступ к БД из `server/api`.

**Темп:** ~1–2 ч в день, **~7–10 ч** за неделю.

> **Принцип недели:** сначала **types + utils + один endpoint**, потом остальной CRUD.
> Zod и `createError` — минимально; единый `apiHandler` и `docs/api-conventions.md` — [неделя 4](#неделя-4--http-middleware-ошибки).
> **План v2 — канон** (подтверждён ментором 2026-06-06).

### Текущий прогресс

- ✅ Docker + PostgreSQL (день 1) — `docker compose ps` healthy, подключение подтверждено
- ✅ Prisma init + singleton + `DATABASE_URL` (день 2) — `$connect()` без ошибок, hot-reload готов
- ✅ Модель `Task` + migrate + seed 4 задач (день 3) — Prisma Studio показывает данные
- ✅ Types + utils + GET/POST (день 4) — Postman, ответы `{ data: Task }`, thin handlers
- ✅ PATCH/DELETE + ошибки 404/400 (день 5) — валидация, Postman, Prisma Studio
- ✅ curl-чеклист + persistence (день 6) — все 5 шагов, данные после `docker compose restart`
- ✅ Рефакторинг + `docs/architecture.md` + lint/build (день 7) — каноническая секция от ментора, exit 0

### План по дням

| День | Тема                                    | Время   | Checkpoint (конец дня)                                      |
| ---- | --------------------------------------- | ------- | ----------------------------------------------------------- |
| 1    | Docker + PostgreSQL                     | 1–1.5 ч | `docker compose ps` — postgres healthy                      |
| 2    | Prisma init + singleton                 | 1.5 ч   | `prisma db execute` или тест `$connect()` без ошибок        |
| 3    | Schema `Task` + migrate + **seed**      | 1–2 ч   | Prisma Studio — таблица + 3–5 задач из seed                 |
| 4    | Types, utils, **GET + POST**            | 1.5–2 ч | GET `/api/tasks` → JSON из Postgres; POST → задача в Studio |
| 5    | **PATCH + DELETE** + ошибки 404/400     | 1–1.5 ч | curl-чеклист: patch + delete + bad id → 404                 |
| 6    | **curl-чеклист** + проверка persistence | 1 ч     | CRUD через curl; данные живут после `docker restart`        |
| 7    | Рефакторинг + `docs/architecture.md`    | 1 ч     | architecture.md отражает prisma/; handlers тонкие           |

### Теория

- Docker Compose, volumes, `DATABASE_URL` только server-side
- Prisma: schema, migrate, seed, Client в Nitro (singleton + HMR)
- **Порядок разработки endpoint:** `shared/types/` → `server/utils/` → thin handler
- Знакомство с **Zod** только для POST/PATCH body (полная валидация — нед. 7)
- Ответы: `{ data, success }`; ошибки: `createError` (обёртка `apiHandler` — нед. 4)

### Практика (порядок шагов)

**Шаг 1 — Docker + PostgreSQL (день 1)**

- [x] `docker-compose.yml` — PostgreSQL 16 (+ pgAdmin по желанию)
- [x] Запуск: `docker compose up -d`
- [x] `DATABASE_URL` в `.env` / `.env.example`
- [x] **Checkpoint:** `docker compose ps` + подключение (psql / pgAdmin) — выполнен 2026-06-07

**Шаг 2 — Prisma (день 2)**

- [x] `pnpm add -D prisma` + `pnpm add @prisma/client`
- [x] `pnpm exec prisma init`
- [x] `prisma/schema.prisma` — provider PostgreSQL
- [x] `server/utils/prisma.ts` — singleton Client (`globalThis` в dev) + Prisma 7 adapter
- [x] `DATABASE_URL` через private `runtimeConfig` (не в client)
- [x] Скрипты в `package.json`: `db:migrate`, `db:studio`
- [x] **Checkpoint:** dev-сервер стартует; `$connect()` без ошибок — выполнен 2026-06-07 (логи: `[nitro] boot`, `prisma:query SELECT 1`)

**Шаг 3 — Модель, migrate, seed (день 3)**

- [x] Модель `Task`: `id`, `title`, `description`, `completed`, `createdAt`, `updatedAt`
- [x] `pnpm exec prisma migrate dev` (таблица создана в миграции 20260607075331_init)
- [x] `prisma/seed.ts` — **4 задачи** (рекомендуется, не опционально)
- [x] `pnpm exec prisma db seed` + script `db:seed` (добавлен в package.json)
- [x] **Checkpoint:** Prisma Studio показывает seed-данные — выполнен 2026-06-07 (4 задачи в таблице tasks, screenshot предоставлен)

**День 4 (GET + POST) — выполнен 2026-06-07**

- POST /api/tasks успешно создаёт задачу (Postman screenshot с телом и ответом `{ data: Task }`).
- Структура: shared/types/tasks.ts (Task + DTOs) → server/utils/tasks.ts (с Prisma) → тонкие handlers.

**День 5 (PATCH/DELETE + ошибки) — выполнен 2026-06-07**

- PATCH /api/tasks/:id обновляет задачу (title/description/completed), DELETE удаляет.
- Оба подтверждены в Postman (записи меняются/пропадают в Prisma Studio).
- Ручная валидация (минимум) + `createError(400/404)`. Полноценный Zod — отложен на Неделю 4 по рекомендации ментора.
- Исправлены мелкие несоответствия (mapTaskDates для update, типы ответов, гвард id в GET).

**Шаг 4 — Контракт + utils + GET/POST (день 4)**

Сначала слои, потом routes — **не наоборот**:

- [x] `shared/types/tasks.ts` — `Task`, DTO create/update, response types (naming per mentor: plural module)
- [x] `server/utils/tasks.ts` — `getAllTasks()`, `createTask()` (Prisma здесь)
- [x] `server/api/tasks.get.ts` — thin → getAllTasks()
- [x] `server/api/tasks.post.ts` — thin handler (manual title validation + createTask)
- [x] Ответы в формате `{ data: Task }` (consistent with project)
- [x] **Checkpoint:** POST добавляет строку (Postman screenshot 2026-06-07). GET возвращает данные из БД (включая seed + новые).

**Шаг 5 — PATCH/DELETE + ошибки (день 5)**

- [x] `server/utils/tasks.ts` — `getTaskById`, `updateTask`, `deleteTask` (с mapTaskDates для консистентности дат)
- [x] `server/api/tasks/[id].get.ts`, `[id].patch.ts`, `[id].delete.ts` (thin handlers)
- [x] Ручная валидация + `createError(400/404)` (Zod отложен на Неделю 4 по совету ментора)
- [x] **Checkpoint:** Postman PATCH + DELETE (записи обновляются/удаляются в БД, Prisma Studio). GET /nonexistent → 404. typecheck + lint чистые. (2026-06-07)

**Шаг 6 — curl-чеклист + persistence (день 6)**

Обязательная ручная проверка (UI — [неделя 3](#неделя-3--fullstack-ui-tasks)):

```bash
# 1. List (seed)
curl -s http://localhost:3000/api/tasks | jq

# 2. Create
curl -s -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"From curl","description":"week 2"}' | jq

# 3. Patch (подставь id из ответа)
curl -s -X PATCH http://localhost:3000/api/tasks/<ID> \
  -H 'Content-Type: application/json' \
  -d '{"completed":true}' | jq

# 4. Delete
curl -s -X DELETE http://localhost:3000/api/tasks/<ID> -w '\nHTTP %{http_code}\n'

# 5. Persistence: docker compose restart → GET list — данные на месте
```

- [x] Все 5 пунктов пройдены (list после seed + ручных записей; create/patch/delete в предыдущие дни + повторные; persistence подтверждена)
- [x] **Checkpoint:** `curl -s http://localhost:3000/api/tasks` после перезапуска сервера + БД + dev показывает все записи (seed + добавленные) — данные в Docker volume на месте. (2026-06-07, пользователь предоставил вывод)

**День 6 (curl-чеклист + persistence) — выполнен 2026-06-07**

- Полный список задач через curl после множественных перезапусков (сервер, docker DB, dev).
- Данные (включая seed 4 задачи + тестовые из Postman/ручного добавления) сохранились.
- Thin handlers + Prisma только в utils подтверждены (grep по server/api/tasks\* — 0 упоминаний Prisma).
- Соответствует v2: persistence — ключевой чек для Docker volume.

**Шаг 7 — Архитектура (день 7)**

- [x] Пройтись по handlers: нет Prisma/Zod в `server/api/*` (grep подтвердил; вся логика в server/utils/tasks.ts)
- [x] Обновить `docs/architecture.md` — добавлена каноническая секция «# Архитектура проекта (Неделя 2)» по тексту ментора (общая схема, структура папок, текущие API, Best Practices)
- [x] `pnpm lint:all` + `pnpm build` + typecheck — чисто (2026-06-07)

**День 7 (architecture.md + lint/build) — выполнен 2026-06-07**

- Обновлён `docs/architecture.md` точной секцией, предоставленной ментором.
- Проверки: lint чистый, production build успешен (exit 0), typecheck 0 ошибок.
- Handlers остаются тонкими.

### Структура (неделя 2)

```
docker-compose.yml
prisma/
  schema.prisma
  seed.ts              # 3–5 задач
shared/types/task.ts
server/utils/prisma.ts
server/utils/tasks.ts
server/api/tasks.get.ts
server/api/tasks.post.ts
server/api/tasks/[id].get.ts
server/api/tasks/[id].patch.ts
server/api/tasks/[id].delete.ts
.env.example           # DATABASE_URL
docs/architecture.md   # обновить (день 7)
```

### Done when

- [x] PostgreSQL запущен через Docker
- [x] Prisma настроен и подключён (singleton)
- [x] Seed + migrate; CRUD `/api/tasks` пройден **curl-чеклистом**
- [x] Данные сохраняются после restart Docker / dev
- [x] Handlers тонкие — Prisma только в `server/utils/tasks.ts`
- [x] Обновлён `docs/architecture.md`
- [x] Понимаешь lifecycle: handler → utils → prisma → PostgreSQL

### Промпты Cursor

- «Объясни lifecycle: defineEventHandler → server/utils/tasks → prisma → PostgreSQL»
- «Сделай server/utils/prisma.ts singleton для dev hot-reload»
- «Сначала shared/types/task.ts и utils, потом thin handler tasks.get.ts»
- «PATCH tasks/[id] с Zod и createError 404 — без apiHandler»

### Синхронизация с ментором

Изменения v2 (2026-06-06): см. [mentor-week2-sync.md](mentor-week2-sync.md) — текст для ментора.

---

## Неделя 3 — Fullstack UI: Tasks

### Цель

Создать полноценную интерактивную страницу задач, которая работает с нашим CRUD API из Недели 2. Замкнуть полный fullstack цикл: от базы данных → API → UI с состоянием, загрузкой и ошибками.

**Темп:** ~1–2 ч в день, **~7–10 ч** за неделю.

> **Принцип недели:** composable `useTasks()` как единый источник правды для UI; optimistic updates только для toggle; состояния loading/empty/error — обязательно; SSR без лишних запросов.

### План по дням

| День | Тема                       | Время   | Checkpoint (конец дня)                                                |
| ---- | -------------------------- | ------- | --------------------------------------------------------------------- |
| 1    | Composables: useTasks()    | 1.5–2 ч | `fetch/create/update/delete/toggleComplete` + кэширование             |
| 2    | Страница Tasks             | 1.5 ч   | Список (карточки/таблица) + форма создания; кнопки действий           |
| 3    | Состояния интерфейса       | 1–1.5 ч | Loading skeleton, Empty, Error + retry; toast-уведомления             |
| 4    | Optimistic updates + UX    | 1.5 ч   | Toggle сразу в UI, rollback при ошибке, refresh после мутаций         |
| 5    | Полировка + SSR + фильтры  | 1–1.5 ч | SSR-гидратация; docker restart + persist; базовая сортировка/фильтр   |
| 6-7  | Рефакторинг + Документация | 1–2 ч   | Чистый код, `docs/architecture.md` обновлён, комментарии, полный тест |

### Теория

- `useApiFetch` + composables (`useTasks()`)
- Управление состоянием на клиенте (`ref`, `computed`)
- Loading / Error / Empty states
- SSR + клиентская гидратация (без лишних перезагрузок)
- Оптимистичные обновления (optimistic updates) — базово
- Лучшие практики работы с данными в Nuxt 4

**Дополнительные рекомендации (адаптировано):**

- Для UI: семантика + CSS Modules (`$style`); Nuxt UI (`<UCard>`, `<UButton>`, `useToast()`) — по плану в неделю 10. На этой неделе — без добавления модуля.
- Код максимально чистый и переиспользуемый.
- Уведомления: простой toast-composable или заготовка под `useToast`.

### Практика (порядок шагов)

**День 1 — Composables**

- [ ] Создать `app/composables/useTasks.ts`
- [ ] Реализовать: `fetchTasks()`, `createTask()`, `updateTask()`, `deleteTask()`, `toggleComplete()`
- [ ] Использовать `useAsyncData` / `useApiFetch` + кэширование (ключ `'tasks'`)
- [ ] Строгие типы из `shared/types/tasks.ts` (Task, Create/Update DTO)
- [ ] Экспорт состояния и действий: `{ tasks, pending, error, refresh, create, update, remove, toggle }`

**День 2 — Страница Tasks**

- [ ] Создать `app/pages/tasks.vue`
- [ ] Список задач (карточки или таблица на `$style`)
- [ ] Форма создания новой задачи (title обязательно, description опционально)
- [ ] Кнопки: Toggle completed, Edit, Delete на каждой задаче
- [ ] Подключить `useTasks()`: данные + обработчики

**День 3 — Состояния интерфейса**

- [ ] Loading skeleton (во время `pending`)
- [ ] Empty state (задач нет)
- [ ] Error state + кнопка «Повторить» (вызов `refresh()`)
- [ ] Toast-уведомления об успехе/ошибке (простая реализация)

**День 4 — Оптимистичные обновления + UX**

- [ ] Optimistic toggle completed: меняем UI сразу, подтверждаем на сервере
- [ ] Обработка ошибок с откатом состояния (rollback)
- [ ] `refresh()` после мутаций (create/update/delete)
- [ ] Защита от двойных действий (disabled во время pending)

**День 5 — Полировка + SSR проверка**

- [ ] Убедиться в корректной работе при SSR (просмотр HTML до гидратации)
- [ ] Проверка после `docker compose restart postgres` + рестарт dev-сервера
- [ ] Базовая сортировка / фильтр (все / активные / завершённые; по дате)
- [ ] `definePageMeta` (при необходимости layout)

**День 6-7 — Рефакторинг + Документация**

- [ ] Вынести повторяющийся код (при необходимости)
- [ ] Обновить `docs/architecture.md` (секция fullstack tasks, поток данных)
- [ ] Добавить комментарии в код
- [ ] Итоговый тест всего флоу (CRUD + optimistic + фильтры + persist)

### Структура (неделя 3)

```
app/composables/useTasks.ts
app/pages/tasks.vue
app/components/ (опционально: TaskCard.vue / TaskForm.vue — минимально)
docs/architecture.md   # обновить (дни 6-7)
```

### Done when (критерии завершения недели)

- [ ] Есть полноценная страница `/tasks` с CRUD
- [ ] Работают loading, empty и error состояния
- [ ] Используется composable `useTasks()`
- [ ] Optimistic updates на toggle completed (с rollback при ошибке)
- [ ] Данные сохраняются после перезапуска Docker + Nuxt
- [ ] Страница красиво выглядит и удобно используется (семантика, стили, a11y)
- [ ] `docs/architecture.md` обновлён
- [ ] Пройдены `pnpm lint:all`, `pnpm build`, typecheck

### Промпты Cursor

- «Создай composable useTasks.ts: методы CRUD + toggle, на базе useApiFetch и useAsyncData с кэшем»
- «В tasks.vue реализуй optimistic toggle completed с rollback на ошибку»
- «Добавь skeleton, empty и error states + retry в страницу задач»
- «Сделай базовый фильтр и сортировку задач (active / completed)»
- «Обнови docs/architecture.md — добавь диаграмму/описание потока для /tasks и useTasks»

---

## Неделя 4 — HTTP, middleware, ошибки

### Цель

Единый стиль API и централизованные ошибки — **унификация** паттернов нед. 2 (`createError`, `{ data, success }`).

### Теория

- REST, статусы, CORS (same-origin в Nuxt)
- Nitro middleware, `createError`

### Практика

- [ ] `server/utils/apiHandler.ts` — обёртка handler + try/catch
- [ ] `server/middleware/log.ts` — method + path + duration
- [ ] `POST /api/echo` + страница `/playground`
- [ ] `docs/api-conventions.md` — `{ data, success, error? }`

### Done when

- Ошибки → предсказуемый JSON
- Middleware логирует duration в dev

---

## Неделя 5 — Аутентификация

### Цель

Sessions, register, login.

### Теория

- Session vs JWT, cookies httpOnly
- **Выбрать один:** `nuxt-auth-utils` (рекомендуется) или Lucia

### Практика

- [ ] User + passwordHash
- [ ] `/api/auth/register`, login, logout, me
- [ ] `/login`, `/register`, middleware `auth.ts`
- [ ] Task → `userId`

### Done when

- Без login нельзя создавать «свои» todos
- Session secret в `.env`

---

## Неделя 6 — Авторизация (RBAC)

### Цель

Authentication vs authorization.

### Практика

- [ ] Role: USER, ADMIN
- [ ] `requireUser`, `requireAdmin`
- [ ] `GET /api/admin/users` — только ADMIN
- [ ] DELETE task — владелец или ADMIN

### Done when

- USER → admin API = 403
- Защита на server, не только UI

---

## Неделя 7 — Zod, API design

### Цель

Валидация и «взрослый» REST.

### Практика

- [ ] `readValidatedBody(event, schema)`
- [ ] Zod для auth и tasks
- [ ] Пагинация `?page=&limit=&q=`
- [ ] Модель `Project`, relation с Task
- [ ] `/projects`, `/projects/[id]`

### Done when

- Invalid body → 400 с issues
- Пагинация на 20+ seed

---

## Неделя 8 — Тестирование и файлы

### Практика

- [ ] Vitest + `@nuxt/test-utils`
- [ ] Тесты: health, auth, task CRUD
- [ ] Upload avatar → `POST /api/users/avatar`
- [ ] `/profile`

### Done when

- `pnpm test` проходит
- Upload с лимитом размера

---

## Неделя 9 — Логи, кэш, деплой

### Практика

- [ ] Pino в `server/utils/logger.ts`
- [ ] (Optional) Redis cache
- [ ] Health + DB check
- [ ] Deploy (Railway / Hetzner / Vercel)
- [ ] `docs/deployment-production.md`

### Done when

- Staging URL, health `db: connected`
- Migrations on deploy

---

## Неделя 10 — Админка

**Путь B (рекомендуется):** Nuxt UI custom admin.

### Практика

- [ ] `@nuxt/ui`, layout `/admin`
- [ ] Users, tasks, projects tables
- [ ] `GET /api/admin/stats`

### Done when

- ADMIN в `/admin`, USER → 403

---

## Неделя 11 — Real-time

### Практика

- [ ] SSE `/api/tasks/stream` или WebSocket
- [ ] Live update на `/tasks`
- [ ] `docs/realtime.md`

### Done when

- Два браузера — изменения синхронизируются

---

## Неделя 12 — Capstone: mini-SaaS

### Практика

- [ ] `Workspace`, `WorkspaceMember`
- [ ] Stripe test checkout + webhook
- [ ] Free plan: max 3 projects
- [ ] `.github/workflows/ci.yml`
- [ ] README: demo, stack, screenshots

### Done when

- CI зелёный
- Stripe test session работает
- Можешь объяснить путь: кнопка → API → БД → UI

---

## Целевая структура к неделе 12

```
app/pages/          index, tasks, projects, login, register, profile, admin
app/composables/    useTasks, useProjects, useAuth
app/middleware/     auth, admin
server/api/         health, auth, tasks, projects, admin, billing
server/middleware/  log
server/utils/       prisma, tasks, auth, validate, apiHandler, logger
prisma/             schema, seed
docker-compose.yml
docs/               architecture, api-conventions, deployment, realtime
```

---

## Еженедельный ритуал

```bash
pnpm lint:all
pnpm test    # с недели 8
pnpm build
git commit -m "week-N: краткое описание"
```

---

## Метрики готовности

К концу 12 недель:

- [ ] `defineEventHandler` + Prisma + auth
- [ ] Session, RBAC, validation, migrations
- [ ] Integration test на API
- [ ] Deploy Nuxt + Postgres
- [ ] Client vs server middleware — не путаешь

---

## После 12 недель

1. Laravel + Filament — второй стек
2. tRPC / GraphQL
3. Клон Notion / Trello
4. Open-source starter template
