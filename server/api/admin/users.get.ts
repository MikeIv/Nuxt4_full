import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'ADMIN')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return { data: users }
})
