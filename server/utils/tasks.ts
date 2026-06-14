import { prisma } from './prisma'
import type { CreateTaskInput, Task, UpdateTaskInput } from '#shared/types/task'

export async function getAllTasks(userId?: string): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  return tasks.map(mapTaskDates)
}

const DEFAULT_TASK_USER_EMAIL = 'test@example.com'

export async function createTask(data: CreateTaskInput, userId?: string): Promise<Task> {
  const ownerId = userId ?? (await resolveDefaultTaskUserId())

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      completed: data.completed ?? false,
      userId: ownerId,
    },
  })
  return mapTaskDates(task)
}

/** Временно: до auth на /api/tasks* — задачи привязываем к seed-пользователю. */
export async function resolveDefaultTaskUserId(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_TASK_USER_EMAIL },
    select: { id: true },
  })

  if (!user) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Default task user not found. Run db:seed.',
    })
  }

  return user.id
}

export async function getTaskById(id: string, userId?: string): Promise<Task | null> {
  const task = await prisma.task.findUnique({
    where: { id },
  })

  // Простая проверка владельца (пока optional)
  if (userId && task?.userId !== userId) {
    return null
  }

  return task ? mapTaskDates(task) : null
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
  userId?: string,
): Promise<Task | null> {
  try {
    // Проверка владельца перед обновлением
    if (userId) {
      const existing = await prisma.task.findUnique({ where: { id } })
      if (existing && existing.userId !== userId) {
        return null
      }
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

export async function deleteTask(id: string, userId?: string): Promise<boolean> {
  try {
    if (userId) {
      const existing = await prisma.task.findUnique({ where: { id } })
      if (existing && existing.userId !== userId) {
        return false
      }
    }

    await prisma.task.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}
