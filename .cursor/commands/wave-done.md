---
description: Зафиксировать итог волны в state.md (3–5 строк)
argument-hint: [статус done|blocked|in progress]
---

# Wave done

**Input:** $ARGUMENTS · Шаблон: `.planning/state-template.md` · Правила: `02`, `05`, `07`

1. Если `state.md` нет — скопировать из `state-template.md`
2. Обновить: **Статус**, **Сделано** (bullets), **Блокеры**, **Next**
3. **Не** дублировать diff в чат — только краткий итог (≤5 строк)
4. Дата — сегодня
