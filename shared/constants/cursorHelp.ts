import type { NotesHelpCard } from './notesHelp'

export type {
  NotesHelpCard as CursorHelpCard,
  NotesHelpSection as CursorHelpSection,
} from './notesHelp'

export const CURSOR_HELP_CARDS: NotesHelpCard[] = [
  {
    id: 'brief-template',
    title: 'Brief — шаблон задачи',
    hint: 'brief-template.md → brief.md, scope, Done when, класс S/M/L/XL',
    accent: 'var(--fs-figma-main-building-main)',
    sections: [
      {
        heading: 'Зачем',
        paragraphs: [
          'Шаблон `.planning/brief-template.md` копируют в рабочий `.planning/brief.md` на одну задачу или сессию. Шаблон не редактируют под задачу.',
          'Brief фиксирует для агента (и для вас): что делаем и зачем, что в scope и что нет, когда задача готова, класс сложности (S/M/L/XL). Это вход в фазу Discuss для задач M+ и handoff между сессиями.',
        ],
      },
      {
        heading: 'Как начать',
        paragraphs: [
          'Вручную — скопировать шаблон. Через Cursor — команда `/brief` или короткий промпт:',
        ],
        codes: [
          'cp .planning/brief-template.md .planning/brief.md',
          'Класс M. Задача: добавить блок тарифов на /contacts\nDone when: блок виден, данные с API, lint проходит',
        ],
      },
      {
        heading: 'Что заполнить',
        table: [
          { field: 'Название', hint: 'Коротко: «Тарифы на contacts»' },
          { field: 'Дата', hint: 'Сегодня' },
          {
            field: 'Класс',
            hint: 'S — typo/одна строка · M — фича 1–3 файла · L — модуль >5 файлов · XL — миграция',
          },
          { field: 'Цель', hint: 'Что изменится для пользователя или системы' },
          { field: 'Scope → Включено', hint: 'Файлы, страницы, API' },
          { field: 'Scope → Исключено', hint: 'Явно «не делаем»' },
          { field: 'Done when', hint: 'Чеклист проверки: [ ] …' },
          { field: 'Ограничения', hint: 'Env, multi-tenant, сайты из shared/sites/' },
          { field: 'Контекст', hint: 'Issue/MR, ссылки на docs' },
        ],
      },
      {
        heading: 'Связь с workflow',
        list: [
          'Новая сессия — агент читает `@.planning/brief.md` (и при необходимости `PROJECT.md`, `state.md`).',
          'Fast-path — если в промпте уже есть цель + scope + done when, агент может сразу писать код.',
          'После волны — итог в `state.md` через `/wave-done`, не весь diff в чат.',
          'Verify — `/verify` смотрит класс из brief и гоняет lint/typecheck/build.',
          'Класс S (опечатка, rename) — brief не обязателен.',
        ],
      },
      {
        heading: 'Важно',
        list: [
          '`brief.md` — рабочий файл на одну задачу; `brief-template.md` — шаблон в репо, его не затирают.',
          'На каждую новую задачу — новый `brief.md` из шаблона (или обновление, если продолжаете ту же).',
        ],
      },
    ],
  },
]
