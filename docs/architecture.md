# Архитектура Nuxt4_full

Соглашения по папкам и слоям. Зафиксировано после ревью ментора + официальная модель Nuxt 4.

**Неделя 1 (факт):** health GET/POST, middleware, thin handlers, `useApiFetch` на главной, `runtimeConfig` + типизация.

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
    ▼  (неделя 3+)
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

| Слой           | Неделя 1                                                            |
| -------------- | ------------------------------------------------------------------- |
| **Middleware** | `log.ts` — на **каждый** HTTP-запрос (включая `/api/health`)        |
| **Plugins**    | `server/plugins/` — опционально (`00-boot.ts`, один раз при старте) |
| **Utils**      | Логика без привязки к HTTP; handlers только вызывают utils          |

### Цепочка по неделям

| Этап    | Слой                                                |
| ------- | --------------------------------------------------- |
| Нед. 1  | Client → middleware → `server/api` → `server/utils` |
| Нед. 3+ | + Prisma → PostgreSQL                               |
| Нед. 5+ | + auth middleware, session                          |

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
| `server/types/` | Server-only — **с недели 3+**                                           |

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
│   ├── runtimeConfig.ts   # useServerRuntimeConfig (public + private)
│   └── serverApi.ts       # HTTP-клиент Nitro к external API
├── plugins/               # рекомендуется: 00-boot.ts (ещё не добавлен)
└── routes/                # вне /api — позже
```

**Рекомендуется (нед. 1–2):** `server/utils/apiResponse.ts` — `ok<T>(data)` для единого `{ data }`.

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

| Путь                    | Назначение                                               |
| ----------------------- | -------------------------------------------------------- |
| `pages/index.vue`       | Health Check через `useApiFetch<HealthResponse>`         |
| `pages/roadmap.vue`     | Интерактивный roadmap                                    |
| `composables/useApi.ts` | `useApi`, `useApiFetch` + `runtimeConfig.public.apiBase` |

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
- Prisma / Docker до [недели 3](roadmap-12-weeks.md#неделя-3--docker-postgresql-prisma)
- Перенос `server/` или `shared/` в `app/`

---

## Связанные документы

- [roadmap-12-weeks.md](roadmap-12-weeks.md) — недельный план
- [.planning/PROJECT.md](../.planning/PROJECT.md) — контекст для агента
