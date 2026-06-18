import { BETTER_AUTH_HELP_CARDS } from './betterAuthHelp'
import { CURSOR_HELP_CARDS } from './cursorHelp'
import type { NotesHelpArticleConfig } from './notesHelp'
import type { NotesDocumentId } from './notesContent'

export const NOTES_HELP_ARTICLES: Partial<Record<NotesDocumentId, NotesHelpArticleConfig>> = {
  'cursor-help': {
    title: 'Cursor справка',
    hint: 'Команды, шаблоны и workflow агента — раскройте карточку для подробностей',
    panelId: 'cursor-help-detail',
    cards: CURSOR_HELP_CARDS,
  },
  'better-auth': {
    title: 'Авторизация Better Auth',
    hint: 'Модуль, API, защита маршрутов, роли USER/ADMIN и dev-аккаунты — раскройте карточку',
    panelId: 'better-auth-help-detail',
    cards: BETTER_AUTH_HELP_CARDS,
  },
}
