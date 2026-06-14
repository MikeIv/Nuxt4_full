export const NOTES_DOCUMENTS = [
  {
    id: 'project-docs',
    title: 'Документация',
    description: 'docs/ — deployment, roadmap, оглавление',
  },
  {
    id: 'deployment-cheatsheet',
    title: 'Шпаргалка по деплою и управлению',
    description: 'PM2, Nginx, SSL, workflow обновлений fabsearch.ru',
  },
] as const

export type NotesDocumentId = (typeof NOTES_DOCUMENTS)[number]['id']

export interface NoteLink {
  title: string
  description: string
  href: string
}

export interface UsefulItem {
  title: string
  description: string
}

export const NOTE_LINKS: NoteLink[] = [
  {
    title: 'Nuxt 4 Docs',
    description: 'Официальная документация фреймворка',
    href: 'https://nuxt.com/docs/4.x/getting-started/introduction',
  },
  {
    title: 'Prisma Docs',
    description: 'ORM, схема, миграции',
    href: 'https://www.prisma.io/docs',
  },
  {
    title: 'Better Auth',
    description: 'Аутентификация для fullstack-приложений',
    href: 'https://www.better-auth.com/docs',
  },
]

export const USEFUL_ITEMS: UsefulItem[] = [
  {
    title: 'pnpm dev',
    description: 'Локальный dev-сервер на :3000 (или следующий свободный порт).',
  },
  {
    title: 'pnpm verify',
    description: 'Lint + typecheck перед деплоем.',
  },
  {
    title: 'useApi / useApiFetch',
    description: 'Клиентские запросы к API — только через composables проекта.',
  },
]
