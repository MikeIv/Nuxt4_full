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
| 3   | Fullstack UI: Tasks         | Страница `/tasks`, composable            |
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

- [ ] `docker-compose.yml` — PostgreSQL 16 (+ pgAdmin по желанию)
- [ ] Запуск: `docker compose up -d`
- [ ] `DATABASE_URL` в `.env` / `.env.example`
- [ ] **Checkpoint:** `docker compose ps` + подключение (psql / pgAdmin)

**Шаг 2 — Prisma (день 2)**

- [ ] `pnpm add -D prisma` + `pnpm add @prisma/client`
- [ ] `pnpm exec prisma init`
- [ ] `prisma/schema.prisma` — provider PostgreSQL
- [ ] `server/utils/prisma.ts` — singleton Client (`globalThis` в dev)
- [ ] `DATABASE_URL` через private `runtimeConfig` (не в client)
- [ ] Скрипты в `package.json`: `db:migrate`, `db:studio`
- [ ] **Checkpoint:** dev-сервер стартует; `$connect()` без ошибок

**Шаг 3 — Модель, migrate, seed (день 3)**

- [ ] Модель `Task`: `id`, `title`, `description`, `completed`, `createdAt`, `updatedAt`
- [ ] `pnpm exec prisma migrate dev`
- [ ] `prisma/seed.ts` — **3–5 задач** (рекомендуется, не опционально)
- [ ] `pnpm exec prisma db seed` + script `db:seed`
- [ ] **Checkpoint:** Prisma Studio показывает seed-данные

**Шаг 4 — Контракт + utils + GET/POST (день 4)**

Сначала слои, потом routes — **не наоборот**:

- [ ] `shared/types/task.ts` — `Task`, DTO create/update, response types
- [ ] `server/utils/tasks.ts` — `listTasks()`, `createTask()` (Prisma здесь)
- [ ] `server/api/tasks.get.ts` — thin → `listTasks()`
- [ ] `server/api/tasks.post.ts` — thin → Zod body → `createTask()`
- [ ] Ответы через `ok(data)` → `{ data, success: true }`
- [ ] **Checkpoint:** GET возвращает seed; POST добавляет строку в Studio

**Шаг 5 — PATCH/DELETE + ошибки (день 5)**

- [ ] `server/utils/tasks.ts` — `getTaskById`, `updateTask`, `deleteTask`
- [ ] `server/api/tasks/[id].get.ts`, `[id].patch.ts`, `[id].delete.ts`
- [ ] Zod для PATCH body; `createError({ statusCode: 404 })` если id не найден
- [ ] Invalid body → 400 (минимально, без apiHandler)
- [ ] **Checkpoint:** curl patch + delete; `GET /api/tasks/nonexistent` → 404 JSON

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

- [ ] Все 5 пунктов пройдены
- [ ] **Checkpoint:** после restart Docker данные в volume сохранились

**Шаг 7 — Архитектура (день 7)**

- [ ] Пройтись по handlers: нет Prisma/Zod в `server/api/*`
- [ ] Обновить `docs/architecture.md` — поток Client → Prisma → PostgreSQL
- [ ] `pnpm lint:all` + `pnpm build`

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

- [ ] PostgreSQL запущен через Docker
- [ ] Prisma настроен и подключён (singleton)
- [ ] Seed + migrate; CRUD `/api/tasks` пройден **curl-чеклистом**
- [ ] Данные сохраняются после restart Docker / dev
- [ ] Handlers тонкие — Prisma только в `server/utils/tasks.ts`
- [ ] Обновлён `docs/architecture.md`
- [ ] Понимаешь lifecycle: handler → utils → prisma → PostgreSQL

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

Vertical slice на UI: страница задач поверх CRUD API недели 2.

### Теория

- `useApiFetch` + composable для списка
- loading / error / empty states

### Практика

- [ ] `app/composables/useTasks.ts`
- [ ] Страница `app/pages/tasks.vue` — список, создание, toggle completed
- [ ] Типы из `shared/types/task.ts`
- [ ] SSR + client hydration без регрессий

### Done when

- CRUD с UI после restart dev + Docker
- Данные в volume Postgres сохраняются между перезапусками

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
