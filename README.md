# Nuxt4_full

Fullstack-песочница для прокачки backend: Nuxt 4 + Nitro → Prisma, auth, RBAC, деплой. Итоговый продукт — mini-SaaS «Task Board».

Remote: https://github.com/MikeIv/Nuxt4_full.git

## Документация

| Файл                                                 | Содержание                 |
| ---------------------------------------------------- | -------------------------- |
| [docs/deployment-plan.md](docs/deployment-plan.md)   | Этапы A–F развёртывания    |
| [docs/roadmap-12-weeks.md](docs/roadmap-12-weeks.md) | 12-недельный план обучения |
| [docs/README.md](docs/README.md)                     | Оглавление docs            |
| [.planning/PROJECT.md](.planning/PROJECT.md)         | Контекст для Cursor Agent  |

## Требования

- Node.js LTS
- [pnpm](https://pnpm.io/) 11.x (Corepack)

## Быстрый старт

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Проверка: `pnpm build` и `pnpm lint:all`.

## Скрипты

| Команда             | Назначение                         |
| ------------------- | ---------------------------------- |
| `pnpm dev`          | Dev-сервер (http://localhost:3000) |
| `pnpm build`        | Production-сборка                  |
| `pnpm preview`      | Просмотр production-сборки         |
| `pnpm lint`         | ESLint                             |
| `pnpm lint:all`     | ESLint + Prettier + Stylelint      |
| `pnpm format:check` | Prettier (check)                   |
| `pnpm stylelint`    | Stylelint для Vue/CSS              |

Подробнее о линтерах и структуре — [`AGENTS.md`](AGENTS.md).

## Стек

Nuxt 4.4, Vue 3, TypeScript, Nitro, SCSS, ESLint + Prettier + Stylelint, Husky.

- Клиент: `useApi` / `useApiFetch` — [`app/composables/useApi.ts`](app/composables/useApi.ts)
- Сервер: `serverApi` — [`server/utils/serverApi.ts`](server/utils/serverApi.ts)
- `NUXT_PUBLIC_API_BASE` пустой → same-origin (`server/api/*`)

## Шаблон-источник

`d:\_WEB\_Work\_NUXT4_Template\`

## Cursor Agent

Правила локально из `d:\_WEB\_Work\_Cursor-rules-template\` (`INSTALL-NUXT-VUE.md`). Каталог `.cursor/` в `.gitignore`.

Справка: [`AGENTS.md`](AGENTS.md)
