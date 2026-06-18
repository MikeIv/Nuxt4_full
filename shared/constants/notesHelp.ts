export interface NotesHelpSection {
  heading: string
  paragraphs?: string[]
  list?: string[]
  code?: string
  codes?: string[]
  table?: { field: string; hint: string }[]
}

export interface NotesHelpCard {
  id: string
  title: string
  hint: string
  accent: string
  sections: NotesHelpSection[]
}

export interface NotesHelpArticleConfig {
  title: string
  hint: string
  panelId: string
  cards: NotesHelpCard[]
}
