# Brief: Неделя 2 — Prisma + PostgreSQL + Task CRUD (v2)

**Дата:** 2026-06-06
**Статус:** v2 — канон (ментор ✅ 2026-06-06)
**Класс:** L (волнами по дням)

## Цель

Подключить PostgreSQL через Docker, настроить Prisma в Nuxt 4, реализовать CRUD `/api/tasks` с thin handlers и понять безопасную работу с БД из `server/api`.

## Scope

- Включено:
  - `docker-compose.yml`, `DATABASE_URL`, Prisma init + migrate
  - Модель `Task`, **seed 3–5 задач**, `server/utils/prisma.ts`, `server/utils/tasks.ts`
  - CRUD routes по волнам: день 4 GET/POST, день 5 PATCH/DELETE
  - `shared/types/task.ts`, минимальный Zod, `{ data, success }`, `createError`
  - **curl-чеклист** (день 6), обновление `docs/architecture.md` (день 7)
- Исключено:
  - UI `/tasks` (неделя 3)
  - Auth, User, RBAC
  - `apiHandler.ts`, `docs/api-conventions.md` (неделя 4)

## Порядок (важно)

1. types + utils → потом handler (не CRUD «в лоб»)
2. GET/POST → потом PATCH/DELETE
3. curl verify → потом docs

## Done when

- [ ] PostgreSQL запущен через Docker
- [ ] Prisma singleton подключён
- [ ] Seed + migrate
- [ ] **curl-чеклист** CRUD пройден
- [ ] Данные после restart Docker
- [ ] Prisma только в `server/utils/tasks.ts`
- [ ] Обновлён `docs/architecture.md`

## Ограничения

- Темп: ~1–2 ч/день; **checkpoint в конце каждого дня**
- `DATABASE_URL` только server-side
- Клиент: `useApi` / `useApiFetch` — на нед. 3

## Контекст

- Roadmap: [docs/roadmap-12-weeks.md](../docs/roadmap-12-weeks.md#неделя-2--prisma--postgresql--task-crud)
- Синхронизация с ментором: [docs/mentor-week2-sync.md](../docs/mentor-week2-sync.md)
- Неделя 1 завершена (health, middleware, apiResponse.ok)
