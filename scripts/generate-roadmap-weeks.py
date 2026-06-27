#!/usr/bin/env python3
"""Single source of truth for roadmap weeks 1-12.

Edit scripts/roadmap-weeks.json (theory, practice, doneWhen, docGoal, keyResults),
then run:

    pnpm roadmap:sync

Updates in sync:
  - shared/constants/roadmapWeeks.ts  (UI /roadmap)
  - docs/roadmap-12-weeks.md          (detailed plan, weeks 1-12)

Bootstrap JSON from current TS (one-time / after manual TS edits):

    pnpm roadmap:export-json
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON_FILE = ROOT / "scripts" / "roadmap-weeks.json"
TARGET_TS = ROOT / "shared" / "constants" / "roadmapWeeks.ts"
TARGET_MD = ROOT / "docs" / "roadmap-12-weeks.md"

TIME_RE = re.compile(r"\((\d+–\d+ мин)\)$")
DAY_PREFIX = re.compile(r"День\s+([\d]+(?:[–-][\d]+)?)")


def ts_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")


def format_theory_steps(steps: list[dict[str, str]]) -> str:
    lines = ["    theory: theorySteps(["]
    for step in steps:
        lines.append("      {")
        lines.append(f"        topic: '{ts_escape(step['topic'])}',")
        lines.append("        description:")
        lines.append(f"          '{ts_escape(step['description'])}',")
        lines.append("      },")
    lines.append("    ]),")
    return "\n".join(lines)


def format_practice_steps(week_id: int, steps: list[dict[str, str]]) -> str:
    lines = [f"    practice: practiceSteps({week_id}, ["]
    for step in steps:
        lines.append("      {")
        lines.append(f"        label: '{ts_escape(step['label'])}',")
        lines.append("        description:")
        lines.append(f"          '{ts_escape(step['description'])}',")
        lines.append("      },")
    lines.append("    ]),")
    return "\n".join(lines)


def format_done_when(week_id: int, labels: list[str]) -> str:
    lines = [f"    doneWhen: doneWhen({week_id}, ["]
    for label in labels:
        lines.append(f"      '{ts_escape(label)}',")
    lines.append("    ]),")
    return "\n".join(lines)


def format_week_ts(week: dict) -> str:
    parts = [
        "  {",
        f"    id: {week['id']},",
        f"    title: '{ts_escape(week['title'])}',",
        f"    theme: '{ts_escape(week['theme'])}',",
        f"    goal: '{ts_escape(week['goal'])}',",
        format_theory_steps(week["theory"]),
        format_practice_steps(week["id"], week["practice"]),
        format_done_when(week["id"], week["doneWhen"]),
        "  },",
    ]
    return "\n".join(parts)


def topic_day_title(topic: str) -> str:
    return TIME_RE.sub("", topic).strip()


def topic_time_label(topic: str) -> str:
    match = TIME_RE.search(topic)
    return match.group(1) if match else "45–60 мин"


def extract_checkpoint(description: str) -> str | None:
    for prefix in ("Checkpoint дня:", "Checkpoint:", "Проверка:"):
        if prefix in description:
            tail = description.split(prefix, 1)[1].strip()
            return tail.split("\n\n")[0].strip().rstrip(".")
    return None


def md_paragraphs(text: str) -> str:
    return "\n\n".join(part.strip() for part in text.split("\n\n") if part.strip())


def practice_checkpoint(label: str) -> str:
    if " — " in label:
        return label.split(" — ", 1)[1]
    return label


def day_key(text: str) -> str | None:
    match = DAY_PREFIX.search(text)
    return match.group(1) if match else None


def parse_day_number(key: str) -> int:
    normalized = key.replace("–", "-")
    if "-" in normalized:
        return int(normalized.split("-")[0])
    return int(normalized)


def has_day_structure(week: dict) -> bool:
    return any(day_key(item["topic"]) for item in week["theory"]) or any(
        day_key(item["label"]) for item in week["practice"]
    )


def build_sections(week: dict) -> list[tuple[dict[str, str] | None, list[dict[str, str]]]]:
    if not has_day_structure(week):
        count = max(len(week["theory"]), len(week["practice"]))
        sections: list[tuple[dict[str, str] | None, list[dict[str, str]]]] = []
        for index in range(count):
            theory = week["theory"][index] if index < len(week["theory"]) else None
            practice = week["practice"][index] if index < len(week["practice"]) else None
            sections.append((theory, [practice] if practice else []))
        return sections

    day_map: dict[str, dict[str, list]] = {}
    order: list[str] = []

    def ensure(key: str) -> None:
        if key not in day_map:
            day_map[key] = {"theory": [], "practice": []}
            order.append(key)

    for item in week["theory"]:
        key = day_key(item["topic"]) or f"extra-theory-{len(order)}"
        ensure(key)
        day_map[key]["theory"].append(item)

    for item in week["practice"]:
        key = day_key(item["label"]) or f"extra-practice-{len(order)}"
        ensure(key)
        day_map[key]["practice"].append(item)

    sections = []
    for key in order:
        theories = day_map[key]["theory"]
        practices = day_map[key]["practice"]
        merged_theory = None
        if theories:
            merged_theory = {
                "topic": theories[0]["topic"],
                "description": "\n\n".join(t["description"] for t in theories),
            }
        sections.append((merged_theory, practices))
    return sections


def render_section_md(
    theory: dict[str, str] | None,
    practices: list[dict[str, str]],
    day_index: int | None,
) -> list[str]:
    lines: list[str] = []
    heading = topic_day_title(theory["topic"]) if theory else practices[0]["label"]
    lines.extend([f"### {heading}", ""])

    if theory:
        if TIME_RE.search(theory["topic"]):
            lines.extend(
                [
                    f"**Теория ({topic_time_label(theory['topic'])}):**",
                    "",
                    md_paragraphs(theory["description"]),
                    "",
                ]
            )
        else:
            lines.extend(["**Теория:**", "", md_paragraphs(theory["description"]), ""])

    if practices:
        lines.extend(["**Практика (пошагово):**", ""])
        combined = "\n\n".join(md_paragraphs(p["description"]) for p in practices)
        lines.extend([combined, ""])

    checkpoint = None
    if theory:
        checkpoint = extract_checkpoint(theory["description"])
    if not checkpoint:
        for practice in practices:
            checkpoint = extract_checkpoint(practice["description"])
            if checkpoint:
                break
    if checkpoint and day_index is not None:
        lines.extend([f"**Done when (день {day_index}):** {checkpoint}.", ""])

    return lines


def format_week_md(week: dict) -> str:
    completed = " ✅" if week.get("completed") else ""
    title = week.get("docTitle") or week["title"]
    lines: list[str] = [
        f"## Неделя {week['id']} — {title}{completed}",
        "",
        f"**Цель недели:** {week['docGoal']}",
        "",
        "**Ключевые результаты недели:**",
        "",
    ]
    for item in week["keyResults"]:
        lines.append(f"- {item}")

    lines.extend(["", "| День | Checkpoint |", "| ---- | ----------------------------------------------- |"])
    for index, step in enumerate(week["practice"], start=1):
        if has_day_structure(week):
            key = day_key(step["label"])
            day_col = key if key else str(index)
        else:
            day_col = str(index)
        lines.append(f"| {day_col}    | {practice_checkpoint(step['label'])} |")
    lines.append("")

    sections = build_sections(week)
    day_counter = 0
    for theory, practices in sections:
        if has_day_structure(week):
            source = theory["topic"] if theory else practices[0]["label"]
            key = day_key(source)
            if key:
                day_counter = parse_day_number(key)
            else:
                day_counter += 1
            lines.extend(render_section_md(theory, practices, day_counter))
        else:
            lines.extend(render_section_md(theory, practices, None))

    lines.extend(["**Done when (неделя):**", ""])
    for item in week["doneWhen"]:
        lines.append(f"- {item}")
    lines.append("")

    celebration = week.get("celebration")
    if celebration:
        lines.extend([celebration, ""])

    lines.extend(
        [
            f"**UI `/roadmap`:** детальный чеклист — "
            f"[неделя {week['id']} на `/roadmap`](/roadmap) (вкладка «Нед {week['id']}»).",
            "",
            "---",
            "",
        ]
    )
    return "\n".join(lines)


def load_weeks() -> list[dict]:
    data = json.loads(JSON_FILE.read_text(encoding="utf-8"))
    return data["weeks"]


def generate_weeks_ts(weeks: list[dict]) -> str:
    return "\n".join(format_week_ts(week) for week in weeks)


def generate_weeks_md(weeks: list[dict]) -> str:
    return "".join(format_week_md(week) for week in weeks)


def splice_into_ts(content: str, generated: str) -> str:
    marker = "export const ROADMAP_WEEKS: RoadmapWeek[] = ["
    start = content.index(marker) + len(marker)
    end = content.rindex("\n]")
    return content[:start] + "\n" + generated + "\n" + content[end:]


def splice_into_md(content: str, generated: str) -> str:
    start_marker = "## Неделя 1 —"
    end_marker = "## Недели 1–6 и 7–12"
    start_idx = content.index(start_marker)
    end_idx = content.index(end_marker)
    return content[:start_idx] + generated + content[end_idx:]


def main() -> None:
    weeks = load_weeks()
    ts_block = generate_weeks_ts(weeks)
    md_block = generate_weeks_md(weeks)

    ts_content = TARGET_TS.read_text(encoding="utf-8")
    TARGET_TS.write_text(splice_into_ts(ts_content, ts_block), encoding="utf-8", newline="\n")

    md_content = TARGET_MD.read_text(encoding="utf-8")
    TARGET_MD.write_text(splice_into_md(md_content, md_block), encoding="utf-8", newline="\n")

    print(f"Synced weeks 1-12 ({len(weeks)} weeks)")
    print(f"  TS: {len(ts_block.splitlines())} lines -> {TARGET_TS.relative_to(ROOT)}")
    print(f"  MD: {len(md_block.splitlines())} lines -> {TARGET_MD.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
