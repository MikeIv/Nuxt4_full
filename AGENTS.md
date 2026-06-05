# Agent workflow — Nuxt 4 Template

Правила Cursor **локальные** — каталог `.cursor/` в `.gitignore`, в git продукта не хранятся.

После клонирования установите правила из **`Cursor-rules-template`** (`INSTALL-NUXT-VUE.md`). При копировании шаблона в новый проект обновите только контекст под продукт (`90-project-context`, `.planning/PROJECT.md`).

## Правила (`.cursor/rules/` — локально)

| Файл                        | Назначение                                                          |
| --------------------------- | ------------------------------------------------------------------- |
| `00-workflow-core`          | S/M/L/XL, фазы GSD + Superpowers, Verify/code-review                |
| `01-discuss-before-code`    | Уточнение до кода                                                   |
| `02-planning-gsd`           | `.planning/`, волны                                                 |
| `03-execution-discipline`   | Минимальный diff, `useApi`                                          |
| `04-verify-and-done`        | Lint, security Nuxt, code-review (local / GitLab MR)                |
| `05-context-hygiene`        | Узкий контекст                                                      |
| `06-fundamental-principles` | Мета-принципы: причина vs симптом, типы, эталоны, минимализм правил |
| `90-project-context`        | Контекст шаблона / продукта, GitLab                                 |
| `nuxt-template`             | Nuxt 4, Vue, SCSS, линты                                            |

## Slash-команды (`.cursor/commands/` — локально)

| Команда        | Назначение                               |
| -------------- | ---------------------------------------- |
| `/code-review` | Review локальных изменений или GitLab MR |

## После копирования в новый репозиторий

1. `package.json` → `name`
2. `.cursor/rules/90-project-context.mdc` (локально)
3. `.planning/PROJECT.md`
4. README, `app/pages/index.vue`
5. Правила из `Cursor-rules-template`, если ещё не установлены

## Задача агенту

```text
Класс M. Задача: …
Done when: …
```

```bash
cp .planning/brief-template.md .planning/brief.md
```

## Внешний шаблон правил

Расширенная инструкция и синхронизация: `d:\_WEB\_Work\_Cursor-rules-template\INSTALL-NUXT-VUE.md`
