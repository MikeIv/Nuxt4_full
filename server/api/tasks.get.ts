import type { Task } from '#shared/types/task'

// Thin handler — logic lives in server/utils/tasks.ts (Prisma only there).
export default defineEventHandler(async (event): Promise<{ data: Task[] }> => {
  const userId = requireAuthUser(event).id
  const tasks = await getAllTasks(userId)
  return { data: tasks }
})
