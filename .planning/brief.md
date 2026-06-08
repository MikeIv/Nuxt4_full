# Brief: Неделя 3 — Fullstack UI: Tasks

**Дата:** 2026-06-07
**Класс:** M (волнами по дням)

## Цель

Создать полноценную интерактивную страницу задач `/tasks`, которая работает с CRUD API из Недели 2. Замкнуть полный fullstack цикл: от базы данных → API → UI с состоянием, загрузкой, ошибками, optimistic updates и проверкой SSR/persistence.

## Scope

- Включено:
  - `app/composables/useTasks.ts` — `fetchTasks`, `createTask`, `updateTask`, `deleteTask`, `toggleComplete`; `useAsyncData`/`useApiFetch` + кэширование (ключ 'tasks')
  - `app/pages/tasks.vue` — список задач (карточки или таблица на `$style`), форма создания (title обязателен), кнопки Toggle/Edit/Delete
  - Состояния: Loading skeleton, Empty state, Error state + кнопка «Повторить»
  - Toast-уведомления (простая реализация)
  - Optimistic updates на toggle completed (UI сразу + rollback при ошибке) + `refresh()` после мутаций
  - Базовая сортировка/фильтр (все / активные / завершённые)
  - Проверка SSR (данные в HTML), гидратация без лишних запросов
  - Полная проверка после `docker compose restart postgres` + рестарт dev
  - Обновление `docs/architecture.md` (секция по UI tasks + поток данных)
- Исключено:
  - Подключение `@nuxt/ui` и его компонентов (`<UCard>`, `useToast` и т.д.) — отложить на неделю 10
  - Auth, User, RBAC (неделя 5+)
  - Полноценная валидация Zod, пагинация, фильтры на сервере (неделя 4/7)
  - Real-time / SSE

## Порядок (важно)

1. Сначала composable `useTasks()` (типы + методы + кэш)
2. Потом страница + базовый CRUD в UI
3. Состояния интерфейса
4. Optimistic + обработка ошибок
5. Полировка (фильтры, SSR, persistence)
   6-7. Рефакторинг, комментарии, docs, итоговый тест всего флоу

## Done when

- [ ] Есть полноценная страница `/tasks` с полным CRUD
- [ ] Используется composable `useTasks()`
- [ ] Работают loading, empty и error состояния + retry
- [ ] Optimistic updates на toggle completed (с rollback при ошибке)
- [ ] Данные сохраняются после перезапуска Docker + Nuxt (docker compose restart + dev)
- [ ] Страница красиво выглядит и удобно используется (семантика, CSS Modules `$style`, a11y)
- [ ] `docs/architecture.md` обновлён
- [ ] Пройдены `pnpm lint:all`, `pnpm build`, typecheck (0 ошибок)

## Ограничения

- Темп: ~1–2 ч в день; checkpoint в конце дня
- Только `useApi` / `useApiFetch` для всех запросов к API (никакого сырого fetch в SFC)
- Минимальный diff, без лишнего рефакторинга
- Чистый, переиспользуемый код; комментарии где неочевидно
- SSR по умолчанию (не отключать)

## Контекст

- Полный план и теория: [docs/roadmap-12-weeks.md](../docs/roadmap-12-weeks.md#неделя-3--fullstack-ui-tasks)
- Неделя 2 завершена (Prisma + CRUD `/api/tasks` + curl-чеклист + persistence + architecture.md)
- Текущий стек: Nuxt 4 + SCSS + CSS Modules; Nuxt UI позже

## Промпты для Cursor (примеры)

- «Создай composable useTasks.ts с методами CRUD + optimistic toggle на базе useApiFetch и useAsyncData»
- «В tasks.vue реализуй optimistic toggle completed с rollback на ошибке + skeleton/empty/error states»
- «Добавь базовый фильтр и сортировку задач (active/completed)»
- «Обнови docs/architecture.md — добавь описание потока данных для /tasks и useTasks»
