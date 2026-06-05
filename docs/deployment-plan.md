# План развёртывания Nuxt4_full

Проект создан из шаблона `d:\_WEB\_Work\_NUXT4_Template\`.
Remote: https://github.com/MikeIv/Nuxt4_full.git

**Done when:** проект развёрнут локально, связан с remote, `dev` / `build` / `lint:all` проходят, можно начинать [неделю 1](roadmap-12-weeks.md#неделя-1--nitro-и-первый-backend).

---

## Обзор этапов

| Этап | Содержание                                   | Статус  |
| ---- | -------------------------------------------- | ------- |
| A    | Подготовка: remote, копия шаблона, workspace | готово  |
| B    | Адаптация: rebrand, PROJECT.md, docs         | готово  |
| C    | Git init + push на GitHub                    | готово  |
| D    | `.env`, `pnpm install`, build, lint          | готово  |
| E    | Cursor rules (локально)                      | готово  |
| F    | Definition of Done                           | ожидает |

---

## Этап A — Подготовка

1. **Проверить remote** — репозиторий `MikeIv/Nuxt4_full` на GitHub (пустой или с коммитами).
2. **Скопировать шаблон** в `d:\_WEB\_Work\Nuxt4_full\`.
   - **Не копировать:** `.git/`, `node_modules/`, `.nuxt/`, `.output/`, `.idea/`.
   - **Копировать:** весь остальной код шаблона, включая `.husky/`.
3. **Открыть папку в Cursor:** File → Open Folder → `d:\_WEB\_Work\Nuxt4_full\`.

### Чеклист A

- [x] Каталог `Nuxt4_full` создан
- [x] Файлы шаблона скопированы (без `.git`, `node_modules`)
- [x] `.husky/pre-commit` и полный каталог `.husky/_/` на месте
- [x] Cursor workspace = `Nuxt4_full`

---

## Этап B — Адаптация под задачу

| Файл                       | Действие                            |
| -------------------------- | ----------------------------------- |
| `package.json`             | `"name": "nuxt4-full"`              |
| `README.md`                | Описание fullstack learning sandbox |
| `app/pages/index.vue`      | Приветствие + ссылки на docs        |
| `.planning/PROJECT.md`     | Цель, стек, ссылка на roadmap       |
| `docs/roadmap-12-weeks.md` | 12-недельный план обучения          |
| `docs/deployment-plan.md`  | Этот файл                           |

**Не трогать на старте:** `useApi` / `useApiFetch` / `serverApi` — рабочая основа для client → Nitro.

### Чеклист B

- [x] `docs/deployment-plan.md`
- [x] `docs/roadmap-12-weeks.md`
- [x] `package.json` → `nuxt4-full`
- [x] README и главная страница обновлены
- [x] `.planning/PROJECT.md` обновлён

---

## Этап C — Git и remote

```bash
cd d:/_WEB/_Work/Nuxt4_full
git init
git remote add origin https://github.com/MikeIv/Nuxt4_full.git
git add .
git commit -m "Initial commit: Nuxt 4 fullstack learning base from template"
git branch -M main
git push -u origin main
```

Если remote **не пустой** — сначала `git fetch origin`, согласовать merge/rebase.

### Чеклист C

- [x] `git init`, remote `origin` настроен
- [x] Initial commit запушен на `main`

---

## Этап D — Локальное окружение

```bash
cp .env.example .env
corepack enable
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm lint:all
```

Если Husky не подключился после `git init`:

```bash
pnpm exec husky
git config --get core.hooksPath   # → .husky/_
```

### Чеклист D

- [x] `.env` создан (не в git)
- [x] `pnpm dev` — главная открывается
- [x] `pnpm build` — без ошибок
- [x] `pnpm lint:all` — зелёный

---

## Этап E — Cursor rules

Каталог `.cursor/` **в git** (rules, commands, `mcp.json`). Источник синхронизации: `d:\_WEB\_Work\_Cursor-rules-template\` (`INSTALL-NUXT-VUE.md`):

- `.cursor/rules/*` (workflow + nuxt-template)
- `90-project-context.mdc` — контекст Nuxt4_full
- `.cursor/mcp.json` (nuxt + context7)

### Чеклист E

- [x] Cursor rules установлены
- [x] `90-project-context.mdc` описывает Nuxt4_full

---

## Этап F — Definition of Done

- [ ] Проект из шаблона, rebrand выполнен
- [ ] `origin` → `MikeIv/Nuxt4_full`, push выполнен
- [ ] `pnpm dev` / `build` / `lint:all` — OK
- [ ] Документация в `docs/` на месте
- [ ] В `.planning/PROJECT.md` указана **текущая неделя** (старт: неделя 1)
- [ ] Следующие шаги: Docker + Prisma (неделя 3) — не делать раньше времени

---

## Архитектурные решения (зафиксировать)

1. **Стек:** Nuxt 4 + Nitro + Prisma + PostgreSQL.
2. **API:** собственные `server/api/*`; `NUXT_PUBLIC_API_BASE` пустой → same-origin.
3. **Auth (неделя 5):** `nuxt-auth-utils` или Lucia — одно на весь проект.
4. **ORM:** Prisma.
5. **Валидация (неделя 7):** Zod на границе API.
6. **Клиент:** только `useApi` / `useApiFetch`, не сырой `fetch` в компонентах.

---

## Следующие задачи после развёртывания

| Задача              | Когда                                                              |
| ------------------- | ------------------------------------------------------------------ |
| Docker + PostgreSQL | [Неделя 3](roadmap-12-weeks.md#неделя-3--docker-postgresql-prisma) |
| Prisma + health API | Недели 1–3                                                         |
| Auth + RBAC         | Недели 5–6                                                         |
| Mini-SaaS capstone  | [Неделя 12](roadmap-12-weeks.md#неделя-12--capstone-mini-saas)     |

---

## Риски

| Риск                           | Митигация                              |
| ------------------------------ | -------------------------------------- |
| `.git` шаблона в новом проекте | Копировать без `.git`, свой `git init` |
| Husky не работает              | `pnpm exec husky` после init           |
| Remote не пустой               | `git fetch` до push                    |
| Смешение external API и Nitro  | `apiBase` пустой, API = `server/api`   |
