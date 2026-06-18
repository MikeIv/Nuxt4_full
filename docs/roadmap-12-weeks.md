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
- Server routes — `server/api/`; auth — [неделя 4](#неделя-4--better-auth--rbac--protected-routes); Zod + unified API — [неделя 5](#недели-5-12-коротко-с-акцентом-на-cj).
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

## Недели 5–12 (коротко, с акцентом на CJ)

**Неделя 5**: Error handling, `apiHandler`, полная Zod-валидация, unified `{ data, success, error }` responses.

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
  utils/           auth.ts, prisma.ts, tasks.ts, apiHandler.ts
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

**Next step**: Неделя 4 — день 1 (Setup). После дня 1–2 фиксируй выводы в `.planning/state.md`.
