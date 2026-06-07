import type { Task } from '#shared/types/tasks'

// Thin handler — logic lives in server/utils/tasks.ts (Prisma only there).
export default defineEventHandler(async (): Promise<{ data: Task[] }> => {
  const tasks = await getAllTasks()
  return { data: tasks }
})
