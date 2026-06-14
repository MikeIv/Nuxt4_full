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
  {
    id: 'ops-playbook',
    title: 'Решение проблем',
    description: 'PM2, PostgreSQL, .env — типовые инциденты',
  },
  {
    id: 'server-access',
    title: 'Общие настройки',
    description: 'env и др.',
    protected: true,
    devOnly: true,
  },
] as const

export type NotesDocumentId = (typeof NOTES_DOCUMENTS)[number]['id']

export type NotesDocument = (typeof NOTES_DOCUMENTS)[number]

export function isProtectedNotesDocument(doc: NotesDocument): boolean {
  return 'protected' in doc && doc.protected === true
}

const isProduction = process.env.NODE_ENV === 'production'

/** Скрытые на production подразделы (например, env и пароли). */
export function isNotesDocumentVisible(doc: NotesDocument): boolean {
  if ('devOnly' in doc && doc.devOnly && isProduction) {
    return false
  }

  return true
}

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
