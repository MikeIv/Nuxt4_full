# State

**Последнее обновление:** 2026-06-07

**Неделя 2 — v2 канон (ментор 2026-06-06)**

## Выполненные дни

- **День 1 (Docker + PostgreSQL):** ✅ закрыт (коммит + checkpoint: docker compose ps → healthy).
- **День 2 (Prisma init + singleton + private DATABASE_URL):** ✅ закрыт (коммит fa1874e + runtime evidence: `[nitro] boot`, `prisma:query SELECT 1`).
- **День 3 (Модель Task + migrate + обязательный seed):** ✅ закрыт (2026-06-07).
- **День 4 (shared/types/tasks.ts + server/utils/tasks.ts + GET/POST thin handlers):** ✅ закрыт (2026-06-07, Postman screenshot).

## Краткий итог по закрытым дням

**День 1**

- docker-compose.yml (postgres:16-alpine, named volume nuxt4full-postgres-data, healthcheck pg_isready).
- DATABASE_URL в .env.example (приватная, server-only).
- Контейнер запущен и healthy.

**День 2**

- nuxt.config.ts: private `databaseUrl`, nitro.esbuild.target=es2022.
- server/utils/prisma.ts: динамический импорт + Prisma 7 adapter (@prisma/adapter-pg + pg), singleton, URL из runtimeConfig + валидация.
- package.json: db:migrate, db:studio + postinstall с prisma generate.
- prisma/ + prisma.config.ts закоммичены.
- types/nuxt-public.d.ts: databaseUrl только в приватной RuntimeConfig.
- Официальный план (roadmap-12-weeks.md): Шаг 1 и Шаг 2 отмечены [x].

**День 3**

- Модель `Task` в prisma/schema.prisma (полностью соответствует плану).
- Миграция под модель (в составе init-миграции).
- `prisma/seed.ts` с 4 задачами (в пределах 3–5), идемпотентный, использует проектный singleton.
- Скрипты в package.json: `db:seed`, а также `db:reset`, `db:push`, `db:generate` + секция `"prisma": { "seed": "tsx prisma/seed.ts" }`.
- **Checkpoint:** Prisma Studio показывает seed-данные (4 задачи, screenshot от пользователя 2026-06-07).

**День 4**

- `shared/types/tasks.ts` — Task + CreateTaskInput (naming: plural module/tasks как указал ментор).
- `server/utils/tasks.ts` — getAllTasks / createTask (Prisma только здесь) + маппинг дат в string.
- `server/api/tasks.get.ts` и `tasks.post.ts` — тонкие handlers (без Prisma, возврат `{ data: ... }`).
- POST подтверждён рабочим (Postman: создаёт задачу, возвращает корректный `{ data: Task }` с id и timestamps).
- GET возвращает данные из БД.
- Линт и typecheck чистые.
- Официальный план (roadmap-12-weeks.md): Шаг 4 отмечен [x] с Postman доказательством.

## Текущая волна

- **Задача:** День 5: PATCH/DELETE + ошибки (404/400, createError)
- **Статус:** next

## Next

1. День 5 по v2: расширить utils (getTaskById, updateTask, deleteTask), тонкие handlers [id].get / [id].patch / [id].delete, createError(404), минимальная валидация.
2. Продолжать строго по плану v2 (см. brief.md и docs/roadmap-12-weeks.md#неделя-2).

(Полный исторический контекст планировочной волны сохранён ниже.)

## Исторический контекст (планировочная волна + День 1)

## Текущая волна (на момент планирования)

- **Задача:** Планирование + синхронизация плана Недели 2 (v2)
- **Статус:** done

## Сделано (кратко, планирование)

- Изучен оригинальный план ментора на Неделю 2.
- Выявлены проблемы v1 (перегруз дня 4, отсутствие чётких checkpoints, seed опционален, verify размыта).
- Разработан оптимизированный план v2:
  - 7 дней с checkpoint в конце каждого дня.
  - Обязательный seed (3–5 задач) на день 3.
  - Порядок: types + utils → GET/POST (день 4) → PATCH/DELETE (день 5).
  - День 6: обязательный curl-чеклист + проверка persistence после restart Docker.
  - День 7: рефакторинг + обновление docs/architecture.md + lint/build.
- Создан `docs/mentor-week2-sync.md` с полным текстом для ментора.
- Обновлены:
  - `docs/roadmap-12-weeks.md` (полный текст недели 2 v2 + curl-чеклист).
  - `shared/constants/roadmapWeeks.ts` (7 шагов для UI `/roadmap`).
  - `docs/architecture.md` (порядок разработки, структура с seed).
  - `.planning/PROJECT.md`, `.planning/brief.md`, `docs/README.md`.
- Ментор (2026-06-06): «Отличная работа… Я полностью согласен с v2 и буду вести тебя именно по нему.» → v2 принят как **канон**.

## Блокеры

- Нет

## Next (на момент планирования)

1. Начать **новую сессию агента** (чистый контекст для исполнения).
2. Новый агент **обязательно** сначала читает (в этом порядке):
   - `.planning/PROJECT.md` (постоянный контекст проекта)
   - `.planning/state.md` (этот файл — итог предыдущей волны + что делать дальше)
   - `.planning/brief.md` (текущая задача L, scope, ограничения, Done when)
3. Текущая фаза: **исполнение Недели 2 по v2 (канон, подтверждено ментором)**.
4. **Первая волна исполнения (День 1):** Docker + PostgreSQL.
   - Создать `docker-compose.yml` (PostgreSQL 16 + named volume для persistent данных).
   - Добавить секцию `DATABASE_URL` в `.env.example` (приватная, не NUXT*PUBLIC*\*).
   - Скопировать в `.env` (если ещё не сделано) и заполнить.
   - `docker compose up -d`
   - **Checkpoint конца дня:** `docker compose ps` показывает postgres healthy; можно подключиться через psql или pgAdmin и увидеть пустую БД.
5. После успешного checkpoint Дня 1 — обновить этот `state.md` (3–6 строк: что сделано, статус, следующая микро-волна = День 2).
6. Продолжать по плану v2 день за днём (см. brief.md → roadmap-12-weeks.md#неделя-2).

**Примечание для нового агента (обязательно к соблюдению):**

- Следуй правилам из `.cursor/rules/` (особенно 00-workflow-core, 03-execution-discipline, 04-verify-and-done, 05-context-hygiene).
- Работай **узкими волнами** (1 день или 1–2 связанных задачи).
- После каждой волны — коротко обновляй `state.md`, не сваливай весь diff в чат.
- Общайся с пользователем на русском.
- Минимальный diff. Thin handlers (логика в server/utils/).
- `DATABASE_URL` — только server-side (runtimeConfig private).
- Не начинай UI `/tasks` — это неделя 3.
- Не добавляй apiHandler / унифицированные ошибки — это неделя 4.
- В конце каждого дня/волны предлагай пользователю проверить checkpoint перед переходом дальше.
- Используй `pnpm lint:all` и typecheck при необходимости (перед «готово» по правилам).
