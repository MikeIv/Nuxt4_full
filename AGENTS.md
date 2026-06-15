# Agent workflow — Nuxt4_full

Правила: `.cursor/rules/` · Продукт: `90-project-context.mdc`, `.planning/PROJECT.md`.

## Карта правил

| Правило         | Режим                                  | Назначение                                          |
| --------------- | -------------------------------------- | --------------------------------------------------- |
| `00`            | **always**                             | GSD: классы, фазы, стоп, краткий Verify             |
| `07`            | **always**                             | Экономия токенов (чат + контекст)                   |
| `90`            | **always**                             | Фаза, команды, эталоны, MCP, ограничения            |
| `nuxt-template` | **globs** `app/`, `server/`, `shared/` | TS, Vue, SCSS, a11y, линты                          |
| `01`–`06`       | **requestable**                        | Discuss, Plan, Execute, Verify, Context, Principles |

## Команды

| Команда        | Назначение                      |
| -------------- | ------------------------------- |
| `/brief`       | `.planning/brief.md` из шаблона |
| `/wave-done`   | Итог волны в `state.md`         |
| `/verify`      | Проверки по классу задачи       |
| `/code-review` | Local diff или GitHub PR        |

MCP: `.cursor/mcp.json` (context7, nuxt_remote).

## Промпт агенту

```
Класс M. Задача: … Done when: …
```

Новая сессия L+: `@.planning/PROJECT.md` `@.planning/brief.md`

Синхронизация workflow: `_Cursor-rules-template`; `90-project-context` — только дополнять.
