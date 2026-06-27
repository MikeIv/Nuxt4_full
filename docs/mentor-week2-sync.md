# Синхронизация: Неделя 2 v2 (2026-06-06)

**Статус:** ✅ **канон** — ментор подтвердил v2 (2026-06-06), ведём только по этому плану.

Документ для ментора — что изменили в программе после ревью и зачем.

---

## Сообщение ментору (можно скопировать)

Привет!

Синхронизировал твой план недели 2 в репозитории и чуть **оптимизировал порядок дней** — scope тот же (Docker → Prisma → Task CRUD), меняется только **последовательность и checkpoints**. Если у тебя тот же план в Notion/доке — предлагаю поправить там же.

### Что оставили без изменений

- Цель недели: PostgreSQL + Prisma + CRUD `/api/tasks`
- Модель **Task** (не User)
- Thin handlers, логика в `server/utils/`
- Zod — знакомство; формат `{ data, success }`
- UI `/tasks` — следующая неделя
- Темп ~1–2 ч/день, ~7–10 ч/нед

### Что изменили (v2)

| Было                                | Стало                                                          | Зачем                                              |
| ----------------------------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| День 4: весь CRUD сразу             | День 4: **types + utils + GET/POST**                           | Сначала слои, потом routes — как на нед. 1         |
| День 5: типизация + utils           | День 5: **PATCH/DELETE + 404/400**                             | Utils уже есть; не переписываем handlers           |
| Seed «по желанию»                   | Seed **3–5 задач — рекомендуется**                             | Быстрее проверять GET без ручных POST              |
| День 6–7: рефактор + UI опционально | День 6: **curl-чеклист обязателен**; день 7: docs + lint/build | Явная verify-привычка; UI не размывает неделю      |
| Checkpoints только в Done when      | **Checkpoint в конце каждого дня**                             | Раньше ловим блокеры (Docker, migrate, первый GET) |

### Новый план по дням

1. Docker + PostgreSQL → checkpoint: `docker compose ps`
2. Prisma init + singleton → checkpoint: `$connect()` OK
3. Schema Task + migrate + **seed** → checkpoint: Prisma Studio
4. `shared/types` + `utils/tasks` + **GET/POST** → checkpoint: JSON из Postgres
5. **PATCH/DELETE** + createError → checkpoint: curl patch/delete/404
6. **curl-чеклист** + persistence после restart → checkpoint: volume живой
7. Рефактор handlers + `architecture.md` + lint/build

### Явное разделение с нед. 5+

На нед. 2 — минимальный Zod + `createError`.
**`apiHandler.ts` и unified API** — [неделя 5](roadmap-12-weeks.md#недели-5-12-коротко-с-акцентом-на-cj). **Auth (Better Auth + RBAC)** — [неделя 4](roadmap-12-weeks.md#неделя-4--better-auth--rbac--protected-routes) (✓).

### curl-чеклист (день 6)

```bash
curl -s http://localhost:3000/api/tasks | jq
curl -s -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"From curl","description":"week 2"}' | jq
curl -s -X PATCH http://localhost:3000/api/tasks/<ID> \
  -H 'Content-Type: application/json' \
  -d '{"completed":true}' | jq
curl -s -X DELETE http://localhost:3000/api/tasks/<ID> -w '\nHTTP %{http_code}\n'
# + docker compose restart → GET list — данные на месте
```

### Done when (уточнённый)

- CRUD пройден **curl-чеклистом**, не только «написал routes»
- Handlers тонкие — **Prisma только в utils**
- Данные после restart Docker

Полный текст в репо: `docs/roadmap-12-weeks.md#неделя-2`, UI `/roadmap`, `.planning/brief.md`.

Если согласен — можно считать **v2 каноном**. Если хочешь вернуть «весь CRUD в один день» для более сильных учеников — ок, но тогда лучше явно пометить как **fast track**, а v2 как **default**.

> **Ответ ментора (2026-06-06):** v2 принят как канон; fast track не требуется.

---

## Diff для таблицы ментора

```
День 1  Docker + PostgreSQL                    1–1.5 ч   ✓ checkpoint
День 2  Prisma init + singleton               1.5 ч     ✓ checkpoint
День 3  Schema Task + migrate + seed          1–2 ч     seed обязателен
День 4  types + utils + GET/POST              1.5–2 ч   ← было «весь CRUD»
День 5  PATCH/DELETE + ошибки                 1–1.5 ч   ← было «типизация»
День 6  curl-чеклист + persistence            1 ч       ← было «рефактор/UI»
День 7  architecture.md + lint/build          1 ч
```

## Ссылки в репозитории ученика

- [roadmap-12-weeks.md](roadmap-12-weeks.md#неделя-2--prisma--postgresql--task-crud)
- [architecture.md](architecture.md) — план структуры server/ нед. 2
- [.planning/brief.md](../.planning/brief.md)
