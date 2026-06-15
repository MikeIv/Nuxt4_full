---
description: Verify по классу задачи — lint, typecheck, build
argument-hint: [S|M|L|XL или пусто = из brief/контекста]
---

# Verify

**Input:** $ARGUMENTS · Протокол: `04-verify-and-done.mdc` · Команды: `90-project-context.mdc`

| Класс  | Запустить                             |
| ------ | ------------------------------------- |
| **S**  | ReadLints / `pnpm lint:all`           |
| **M**  | lint; при API/auth — `pnpm typecheck` |
| **L+** | `pnpm verify` + `pnpm build`          |

1. Определить класс из input, `brief.md` или контекста
2. Запустить проверки; при fail — исправить или BLOCK
3. M + `server/api/*` или auth — mini-review CRITICAL/HIGH (`04`)
4. Отчёт: **OK** | **FIX REQUIRED** | **BLOCK**
