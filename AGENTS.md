# Agent workflow — Nuxt4_full

Правила Cursor в репозитории: каталог `.cursor/` (rules, commands, `mcp.json`).

Контекст продукта: `.cursor/rules/90-project-context.mdc` и `.planning/PROJECT.md`. Синхронизация с шаблоном: `d:\_WEB\_Work\_Cursor-rules-template\INSTALL-NUXT-VUE.md`.

## Правила (`.cursor/rules/`)

| Файл                        | Назначение                               |
| --------------------------- | ---------------------------------------- |
| `00-workflow-core`          | S/M/L/XL, фазы GSD + Superpowers, Verify |
| `01-discuss-before-code`    | Уточнение до кода                        |
| `02-planning-gsd`           | `.planning/`, волны                      |
| `03-execution-discipline`   | Минимальный diff, `useApi`               |
| `04-verify-and-done`        | Lint, security Nuxt, code-review         |
| `05-context-hygiene`        | Узкий контекст                           |
| `06-fundamental-principles` | Мета-принципы                            |
| `90-project-context`        | Nuxt4_full: стек, roadmap, ограничения   |
| `nuxt-template`             | Nuxt 4, Vue, SCSS, линты                 |

## Slash-команды (`.cursor/commands/`)

| Команда        | Назначение                 |
| -------------- | -------------------------- |
| `/code-review` | Review локальных изменений |

## MCP (`.cursor/mcp.json`)

Nuxt MCP, Context7 — см. файл в репозитории.

## Задача агенту

```text
Класс M. Задача: …
Done when: …
```

```bash
cp .planning/brief-template.md .planning/brief.md
```

## Обновление правил из шаблона

Workflow `00–06` и `nuxt-template.mdc` — diff с `_Cursor-rules-template`. `90-project-context.mdc` — не перезаписывать, только дополнять.
