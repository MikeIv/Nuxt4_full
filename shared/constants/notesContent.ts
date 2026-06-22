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
    description: 'PM2, PostgreSQL, pnpm db:check — диагностика и инциденты',
  },
  {
    id: 'server-access',
    title: 'Общие настройки',
    description: 'env и др.',
    protected: true,
    devOnly: true,
  },
  {
    id: 'cursor-help',
    title: 'Cursor справка',
    description: 'brief, команды, workflow агента',
  },
  {
    id: 'better-auth',
    title: 'Авторизация Better Auth',
    description: 'модуль, API, роли USER/ADMIN, seed',
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
    title: 'pnpm db:studio',
    description: 'Prisma Studio — GUI для просмотра и редактирования таблиц БД на :5555.',
  },
  {
    title: 'Пароль входа (Better Auth)',
    description:
      'После seed: admin@example.com / password123 (ADMIN). Сброс: pnpm db:seed. Свой пароль: SEED_PASSWORD в prisma/seed.ts → seed. Email: Prisma Studio → users. Только dev — на prod не использовать.',
  },
  {
    title: 'Histeria',
    description: 'cd C:\\_VPN_Histeria\n' + '.\\hysteria.exe client -c' + ' config.yaml',
  },
]
