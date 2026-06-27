# 12-недельный план: Nuxt 4 Fullstack (Better Auth + CJ Style)

**Стек**: Nuxt 4 (Nitro) + **Prisma** + **Better Auth** + TypeScript.
**Вдохновение**: архитектура, UX и full-stack flow из курса CJ (Syntax Travel Log).

**Главный продукт**: мини-SaaS «Task Board» (задачи, проекты, workspaces, роли, Stripe).

**Темп**: 7–10 ч/неделю. Сегодня старт **Недели 4**.

---

## Как пользоваться

1. В начале недели — прочитай «Теорию», открой `.planning/brief.md` (из `brief-template.md`).
2. Реализуй только задачи недели.
3. В конце: `pnpm lint:all`, `pnpm build`, commit `week-N: …`.
4. В `.planning/state.md` (локально) веди текущую неделю и чекбоксы.

**Правила проекта:**

- API на клиенте — только `useApi` / `useApiFetch`.
- Server routes — `server/api/`; auth — [неделя 4](#неделя-4--better-auth--rbac--protected-routes); Zod + unified API — [неделя 5](#неделя-5--error-handling--api--zod).
- Минимальный diff.

**Структура папок:** [architecture.md](architecture.md) — зачем `shared/`, куда класть handlers/utils/plugins, слои типов.

---

## Обзор

| Нед | Тема                             | Ключевой результат                        |
| --- | -------------------------------- | ----------------------------------------- |
| 1–3 | ✅ Nitro + Prisma + Tasks UI     | Health, CRUD Tasks, useTasks + optimistic |
| 4   | **Better Auth** + Protected UI   | Полная auth, RBAC, protected routes       |
| 5   | Error Handling + API + Zod       | Unified responses, валидация              |
| 6   | Advanced CRUD + Projects         | Relations, пагинация, filters             |
| 7   | Testing + File Uploads           | Vitest, avatars                           |
| 8   | Logging, Cache, Deploy           | Production-ready                          |
| 9   | Admin Dashboard                  | Nuxt UI tables + admin                    |
| 10  | Real-time (SSE)                  | Live updates                              |
| 11  | SaaS Core (Workspaces + Billing) | Multi-tenant, Stripe                      |
| 12  | Polish + CI/CD + Docs            | Финальный релиз                           |

---

## Неделя 4 — Better Auth + RBAC + Protected Routes (старт сегодня)

**Цель**: Современная, production-ready авторизация с минимальным boilerplate (как в CJ).

**Почему Better Auth лучше Lucia здесь**:

- Готовые плагины (email, OAuth, 2FA, rate limiting, organizations).
- Отличная Nuxt-интеграция (middleware, composables, routeRules).
- Меньше ручной работы с sessions/cookies.

### План по дням

| День | Тема                                         | Checkpoint                                             |
| ---- | -------------------------------------------- | ------------------------------------------------------ |
| 1    | Установка + Prisma-схема + базовая настройка | migrate OK; pnpm dev без ошибок; User/Session в Studio |
| 2    | Register / Login / Logout (API + UI)         | Работает email/password                                |
| 3    | Protected routes (server + client)           | /api/tasks → 401 без сессии                            |
| 4    | useAuth composable + Login/Register pages    | Редиректы, loading states                              |
| 5    | User menu + Pages middleware                 | /tasks защищена                                        |
| 6    | RBAC (roles) + owner checks                  | ADMIN / owner-only actions                             |
| 7    | Refactor + security + architecture.md        | Полный тест + docs                                     |

### Практика (порядок)

**День 1 — Установка + Prisma-схема + базовая настройка Better Auth**

**Цель дня:** полностью настроить Better Auth с Prisma, выполнить миграцию, убедиться что `pnpm dev` стартует без ошибок.

**Теория (30–45 мин):** Better Auth — современная auth-библиотека (email/password, sessions, OAuth, 2FA, organizations). Ключевые понятия: **Adapter** (Prisma), **betterAuth()** instance, **Schema Generation**, **runtimeConfig** (AUTH_SECRET server-only). Источники: [Nuxt Integration](https://better-auth.com/docs/integrations/nuxt), [Prisma Adapter](https://better-auth.com/docs/adapters/prisma), `@onmax/nuxt-better-auth@alpha`.

**Практика (7 шагов):**

1. **Пакеты:** `pnpm add better-auth @better-auth/prisma-adapter @onmax/nuxt-better-auth@alpha`
2. **Prisma schema:** `User` (role @default("USER")), `Session`, связь `Task.userId` → `User`
3. **`server/utils/auth.ts`:** `betterAuth()` + `prismaAdapter(prisma, { provider: "postgresql" })`, `emailAndPassword: { enabled: true, autoSignIn: true, minPasswordLength: 8 }`
4. **`nuxt.config.ts`:** `modules: ['@onmax/nuxt-better-auth']`
5. **Env:** `DATABASE_URL`, `AUTH_SECRET` (`openssl rand -hex 32`) в `.env` / `.env.example` + private `runtimeConfig`
6. **Миграция:** `pnpm exec prisma migrate dev --name add_better_auth` + `pnpm exec prisma generate`
7. **Проверка:** `pnpm dev` (логи без ошибок auth/Prisma); `pnpm prisma studio` — таблицы User и Session

**Done when (день 1):** пакеты установлены; schema + `auth.ts` готовы; миграция OK; сервер стартует; AUTH_SECRET настроен. `docs/architecture.md` — короткая заметка про auth (можно в конце дня).

**День 2 — Register / Login / Logout (API) + server middleware**

**Цель:** auth API работает через curl; `/api/tasks*` требует сессию.

1. **Catch-all:** `server/api/auth/[...all].ts` → `auth.handler(toWebRequest(event))` (официальная дока; без `toWebRequest` — только если проверил).
2. **Проверка API:** `POST /api/auth/sign-up/email`, `sign-in/email`, `sign-out`, `GET /api/auth/get-session` (не `/api/auth/session`).
3. **`getSession(event)`** в `server/utils/auth.ts` → `auth.api.getSession({ headers: event.headers })`.
4. **`server/middleware/auth.ts`:** пропускать `/api/auth/**`, `/api/health`, `/api/notes-access/**`; иначе 401; `event.context.user`.
5. **`/api/tasks*`:** thin handlers → `event.context.user.id` → `getAllTasks(userId)` в utils.

**Done when (день 2):** sign-up/sign-in/sign-out через curl; GET `/api/tasks` без cookie → 401; с cookie → список задач.

**День 3 — Защита API (углубление)**

**Цель:** все tasks routes защищены; owner-only CRUD.

1. **curl-чеклист:** GET/POST/PATCH/DELETE `/api/tasks*` без сессии → 401.
2. **Owner checks:** PATCH/DELETE чужой задачи → 404; только свои задачи в списке.
3. **Типы:** `event.context.session` / `user` в augmentation (без `any`).
4. **Убрать** `resolveDefaultTaskUserId` — только реальный `userId` из сессии.

**Done when (день 3):** User A не видит задачи User B; typecheck чистый.

**День 4–5 — Клиентская часть** (по плану ментора — после server-side)

- `app/composables/useAuth.ts` (или composables `@onmax/nuxt-better-auth`).
- Страницы `/login`, `/register` — формы + loading/error.
- `app/middleware/auth.ts` — `/tasks` только с сессией; `/login` редирект если уже вошёл.

**Частые проблемы (день 2–3):**

| Проблема                                | Решение                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| 404 на `/api/auth/session`              | Endpoint — `/api/auth/get-session`                                                     |
| `auth.handler(event)` vs `toWebRequest` | Официальная дока — `toWebRequest(event)`; убрать только если handler работает без него |
| Cookie не отправляются                  | same-origin; проверь Set-Cookie после sign-in                                          |
| AUTH_SECRET пустой                      | `.env` + `runtimeConfig.authSecret`                                                    |
| Prisma User not found                   | Миграция + поля email, name, emailVerified                                             |
| 401 на `/api/health`                    | Добавь `/api/health` в исключения middleware                                           |

**День 6 — RBAC**

- Поле `role` в User.
- `requireRole`, owner checks для задач.

**День 7 — Финализация**

- Обнови `docs/architecture.md` (auth flow).
- `pnpm lint:all && pnpm build`.

**Done when**:

- Полный цикл: register → email verification (если включил) → login → CRUD задач (только свои) → logout.
- Защищённые роуты работают на сервере и клиенте.
- Хорошие loading / error states (в стиле CJ).

**Полезные ресурсы**:

- Официальная Nuxt Integration: https://better-auth.com/docs/integrations/nuxt
- Пример с Prisma: ищи `nuxt-better-auth-drizzle` или аналог.

---

## Неделя 5 — Error Handling + API + Zod

**Цель недели:** единый контракт `{ data, success, error? }`, `apiHandler`, Zod-валидация tasks, адаптация `useApi`, глобальный `nitro.errorHandler`.

| День | Checkpoint                                                |
| ---- | --------------------------------------------------------- |
| 1    | `response.ts` + `apiHandler.ts`; ответы через обёртку     |
| 2    | `CreateTaskSchema` / `UpdateTaskSchema` + `validation.ts` |
| 3    | GET/POST `/api/tasks` на apiHandler + Zod                 |
| 4    | PATCH/DELETE/[id] + owner checks в едином стиле           |
| 5    | `useApi` / `useApiFetch` — data или throw                 |
| 6    | `nitro.errorHandler` — Zod, Prisma, Auth                  |
| 7    | verify + `architecture.md` + commit                       |

### День 1 — Утилиты ответов + базовый apiHandler

**Цель:** фундамент unified API (объединение плана ментора + `response.ts`).

1. **`server/utils/response.ts`:** `successResponse`, `errorResponse`, `sendApiResponse` → `{ data, success, error? }`.
2. **`server/utils/apiHandler.ts`:** обёртка handler (try/catch, маппинг `createError` → error format).
3. **`nuxt.config.ts`** — только если нужно (alias, env; `errorHandler` — заготовка на день 6).

**Done when (день 1):** есть `apiHandler`; тестовый route возвращает unified format.

### День 2 — Zod + схемы валидации

1. **`zod`** в dependencies (если ещё нет).
2. **`shared/validations/task.ts`:** `CreateTaskSchema`, `UpdateTaskSchema`; типы через `z.infer`.
3. **`server/utils/validation.ts`:** `validateBody`, `validateQuery`.

**Done when (день 2):** типизированные схемы; invalid body → 400 с issues.

### День 3 — GET и POST задач

Переписать `server/api/tasks.get.ts`, `server/api/tasks.post.ts` — `apiHandler` + Zod + `requireAuthUser`.

**Done when (день 3):** GET/POST с новым форматом и валидацией.

### День 4 — PATCH, DELETE, GET [id] + owner checks

`server/api/tasks/[id].get.ts`, `[id].patch.ts`, `[id].delete.ts` — тот же стиль; owner/RBAC из нед. 4 без регрессий.

**Done when (день 4):** полный CRUD tasks в едином стиле.

### День 5 — Клиент (useApi)

Обновить `app/composables/useApi.ts` / `useApiFetch`: `success: true` → data; иначе throw.

**Done when (день 5):** composables (`useTasks`) без ручного разбора `{ data }`.

### День 6 — Глобальный error handler

`nitro.errorHandler`, `server/error-handler.ts` — Zod, Prisma (P2002/P2025), Better Auth.

**Done when (день 6):** необработанные ошибки → тот же JSON-формат.

### День 7 — Тестирование, полировка, документация

Полный flow: register → CRUD → invalid body → logout. `pnpm lint:all && pnpm typecheck && pnpm build`. Обновить `docs/architecture.md` (+ опц. `docs/api-conventions.md`). Коммит.

**Done when (неделя):**

- Все tasks routes — unified API + Zod где нужно
- `useApi` на клиенте согласован с сервером
- Global error handler
- verify + build чисто

**Связь с нед. 1–2:** `apiResponse.ok()` на нед. 1–3 — постепенно мигрируем на `response.ts`. `server/middleware/log.ts` + duration — опционально в день 7.

---

## Недели 5–12 (коротко, с акцентом на CJ)

**Неделя 5**: см. [детальный план выше](#неделя-5--error-handling--api--zod).

**Неделя 6**: Projects + relations, пагинация, filters, optimistic updates (очень близко к CJ).

**Неделя 7**: Vitest + file uploads (аватары, как в Travel Log).

**Неделя 8**: Pino logging, health checks, deploy (Vercel/Railway + Prisma), migrations on start.

**Неделя 9**: Admin Dashboard (`@nuxt/ui` + protected `/admin`).

**Неделя 10**: Real-time SSE (live updates задач).

**Неделя 11–12**: Workspaces (multi-tenant), Stripe webhooks, polish, CI/CD, README.

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
