---
description: Code review — local diff или GitHub PR
argument-hint: [pr-number | pr-url | пусто = local]
---

# Code Review

**Input:** $ARGUMENTS · Протокол: `04-verify-and-done.mdc`

| Input        | Режим                                                  |
| ------------ | ------------------------------------------------------ |
| Пусто        | **Local** — `git diff --name-only HEAD`, файлы целиком |
| PR номер/URL | **GitHub** — `gh pr diff`, checks                      |

Платформа **GitHub** (`gh pr`), не GitLab.

1. Файлы целиком
2. CRITICAL → LOW (`04`)
3. lint/typecheck/build из `90-project-context`

Отчёт: **OK** | **FIX REQUIRED** | **BLOCK** + pipeline.
