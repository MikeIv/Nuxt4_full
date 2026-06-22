export interface NotebookEntry {
  id: string
  title: string
  description?: string | null
  code?: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateNotebookEntryInput {
  title: string
  description?: string
  code?: string
}

export interface UpdateNotebookEntryInput {
  title?: string
  description?: string | null
  code?: string | null
}
