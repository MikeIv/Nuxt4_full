# Архитектура Nuxt4_full

Соглашения по папкам и слоям. Зафиксировано после ревью ментора + официальная модель Nuxt 4.

---

## Обзор потока данных

```
Client (app/pages)
    │  useApiFetch<HealthResponse>  (SSR + client)
    ▼
Nitro  server/middleware/log.ts     ← каждый запрос
    ▼
       server/api/health.get.ts     ← thin handler
    ▼
       server/utils/health.ts
    │
    ▼  (неделя 3+)
    Prisma  →  PostgreSQL
```

**Middleware** (`server/middleware/`) — на каждый HTTP-запрос (log.ts: method + path).
**Plugins** (`server/plugins/`) — один раз при старте Nitro (boot log, проверка env).
**Utils** — переиспользуемая логика без привязки к HTTP.

### Цепочка по неделям (ментор + roadmap)

| Этап    | Слой                                           |
| ------- | ---------------------------------------------- |
| Нед. 1  | Client → Nitro (`server/api`) → `server/utils` |
| Нед. 3+ | + Prisma → PostgreSQL                          |
| Нед. 5+ | + auth middleware, session                     |

---

## Корень репозитория

| Путь         | Назначение                                                               |
| ------------ | ------------------------------------------------------------------------ |
| `app/`       | `srcDir` — pages, layouts, composables, assets (обрабатываются сборкой)  |
| `server/`    | Nitro: `api/`, `routes/`, `middleware/`, `plugins/`, `utils/`            |
| `shared/`    | **Isomorphic code** — типы и utils для client **и** server (`#shared/*`) |
| `types/`     | Augmentation Nuxt / глобальные `.d.ts` (не бизнес-контракты API)         |
| `public/`    | Статика as-is: favicon, robots.txt, файлы без трансформации              |
| `scripts/`   | Dev-tooling в корне: pre-commit, lint helpers (не в `app/`)              |
| `docs/`      | Планы, roadmap, эта архитектура                                          |
| `.planning/` | Контекст для Cursor Agent                                                |
| `.cursor/`   | Rules, commands, MCP                                                     |

`server/` и `shared/` остаются **в корне** — так задумано в Nuxt 4 при `srcDir: 'app/'`.

---

## Почему `shared/` не убираем

В Nuxt 4 каталог `shared/` — **официальный** слой isomorphic-кода с алиасом `#shared`.

Примеры в проекте:

- `shared/types/api.ts` — форма ответа API для client и server
- `shared/utils/normalizeApiBaseUrl.ts` — одна логика base URL на клиенте (`useApi`) и на сервере (`serverApi`)

**Не дублировать** те же типы в `app/` и `server/` отдельно.
**Не переносить** `shared/` внутрь `app/` — сломается convention Nuxt.

---

## Слои типов

| Каталог         | Когда использовать                                                |
| --------------- | ----------------------------------------------------------------- |
| `types/`        | Module augmentation (`nuxt-public.d.ts`), ambient globals         |
| `shared/types/` | Контракты API client ↔ server (`HealthResponse`, `ApiError`)      |
| `server/types/` | Server-only типы (Prisma helpers, internal DTO) — **с недели 3+** |

Правило: если тип нужен и в `useApiFetch<T>`, и в handler — он в `shared/types/`.

---

## `server/` — что куда класть

```
server/
├── api/           # REST: health.get.ts → GET /api/health (thin handlers)
├── routes/        # Маршруты вне /api (webhooks, well-known)
├── middleware/    # На каждый запрос
├── plugins/       # Старт Nitro (00-boot-log.ts)
└── utils/         # Логика: health.ts, apiResponse.ts, позже prisma, auth
```

### Thin handler (эталон)

Handler только:

1. Читает вход (`getQuery`, `readBody`, method guard)
2. Вызывает `server/utils/*`
3. Возвращает типизированный ответ

Бизнес-логика, форматирование, доступ к env — в utils.

### Позже (по roadmap)

- `server/services/` — orchestration (несколько utils / Prisma)
- `server/types/` — internal server types

---

## Frontend (`app/`)

| Путь           | Назначение                        |
| -------------- | --------------------------------- |
| `pages/`       | File-based routing                |
| `layouts/`     | Обёртки страниц                   |
| `components/`  | Auto-import UI                    |
| `composables/` | `useApi`, `useRoadmapProgress`, … |
| `assets/`      | SCSS, шрифты — через сборку Vite  |

HTTP с UI — **только** `useApi` / `useApiFetch<T>`, не сырой `fetch`.

---

## Статика: `public/` vs `app/assets/`

|           | `public/`       | `app/assets/`       |
| --------- | --------------- | ------------------- |
| Обработка | Нет, URL as-is  | Vite (hash, import) |
| Примеры   | favicon, robots | SCSS, Gilroy/Inter  |

---

## Конфигурация и секреты

- `NUXT_PUBLIC_*` — только то, что безопасно в браузере
- Секреты — private `runtimeConfig` + `.env` (не в git)
- Health/version — без stack trace, без DATABASE_URL и токенов

---

## Чего избегать

- «God handlers» — вся логика в одном `*.get.ts`
- Дублирование типов API вне `shared/types/`
- Сырой `fetch` в компонентах
- Prisma / Docker до [недели 3](roadmap-12-weeks.md#неделя-3--docker-postgresql-prisma)
- Перенос `server/` или `shared/` внутрь `app/` без явной задачи

---

## Связанные документы

- [roadmap-12-weeks.md](roadmap-12-weeks.md) — недельный план
- [.planning/PROJECT.md](../.planning/PROJECT.md) — контекст для агента
