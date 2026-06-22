import { prisma } from './prisma'
import type {
  CreateNotebookEntryInput,
  NotebookEntry,
  UpdateNotebookEntryInput,
} from '#shared/types/notebook'

function mapNotebookEntryDates<T extends { createdAt: Date; updatedAt: Date }>(
  entry: T,
): Omit<T, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string } {
  return {
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }
}

export async function getAllNotebookEntries(userId: string): Promise<NotebookEntry[]> {
  const entries = await prisma.notebookEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return entries.map(mapNotebookEntryDates)
}

export async function createNotebookEntry(
  data: CreateNotebookEntryInput,
  userId: string,
): Promise<NotebookEntry> {
  const entry = await prisma.notebookEntry.create({
    data: {
      title: data.title,
      description: data.description,
      code: data.code,
      userId,
    },
  })

  return mapNotebookEntryDates(entry)
}

export async function getNotebookEntryById(
  id: string,
  userId: string,
): Promise<NotebookEntry | null> {
  const entry = await prisma.notebookEntry.findFirst({
    where: { id, userId },
  })

  if (!entry) {
    return null
  }

  return mapNotebookEntryDates(entry)
}

export async function updateNotebookEntry(
  id: string,
  data: UpdateNotebookEntryInput,
  userId: string,
): Promise<NotebookEntry | null> {
  try {
    const existing = await prisma.notebookEntry.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!existing) {
      return null
    }

    const updated = await prisma.notebookEntry.update({
      where: { id },
      data,
    })

    return mapNotebookEntryDates(updated)
  } catch (error) {
    console.error('Update notebook entry error:', error)
    return null
  }
}

export async function deleteNotebookEntry(id: string, userId: string): Promise<boolean> {
  const result = await prisma.notebookEntry.deleteMany({
    where: { id, userId },
  })

  return result.count > 0
}
