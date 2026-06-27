import type { AuthUser } from '#nuxt-better-auth'
import type { CreateTaskInput, Task, TaskQueryInput, UpdateTaskInput } from '#shared/types/task'

import { prisma } from './prisma'

export async function getAllTasks(userId: string, query: TaskQueryInput = {}): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(query.completed !== undefined && { completed: query.completed }),
      ...(query.search && {
        title: { contains: query.search, mode: 'insensitive' },
      }),
    },
    orderBy: { createdAt: 'desc' },
  })

  return tasks.map(mapTaskDates)
}

export async function createTask(data: CreateTaskInput, userId: string): Promise<Task> {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      completed: data.completed ?? false,
      userId,
    },
  })

  return mapTaskDates(task)
}

export async function getTaskById(id: string, userId: string): Promise<Task | null> {
  const task = await prisma.task.findUnique({
    where: { id },
  })

  if (!task || task.userId !== userId) {
    return null
  }

  return mapTaskDates(task)
}

function mapTaskDates<T extends { createdAt: Date; updatedAt: Date }>(
  task: T,
): Omit<T, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string } {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}

export async function updateTask(
  id: string,
  data: UpdateTaskInput,
  userId: string,
): Promise<Task | null> {
  try {
    const existing = await prisma.task.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return null
    }

    const updated = await prisma.task.update({
      where: { id },
      data,
    })
    return mapTaskDates(updated)
  } catch (error) {
    console.error('Update task error:', error)
    return null
  }
}

export async function deleteTask(
  id: string,
  actor: Pick<AuthUser, 'id' | 'role'>,
): Promise<boolean> {
  try {
    const existing = await prisma.task.findUnique({ where: { id } })
    if (!existing) {
      return false
    }

    const isOwner = existing.userId === actor.id
    const isAdmin = actor.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return false
    }

    await prisma.task.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}
