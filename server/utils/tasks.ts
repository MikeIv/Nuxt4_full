import { prisma } from './prisma'
import type { Task, CreateTaskInput } from '#shared/types/tasks'

export async function getAllTasks(): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return tasks.map(mapTaskDates)
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const task = await prisma.task.create({ data })
  return mapTaskDates(task)
}

export async function getTaskById(id: string): Promise<Task | null> {
  const task = await prisma.task.findUnique({ where: { id } })
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
