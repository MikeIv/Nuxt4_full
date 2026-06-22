# Brief: Блокнот на странице /notes

**Дата:** 2026-06-22
**Класс:** L

## Цель

Добавить на `/notes` вкладку **«Блокнот»** — персональный CRUD заметок с полями название, описание и код (с копированием), по UX близкий к `/tasks`, но без чекбоксов и фильтра по статусу.

## Scope

- Включено:
  - Tab «Блокнот» в `UiTabs` на `app/pages/notes.vue`
  - Prisma-модель + миграция (`title`, `description?`, `code?`, `userId`, timestamps)
  - API `/api/notebook*` (thin handlers → `server/utils/notebook.ts`), эталон как `tasks`
  - Типы `shared/types/notebook.ts`
  - Composables `useNotebook` (по образцу `useTasks`) + `useNotebookFilters` (только сортировка)
  - UI-компонент вкладки (например `app/components/notes/NotesNotebookTab.vue`):
    - Блок **«Новая заметка»**: инпуты «Название заметки», «Описание», textarea **Код**; кнопка добавить
    - Блок **фильтров**: только сортировка (новые / старые)
    - Список карточек: заголовок, описание, при наличии кода — `NotesCodeBlock` с кнопкой «Копировать»
    - Редактирование / удаление по аналогии с задачами (без toggle completed)
  - Auth: заметки привязаны к `userId`; без сессии — заглушка или редирект на `/login` (как `/tasks`)
  - Состояния loading / error / empty
- Исключено:
  - Фильтр «Все / Активные / Завершённые»
  - Чекбокс выполнения
  - Подсветка синтаксиса кода, markdown, теги, поиск
  - Отдельная страница `/notebook`
  - Публичный доступ без авторизации

## Done when

- [ ] На `/notes` четвёртая вкладка «Блокнот» переключает панель `#panel-notebook`
- [ ] Форма создаёт заметку: title (обяз.), description и code (опц.)
- [ ] Список: заголовок как h3, описание, код через `NotesCodeBlock` + «Копировать»
- [ ] Только сортировка по дате (newest / oldest)
- [ ] CRUD через API + Prisma; данные только текущего пользователя
- [ ] `pnpm typecheck` и `pnpm lint:all` проходят
- [ ] Миграция применена (`pnpm db:migrate`)

## Ограничения

- Эталоны: `useTasks`, `server/api/tasks*`, `server/utils/tasks.ts`, `NotesCodeBlock`
- Минимальный diff; не рефакторить существующие вкладки notes без необходимости
- CSS Modules, a11y как на `/tasks`
- Не коммитить `.env`

## Контекст

- Страница notes: `app/pages/notes.vue` — tabs `documents | links | useful`
- Tasks UI: `app/pages/tasks.vue`, `useTaskFilters` — взять layout, убрать filter group
- Копирование кода: `app/components/notes/NotesCodeBlock.vue`, `useCopyToClipboard`
- Неделя 4 (auth): owner-scoped CRUD через `requireAuthUser`

## Волны (план)

1. **Слой данных:** schema → migrate → types → `server/utils/notebook.ts` → API
2. **Клиент:** `useNotebook` + `useNotebookFilters`
3. **UI:** `NotesNotebookTab.vue` + вкладка в `notes.vue`
4. **Verify:** typecheck, lint, ручной CRUD в браузере
