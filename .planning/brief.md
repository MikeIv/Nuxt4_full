# Brief: Неделя 4 — Lucia Auth + RBAC

**Дата:** 2026-06-09
**Класс:** L (7 дней, ~7–10 ч)

## Цель

Session-based аутентификация (Lucia + Prisma): register/login/logout, защита API и UI, роли USER/ADMIN. Без JWT на этой неделе.

## Scope

- **Включено:** Lucia, User/Session в Prisma, auth API, server + pages middleware, `useAuth`, login/register pages, RBAC, `Task.userId`, `docs/architecture.md`
- **Исключено:** JWT, `apiHandler` (нед. 5), полный Zod для tasks (нед. 6), Nuxt UI, rate limiting (опционально день 7)

## План по дням

| День | Checkpoint                                         |
| ---- | -------------------------------------------------- |
| 1    | Миграция + `server/utils/lucia.ts` + `AUTH_SECRET` |
| 2    | register/login/logout API + Zod (Postman/curl)     |
| 3    | `/api/tasks` → 401 без сессии                      |
| 4    | `/login`, `/register`, `useAuth`, редирект         |
| 5    | pages middleware; user menu; `/tasks` закрыта      |
| 6    | role USER/ADMIN; DELETE — владелец или admin       |
| 7    | sessions, security, architecture.md, lint/build    |

## Done when

- [ ] Lucia + migrate User/Session
- [ ] Auth API + UI работают end-to-end
- [ ] `/api/tasks` и `/tasks` защищены
- [ ] RBAC: user vs admin
- [ ] `pnpm lint:all`, build, typecheck — чисто

## Ограничения

- Thin handlers; логика в `server/utils/`
- Клиент: только `useApi` / `useApiFetch`
- `AUTH_SECRET` — private runtimeConfig, не в git

## Контекст

Roadmap: [docs/roadmap-12-weeks.md](../docs/roadmap-12-weeks.md#неделя-4--lucia-auth--rbac). Бывш. нед. 5–6 (auth + RBAC) объединены в нед. 4.
