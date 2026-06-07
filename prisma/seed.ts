import { prisma } from '../server/utils/prisma'

async function main() {
  console.log('🌱 Seeding database...')

  const count = await prisma.task.count()

  if (count === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: 'Изучить Nitro и первый backend',
          description: 'Завершить Неделю 1 полностью',
          completed: true,
        },
        {
          title: 'Настроить PostgreSQL + Prisma',
          description: 'День 1-3 Недели 2',
          completed: true,
        },
        {
          title: 'Сделать полноценный CRUD задач',
          description: 'Неделя 2 — главная цель',
          completed: false,
        },
        {
          title: 'Подключить аутентификацию',
          description: 'Неделя 4',
          completed: false,
        },
      ],
    })
    console.log('✅ Добавлено 4 тестовые задачи')
  } else {
    console.log(`ℹ️ В базе уже ${count} задач`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
