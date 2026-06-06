# 12-недельный план: Nuxt 4 Fullstack

План для последовательного изучения backend и реализации в **Nuxt4_full**.
Расчёт: **~8–12 часов в неделю**. Предполагается, что [развёртывание](deployment-plan.md) завершено.

**Главный продукт к концу:** мини-SaaS «Task Board» — задачи, проекты, роли, админка, деплой, Stripe webhook-заготовки.

---

## Как пользоваться

1. В начале недели — прочитай «Теорию», открой `.planning/brief.md` (из `brief-template.md`).
2. Реализуй только задачи недели.
3. В конце: `pnpm lint:all`, `pnpm build`, commit `week-N: …`.
4. В `.planning/state.md` (локально) веди текущую неделю и чекбоксы.

**Правила проекта:**

- API на клиенте — только `useApi` / `useApiFetch`.
- Server routes — `server/api/`, валидация Zod (с недели 7).
- Минимальный diff.

**Структура папок:** [architecture.md](architecture.md) — зачем `shared/`, куда класть handlers/utils/plugins, слои типов.

---

## Обзор

| Нед | Тема                         | Результат                                |
| --- | ---------------------------- | ---------------------------------------- |
| 1   | Nitro + первый API           | Health, структура server/, типы, plugins |
| 2   | HTTP, middleware, ошибки     | Единый формат API                        |
| 3   | Docker + PostgreSQL + Prisma | БД в Docker, schema                      |
| 4   | Fullstack CRUD (Todo)        | Todo без auth                            |
| 5   | Аутентификация               | Register, login, session                 |
| 6   | Авторизация (RBAC)           | Роли, защита routes                      |
| 7   | Zod + API design             | Валидация, пагинация                     |
| 8   | Тестирование + файлы         | Vitest, upload                           |
| 9   | Логи, кэш, деплой            | Pino, Redis (opt), production            |
| 10  | Админка                      | Dashboard / Directus                     |
| 11  | Real-time                    | SSE / WebSocket                          |
| 12  | Capstone SaaS                | Stripe, CI/CD, polish                    |

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

## Неделя 2 — HTTP, middleware, ошибки

### Цель

Единый стиль API и централизованные ошибки.

### Теория

- REST, статусы, CORS (same-origin в Nuxt)
- Nitro middleware, `createError`

### Практика

- [ ] `server/utils/apiHandler.ts`
- [ ] `server/middleware/log.ts` — method + path + duration
- [ ] `POST /api/echo` + страница `/playground`
- [ ] `docs/api-conventions.md` — `{ data }` / `{ error }`

### Done when

- Ошибки → предсказуемый JSON
- Middleware логирует в dev

---

## Неделя 3 — Docker, PostgreSQL, Prisma

### Цель

БД локально + Prisma в Nitro.

### Теория

- Docker Compose, volumes
- Prisma: schema, migrate, seed
- `DATABASE_URL` только server-side

### Практика

- [ ] `docker-compose.yml` — PostgreSQL 16
- [ ] Prisma: модель `User` (без auth)
- [ ] `server/utils/prisma.ts` — singleton
- [ ] `GET /api/users` + seed
- [ ] Скрипты: `db:migrate`, `db:seed`, `db:studio`
- [ ] Обновить `.env.example`

### Done when

- `docker compose up` + migrate + seed
- `/api/users` из Postgres

---

## Неделя 4 — Fullstack CRUD: Todo (без auth)

### Цель

Vertical slice: UI ↔ API ↔ Prisma.

### Практика

- [ ] Prisma: `Todo`
- [ ] CRUD `/api/todos`
- [ ] UI `/todos`, composable `useTodos()`
- [ ] loading / error states

### Done when

- CRUD после restart dev + Docker
- Данные в volume Postgres

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
- [ ] Todo → `userId`

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
- [ ] DELETE todo — владелец или ADMIN

### Done when

- USER → admin API = 403
- Защита на server, не только UI

---

## Неделя 7 — Zod, API design

### Цель

Валидация и «взрослый» REST.

### Практика

- [ ] `readValidatedBody(event, schema)`
- [ ] Zod для auth и todos
- [ ] Пагинация `?page=&limit=&q=`
- [ ] Модель `Project`, relation с Todo
- [ ] `/projects`, `/projects/[id]`

### Done when

- Invalid body → 400 с issues
- Пагинация на 20+ seed

---

## Неделя 8 — Тестирование и файлы

### Практика

- [ ] Vitest + `@nuxt/test-utils`
- [ ] Тесты: health, auth, todo CRUD
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
- [ ] Users, todos, projects tables
- [ ] `GET /api/admin/stats`

### Done when

- ADMIN в `/admin`, USER → 403

---

## Неделя 11 — Real-time

### Практика

- [ ] SSE `/api/todos/stream` или WebSocket
- [ ] Live update на `/todos`
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
app/pages/          index, todos, projects, login, register, profile, admin
app/composables/    useTodos, useProjects, useAuth
app/middleware/     auth, admin
server/api/         health, auth, todos, projects, admin, billing
server/middleware/  log
server/utils/       prisma, auth, validate, apiHandler, logger
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
