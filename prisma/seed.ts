import { prisma } from '../server/utils/prisma'

async function main() {
  // Создаём тестового пользователя
  const defaultUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    },
  })

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  await prisma.task.createMany({
    data: [
      {
        title: 'Купить продукты',
        description: 'Молоко, хлеб, яйца',
        completed: false,
        userId: defaultUser.id,
      },
      {
        title: 'Закончить roadmap',
        description: 'Неделя 4',
        completed: true,
        userId: defaultUser.id,
      },
      {
        title: 'Проверить админку',
        description: '',
        completed: false,
        userId: adminUser.id,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed completed with users and tasks')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
