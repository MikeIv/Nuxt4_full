# Архитектура Nuxt4_full

Соглашения по папкам и слоям. Зафиксировано после ревью ментора + официальная модель Nuxt 4.

**Неделя 1 (факт):** health GET/POST, middleware, thin handlers, `useApiFetch` на главной, `runtimeConfig` + типизация.

**Неделя 3 (факт):** страница `/tasks` — `useTasks`, optimistic updates, фильтры, toast, SSR через `useApiFetch`.

**Неделя 4 (факт, день 1):** Better Auth + Prisma adapter, `User` / `Session` / `Verification`, catch-all `/api/auth/*`, миграции OK, `pnpm dev` без ошибок auth.

---

## Обзор потока данных

### GET `/api/health` (главная страница)

```
Client (app/pages/index.vue)
    │  useApiFetch<HealthResponse>('/api/health')  — SSR + client
    ▼
Nitro  server/middleware/log.ts          ← каждый запрос: [nitro] method path
    ▼
       server/api/health.get.ts          ← thin handler
    ▼
       server/utils/health.ts             ← getHealthPayload()
       server/utils/runtimeConfig.ts     ← private config (server-only)
    │
    ▼  (неделя 2+)
    Prisma  →  PostgreSQL
```

### POST `/api/health` (учебный)

```
Client (curl / Postman)
    ▼
server/middleware/log.ts
    ▼
server/api/health.post.ts                ← readBody → buildHealthPostResponse()
    ▼
server/utils/health.ts                   ← readHealthPostBody, getHealthPayload
```

Контракты: `shared/types/health.ts` — `HealthResponse`, `HealthPostBody`, `HealthPostResponse`.

| Слой           | Неделя 1                                                       |
| -------------- | -------------------------------------------------------------- |
| **Middleware** | `log.ts` — на **каждый** HTTP-запрос (включая `/api/health`)   |
| **Plugins**    | `00-boot.ts` — один раз при старте Nitro (dev: `[nitro] boot`) |
| **Utils**      | Логика без привязки к HTTP; handlers только вызывают utils     |

### Цепочка по неделям

| Этап    | Слой                                                |
| ------- | --------------------------------------------------- |
| Нед. 1  | Client → middleware → `server/api` → `server/utils` |
| Нед. 2+ | + Prisma → PostgreSQL                               |
| Нед. 4+ | + Better Auth (`/api/auth/*`), cookie-сессии        |

---

## Корень репозитория

| Путь      | Назначение                                                           |
| --------- | -------------------------------------------------------------------- |
| `app/`    | `srcDir` — pages, layouts, composables, assets                       |
| `server/` | Nitro: `api/`, `routes/`, `middleware/`, `plugins/`, `utils/`        |
| `shared/` | Isomorphic code — типы и utils для client **и** server (`#shared/*`) |
| `types/`  | Augmentation Nuxt (`nuxt-public.d.ts`), не бизнес-контракты API      |
| `public/` | Статика as-is                                                        |
| `docs/`   | Планы, roadmap, этот файл                                            |

`server/` и `shared/` — **в корне**, не внутри `app/` (Nuxt 4 + `srcDir: 'app/'`).

---

## `shared/` — isomorphic-слой

Алиас **`#shared`**. Примеры недели 1:

| Файл                                  | Назначение                                               |
| ------------------------------------- | -------------------------------------------------------- |
| `shared/types/health.ts`              | `HealthResponse`, `HealthPostBody`, `HealthPostResponse` |
| `shared/types/task.ts`                | `Task`, `CreateTaskInput`, `UpdateTaskInput`             |
| `shared/types/api.ts`                 | Общие HTTP-типы (заготовка)                              |
| `shared/utils/normalizeApiBaseUrl.ts` | `apiBase` для `useApi` и `serverApi`                     |
| `shared/constants/roadmapWeeks.ts`    | Данные страницы `/roadmap`                               |

Не дублировать контракты API в `app/` и `server/` отдельно.

---

## Слои типов

| Каталог         | Когда использовать                                                      |
| --------------- | ----------------------------------------------------------------------- |
| `types/`        | `declare module 'nuxt/schema'` — `RuntimeConfig`, `PublicRuntimeConfig` |
| `shared/types/` | Контракты API client ↔ server                                           |
| `server/types/` | Server-only — **с недели 2+**                                           |

Правило: тип нужен в `useApiFetch<T>` и в handler → `shared/types/`.

---

## `server/` — неделя 1

```
server/
├── api/
│   ├── health.get.ts      # GET /api/health
│   └── health.post.ts     # POST /api/health
├── middleware/
│   └── log.ts             # [nitro] method path
├── utils/
│   ├── health.ts          # getHealthPayload, POST helpers
│   ├── apiResponse.ts     # ok<T>(data) — обёртка { data }
│   ├── runtimeConfig.ts   # useServerRuntimeConfig (public + private)
│   └── serverApi.ts       # HTTP-клиент Nitro к external API
├── plugins/
│   └── 00-boot.ts         # [nitro] boot + warnIfExampleSecretMissing (dev)
└── routes/                # вне /api — позже
```

### Thin handler (эталон)

```ts
// server/api/health.get.ts
export default defineEventHandler(async (): Promise<HealthResponse> => {
  return getHealthPayload()
})
```

1. Вход — `getQuery`, `readBody`, method guard
2. Вызов `server/utils/*`
3. Типизированный return из `#shared/types/`

---

## Frontend (`app/`)

| Путь                            | Назначение                                               |
| ------------------------------- | -------------------------------------------------------- |
| `pages/index.vue`               | Health Check через `useApiFetch<HealthResponse>`         |
| `pages/tasks.vue`               | Task Board: CRUD UI, фильтры, состояния loading/error    |
| `pages/roadmap.vue`             | Интерактивный roadmap                                    |
| `composables/useApi.ts`         | `useApi`, `useApiFetch` + `runtimeConfig.public.apiBase` |
| `composables/useTasks.ts`       | Список задач + мутации (optimistic, rollback)            |
| `composables/useTaskFilters.ts` | Клиентский фильтр/сортировка списка задач                |
| `composables/useToast.ts`       | Глобальные toast-уведомления                             |

HTTP с UI — только `useApi` / `useApiFetch<T>`, не сырой `fetch`.

---

## Конфигурация и секреты

| Источник                 | Содержимое                                               |
| ------------------------ | -------------------------------------------------------- |
| `nuxt.config.ts`         | `runtimeConfig.public` + private `exampleSecret`         |
| `types/nuxt-public.d.ts` | Типы `apiBase`, `appVersion`, `appName`, `exampleSecret` |
| `.env.example`           | Шаблон `NUXT_PUBLIC_*` и `NUXT_EXAMPLE_SECRET`           |

- **`NUXT_PUBLIC_*`** → видно в браузере (`useRuntimeConfig().public`)
- **Private** (`exampleSecret`) → только server (`useServerRuntimeConfig` в utils)
- Health-ответы — без секретов, stack trace, `DATABASE_URL`

---

## Чего избегать

- God handlers — логика в `*.get.ts` / `*.post.ts`
- Дублирование типов API вне `shared/types/`
- Сырой `fetch` в SFC
- Prisma / Docker — с [недели 2](roadmap-12-weeks.md#неделя-2--prisma--postgresql--task-crud); не опережать roadmap
- Перенос `server/` или `shared/` в `app/`

---

# Архитектура проекта (Неделя 2)

## Общая схема

Client (Browser)
→ useApiFetch / $fetch
→ Nitro Server (server/api/)
→ Middleware (будет на след. неделях)
→ server/utils/
→ Prisma Client
→ PostgreSQL (Docker)

## Структура папок

- `shared/types/` — контракты API (Task, HealthResponse и т.д.)
- `server/api/` — HTTP handlers (тонкие)
- `server/utils/` — бизнес-логика + Prisma queries
- `prisma/` — схема БД и миграции
- `server/utils/prisma.ts` — singleton клиента

## Текущие API

- GET /api/tasks
- POST /api/tasks
- GET /api/tasks/[id]
- PATCH /api/tasks/[id]
- DELETE /api/tasks/[id]
- GET /api/health

## Best Practices, которые применяем

- Thin Handlers
- Shared types (isomorphic)
- RuntimeConfig для секретов
- Prisma Adapter + Pool

---

## `server/` — неделя 2 (план, историческое)

После подключения Prisma цепочка для `/api/tasks`:

```
Client (curl / Postman / UI)
    ▼
server/middleware/log.ts
    ▼
server/api/tasks.*.ts              ← thin handlers
    ▼
server/utils/tasks.ts              ← Prisma-логика
    ▼
server/utils/prisma.ts             ← singleton Client
    ▼
PostgreSQL (Docker volume)
```

```
docker-compose.yml
prisma/schema.prisma
prisma/seed.ts                     # 3–5 задач (день 3)
shared/types/task.ts               # до handlers (день 4)
server/utils/prisma.ts
server/utils/tasks.ts              # до routes (день 4)
server/api/tasks.get.ts            # день 4: GET/POST
server/api/tasks.post.ts
server/api/tasks/[id].get.ts       # день 5: PATCH/DELETE
server/api/tasks/[id].patch.ts
server/api/tasks/[id].delete.ts
```

Порядок разработки: **types → utils → GET/POST → PATCH/DELETE → curl verify** (см. [mentor-week2-sync.md](mentor-week2-sync.md)).

---

# Архитектура fullstack UI (Неделя 3)

## Поток `/tasks`

```
app/pages/tasks.vue
    │  useTasks()              — единый источник правды (список + мутации)
    │  useTaskFilters(tasks)   — фильтр/сортировка на клиенте
    │  useToast()              — успех/ошибка мутаций
    ▼
app/layouts/default.vue  →  AppNav + UiToastHost
    ▼
useApiFetch<Task[]>('/api/tasks', { key: 'tasks' })   — SSR, payload, гидратация
useApi()  — POST / PATCH / DELETE (императивные мутации)
    ▼
server/middleware/log.ts
    ▼
server/api/tasks.get.ts | tasks.post.ts | tasks/[id].*
    ▼
server/utils/tasks.ts
    ▼
server/utils/prisma.ts  →  PostgreSQL (Docker volume)
```

Контракты: `shared/types/task.ts`. Ошибки API на UI: `shared/utils/formatApiError.ts`.

## `useTasks` — соглашения

| Операция                      | Подход                                                     |
| ----------------------------- | ---------------------------------------------------------- |
| Загрузка списка               | `useApiFetch` + `transform` → `Task[]`, `key: 'tasks'`     |
| create / update / delete      | `useApi()` → `refresh()` после успеха                      |
| toggle / create / delete (UX) | optimistic update кэша `useApiFetch` + rollback при ошибке |
| Защита от дублей              | `isCreating`, `isToggling(id)`, `isDeleting(id)`           |

Состояния UI (`pending`, skeleton, empty, error + retry) — в `tasks.vue`, данные — только из `useTasks()`.

## Файлы недели 3

```
app/composables/useTasks.ts
app/composables/useTaskFilters.ts
app/composables/useToast.ts
app/components/ui/UiToastHost.vue
app/pages/tasks.vue
shared/types/task.ts
shared/utils/formatApiError.ts
```

---

# Архитектура auth (Неделя 4, день 1)

## Поток `/api/auth/*`

```
Client (браузер / curl)
    ▼
server/api/auth/[...all].ts     ← auth.handler(toWebRequest(event))
    ▼
server/utils/auth.ts            ← betterAuth({ prismaAdapter, emailAndPassword })
    ▼
server/utils/prisma.ts  →  PostgreSQL (users, sessions, verifications)
```

Модуль `@onmax/nuxt-better-auth` подключён в `nuxt.config.ts`; client config — `app/auth.config.ts`. Серверный instance — `server/utils/auth.ts`.

## Endpoints (день 1)

| Метод | Путь                      | Назначение                  |
| ----- | ------------------------- | --------------------------- |
| GET   | `/api/auth/get-session`   | Текущая сессия (или `null`) |
| GET   | `/api/auth/ok`            | Healthcheck Better Auth     |
| POST  | `/api/auth/sign-up/email` | Регистрация                 |
| POST  | `/api/auth/sign-in/email` | Вход                        |
| POST  | `/api/auth/sign-out`      | Выход                       |

> `/api/auth/session` не существует — у Better Auth endpoint называется `get-session`.

## Секреты и env

| Переменная            | Где                                | Назначение                                             |
| --------------------- | ---------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`        | `.env`, `prisma.config.ts`         | Prisma + PostgreSQL                                    |
| `SHADOW_DATABASE_URL` | `.env` (опц.)                      | `prisma migrate dev` — тот же user/pass, другое имя БД |
| `AUTH_SECRET`         | `.env`, `runtimeConfig.authSecret` | Подпись сессий Better Auth                             |

Не использовать `NUXT_PUBLIC_*` для auth-секретов.

**День 2+:** guards на `/api/tasks*`, UI login/register, `app/middleware/auth.ts`.

---

## Связанные документы

- [roadmap-12-weeks.md](roadmap-12-weeks.md) — недельный план
- [mentor-week2-sync.md](mentor-week2-sync.md) — v2 недели 2 для ментора
- [.planning/PROJECT.md](../.planning/PROJECT.md) — контекст для агента
