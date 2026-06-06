# Nuxt4_full — PROJECT

Постоянный контекст для Cursor Agent.

## Назначение

Fullstack-песочница для прокачки backend: frontend-разработчик на Nuxt 4 осваивает Nitro, Prisma, auth, RBAC, деплой.
Итоговый продукт: mini-SaaS «Task Board».

## Документация

| Файл                                                    | Содержание               |
| ------------------------------------------------------- | ------------------------ |
| [docs/deployment-plan.md](../docs/deployment-plan.md)   | Этапы A–F развёртывания  |
| [docs/roadmap-12-weeks.md](../docs/roadmap-12-weeks.md) | План обучения по неделям |
| [docs/README.md](../docs/README.md)                     | Оглавление docs          |
| [docs/architecture.md](../docs/architecture.md)         | Папки, слои, server/     |

**Текущий этап:** развёртывание **завершено** (этапы A–F).
**Текущая неделя:** [1 — Nitro и первый backend](../docs/roadmap-12-weeks.md#неделя-1--nitro-и-первый-backend).

## Стек

| Слой     | Сейчас                      | План                         |
| -------- | --------------------------- | ---------------------------- |
| Frontend | Nuxt 4.4, Vue 3, SCSS       | + Nuxt UI (нед. 10)          |
| Backend  | Nitro (каркас)              | `server/api/*`               |
| БД       | —                           | PostgreSQL + Prisma (нед. 3) |
| Auth     | —                           | nuxt-auth-utils (нед. 5)     |
| Lint     | ESLint, Prettier, Stylelint | —                            |
| PM       | pnpm 11.x                   | —                            |

## Remote

https://github.com/MikeIv/Nuxt4_full.git

## Структура проекта

Подробно: [docs/architecture.md](../docs/architecture.md).

| Путь                        | Назначение                                                          |
| --------------------------- | ------------------------------------------------------------------- |
| `app/`                      | `srcDir` — UI, composables, SCSS/assets                             |
| `server/api/`               | Thin REST handlers (`*.get.ts` → `/api/*`)                          |
| `server/routes/`            | URL вне `/api` (webhooks позже)                                     |
| `server/middleware/`        | Код на **каждый** запрос                                            |
| `server/plugins/`           | Инициализация при **старте** Nitro                                  |
| `server/utils/`             | Логика вне handlers (health, apiResponse, позже prisma)             |
| `shared/`                   | **Не удалять** — isomorphic типы/utils (`#shared`), client + server |
| `types/`                    | Augmentation Nuxt (`nuxt-public.d.ts`)                              |
| `shared/types/`             | Контракты API (`HealthResponse`, …)                                 |
| `server/types/`             | Server-only типы — с нед. 3+                                        |
| `public/`                   | Только статика as-is (favicon, robots)                              |
| `scripts/`                  | Tooling в корне (pre-commit)                                        |
| `app/composables/useApi.ts` | Единственный HTTP-клиент с UI                                       |

**Thin handler:** `server/api/*` только связывает HTTP и `server/utils/*`.
**Plugins ≠ middleware:** plugins — boot; middleware — per-request.

## Команды

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint:all
```

## API-конвенция

- `NUXT_PUBLIC_API_BASE` **пустой** → запросы на same-origin (`server/api/*`).
- Клиент: только `useApi` / `useApiFetch`.
- Не коммитить `.env`.

## Ограничения для агента

- Минимальный diff, без лишнего рефакторинга
- Не добавлять Prisma/Docker до [недели 3](../docs/roadmap-12-weeks.md#неделя-3--docker-postgresql-prisma)
- Не коммитить без явной просьбы пользователя

## Cursor rules

- В репозитории: `.cursor/rules/`, `.cursor/commands/`, `.cursor/mcp.json`
- Контекст: `.cursor/rules/90-project-context.mdc`
- Синхронизация workflow: `d:\_WEB\_Work\_Cursor-rules-template\` / `INSTALL-NUXT-VUE.md`
