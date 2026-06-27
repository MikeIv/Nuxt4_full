#!/usr/bin/env python3
"""Export all roadmap weeks from roadmapWeeks.ts to scripts/roadmap-weeks.json."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TS_FILE = ROOT / "shared" / "constants" / "roadmapWeeks.ts"
JSON_FILE = ROOT / "scripts" / "roadmap-weeks.json"

DOC_META: dict[int, dict[str, object]] = {
    1: {
        "docTitle": "Основы Nitro + Prisma + Tasks UI",
        "completed": True,
        "docGoal": (
            "построить крепкий фундамент проекта: серверную часть (Nitro), подключить базу данных "
            "(Prisma) и реализовать базовый CRUD для задач с удобным интерфейсом."
        ),
        "keyResults": [
            "Работающий dev-сервер и health check",
            "Подключённая PostgreSQL база через Prisma",
            "Полноценный CRUD задач (создание, чтение, обновление, удаление)",
            "Client-side composable `useTasks` с optimistic updates",
            "Базовая архитектура проекта (структура папок, utils, types)",
        ],
    },
    2: {
        "docTitle": "Углубление в Nitro + Prisma + Улучшение Tasks",
        "completed": True,
        "docGoal": (
            "углубить понимание серверной части Nuxt (Nitro), улучшить работу с Prisma и сделать "
            "CRUD задач более удобным и надёжным."
        ),
        "keyResults": [
            "PostgreSQL + Prisma singleton + модель Task",
            "CRUD /api/tasks — types → utils → handlers",
            "curl-чеклист + persistence после restart Docker",
            "Thin handlers — Prisma только в server/utils/",
        ],
    },
    3: {
        "docTitle": "Fullstack UI: Tasks",
        "completed": True,
        "docGoal": (
            "довести работу с задачами до хорошего уровня: composables, состояния, optimistic updates, "
            "SSR и полный цикл БД → API → UI."
        ),
        "keyResults": [
            "Composable useTasks() как источник правды",
            "Страница /tasks с loading, empty, error",
            "Optimistic toggle с rollback",
            "Данные сохраняются после перезапуска Docker + Nuxt",
        ],
    },
    4: {
        "docTitle": "Better Auth + RBAC + Protected Routes",
        "completed": True,
        "docGoal": (
            "внедрить современную production-ready систему авторизации с минимальным boilerplate "
            "и настроить защиту роутов на сервере и клиенте."
        ),
        "keyResults": [
            "Better Auth + Prisma adapter + Nuxt module",
            "Register / login / logout (API + UI)",
            "Protected /api/tasks и /tasks",
            "RBAC USER / ADMIN",
        ],
    },
    5: {
        "docTitle": "Error Handling + Unified API + Zod",
        "completed": True,
        "docGoal": (
            "внедрить единообразный слой API с валидацией, обработкой ошибок и понятными ответами "
            "для клиента."
        ),
        "keyResults": [
            "Unified response format (`{ success, data, error? }`)",
            "`apiHandler` — обёртка для всех роутов",
            "Zod-валидация на сервере",
            "Адаптированный client-side (`useApi` / `useApiFetch`)",
        ],
    },
    6: {
        "docTitle": "Advanced CRUD + Projects (Relations, Pagination, Filters, Optimistic Updates)",
        "completed": False,
        "docGoal": (
            "перейти от простых задач к реальной многосущностной системе: связи между таблицами, "
            "пагинация, фильтры и отзывчивый интерфейс с optimistic updates."
        ),
        "keyResults": [
            "Полноценная модель **Project** с связями User → Project → Task",
            "CRUD проектов + задач внутри проекта",
            "Пагинация, фильтры и сортировка на API",
            "Optimistic updates с rollback",
        ],
    },
    7: {
        "docTitle": "Testing + File Uploads",
        "docGoal": (
            "научиться тестировать код и добавить функциональность загрузки файлов "
            "(аватары пользователей, attachments к задачам)."
        ),
        "keyResults": [
            "Базовый слой тестов (Vitest)",
            "Загрузка и хранение файлов",
            "Аватары пользователей",
            "Тесты на ключевые сценарии (auth, CRUD, validation)",
        ],
    },
    8: {
        "docTitle": "Logging, Cache, Deploy",
        "docGoal": (
            "подготовить приложение к реальной продакшен-среде: логирование, кэширование и деплой."
        ),
        "keyResults": [
            "Структурированное логирование (Pino)",
            "Кэширование ответов (Nitro Cache)",
            "Production-ready сборка и деплой (Vercel / Railway / VPS)",
            "Мониторинг и базовые health checks",
        ],
    },
    9: {
        "docTitle": "Admin Dashboard",
        "docGoal": (
            "создать удобную административную панель для управления пользователями, "
            "задачами и проектами."
        ),
        "keyResults": [
            "Админ-панель с таблицами и формами",
            "Расширенный CRUD с Nuxt UI",
            "Role-based доступ (только ADMIN)",
            "Фильтры, пагинация и bulk actions",
        ],
    },
    10: {
        "docTitle": "Real-time (SSE)",
        "docGoal": (
            "добавить живые обновления в приложение, чтобы пользователи видели изменения "
            "задач и проектов в реальном времени без перезагрузки страницы."
        ),
        "keyResults": [
            "Server-Sent Events (SSE) инфраструктура",
            "Real-time обновления задач (create, update, delete)",
            "Broadcasting изменений между пользователями",
            "Клиентская обработка событий",
        ],
    },
    11: {
        "docTitle": "SaaS Core (Workspaces + Billing)",
        "docGoal": (
            "превратить проект в настоящую multi-tenant SaaS-систему с рабочими "
            "пространствами и монетизацией."
        ),
        "keyResults": [
            "Модель Workspace (организация/команда)",
            "Multi-tenant архитектура (данные разделены по workspaces)",
            "Приглашение пользователей в workspace",
            "Базовая интеграция Stripe (тарифы и подписки)",
        ],
    },
    12: {
        "docTitle": "Polish + CI/CD + Docs (Финальный релиз)",
        "docGoal": (
            "довести проект до уровня production-ready продукта, настроить автоматизацию "
            "и подготовить к демонстрации/дальнейшей разработке."
        ),
        "keyResults": [
            "Полная полировка UX/UI",
            "CI/CD пайплайн",
            "Качественная документация",
            "Финальный релиз и ревью всего проекта",
        ],
        "celebration": (
            "**Поздравление:** ты прошёл полный цикл modern fullstack-разработки на Nuxt 4!"
        ),
    },
}


def read_ts_quoted_string(text: str, start: int) -> tuple[str, int]:
    if text[start] != "'":
        raise ValueError(f"Expected quote at {start}")
    index = start + 1
    parts: list[str] = []
    while index < len(text):
        char = text[index]
        if char == "\\":
            index += 1
            if index >= len(text):
                break
            esc = text[index]
            if esc == "n":
                parts.append("\n")
            elif esc == "'":
                parts.append("'")
            elif esc == "\\":
                parts.append("\\")
            else:
                parts.append(esc)
            index += 1
            continue
        if char == "'":
            return "".join(parts), index + 1
        parts.append(char)
        index += 1
    raise ValueError("Unterminated string")


def skip_ws(text: str, index: int) -> int:
    while index < len(text) and text[index] in " \t\n\r":
        index += 1
    return index


def read_field_string(block: str, field: str) -> str:
    match = re.search(rf"{field}:\s*'", block)
    if not match:
        raise ValueError(f"Field {field} not found")
    value, _ = read_ts_quoted_string(block, match.end() - 1)
    return value


def read_steps(block: str, field: str, key: str) -> list[dict[str, str]]:
    if field == "theory":
        func_start = block.index("theorySteps(")
    else:
        func_start = block.index("practiceSteps(")
    open_bracket = block.index("[", func_start)
    depth = 0
    end = open_bracket
    for index in range(open_bracket, len(block)):
        if block[index] == "[":
            depth += 1
        elif block[index] == "]":
            depth -= 1
            if depth == 0:
                end = index
                break
    inner = block[open_bracket + 1 : end]
    steps: list[dict[str, str]] = []
    pattern = rf"{key}:\s*'"
    for match in re.finditer(pattern, inner):
        title, after_title = read_ts_quoted_string(inner, match.end() - 1)
        desc_marker = inner.index("description:", after_title)
        desc_quote = inner.index("'", desc_marker)
        desc, _ = read_ts_quoted_string(inner, desc_quote)
        steps.append({key: title, "description": desc})
    return steps


def read_done_when(block: str) -> list[str]:
    marker = "doneWhen:"
    start = block.index(marker)
    open_bracket = block.index("[", start)
    depth = 0
    end = open_bracket
    for index in range(open_bracket, len(block)):
        if block[index] == "[":
            depth += 1
        elif block[index] == "]":
            depth -= 1
            if depth == 0:
                end = index
                break
    inner = block[open_bracket + 1 : end]
    labels: list[str] = []
    pos = 0
    while pos < len(inner):
        pos = skip_ws(inner, pos)
        if pos >= len(inner) or inner[pos] != "'":
            break
        label, pos = read_ts_quoted_string(inner, pos)
        labels.append(label)
        pos = skip_ws(inner, pos)
        if pos < len(inner) and inner[pos] == ",":
            pos += 1
    return labels


def split_week_blocks(content: str) -> dict[int, str]:
    starts: dict[int, int] = {}
    for match in re.finditer(r"\n  \{\n    id: (\d+),", content):
        starts[int(match.group(1))] = match.start()
    ids = sorted(starts)
    blocks: dict[int, str] = {}
    for index, week_id in enumerate(ids):
        start = starts[week_id]
        end = starts[ids[index + 1]] if index + 1 < len(ids) else content.rindex("\n]")
        blocks[week_id] = content[start:end]
    return blocks


def parse_week(block: str) -> dict:
    week_id = int(re.search(r"id: (\d+)", block).group(1))
    theory = read_steps(block, "theory", "topic")
    practice_raw = read_steps(block, "practice", "label")
    practice = [{"label": p["label"], "description": p["description"]} for p in practice_raw]
    meta = DOC_META[week_id]
    return {
        "id": week_id,
        "title": read_field_string(block, "title"),
        "theme": read_field_string(block, "theme"),
        "goal": read_field_string(block, "goal"),
        "docTitle": meta.get("docTitle", read_field_string(block, "title")),
        "completed": meta.get("completed", False),
        "docGoal": meta["docGoal"],
        "keyResults": meta["keyResults"],
        "celebration": meta.get("celebration"),
        "theory": theory,
        "practice": practice,
        "doneWhen": read_done_when(block),
    }


def main() -> None:
    content = TS_FILE.read_text(encoding="utf-8")
    blocks = split_week_blocks(content)
    weeks = [parse_week(blocks[i]) for i in range(1, 13)]
    JSON_FILE.write_text(json.dumps({"weeks": weeks}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for week in weeks:
        print(
            f"week {week['id']}: theory={len(week['theory'])} "
            f"practice={len(week['practice'])} doneWhen={len(week['doneWhen'])}"
        )
    print(f"Wrote {JSON_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
