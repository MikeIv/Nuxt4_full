import 'dotenv/config'

import { hashPassword } from 'better-auth/crypto'
import { prisma } from '../server/utils/prisma'

const SEED_PASSWORD = '1234'

const SEED_USERS = [
  { email: 'test@test.com', name: 'Test User', role: 'USER' as const },
  { email: 'admin@admin.com', name: 'Mike', role: 'ADMIN' as const },
] as const

async function upsertCredentialAccount(userId: string, password: string) {
  const hashedPassword = await hashPassword(password)

  // Better Auth ожидает accountId === userId для credential; удаляем битые строки.
  await prisma.account.deleteMany({
    where: { userId, providerId: 'credential', accountId: { not: userId } },
  })

  return prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: userId,
      },
    },
    update: {
      password: hashedPassword,
    },
    create: {
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: hashedPassword,
    },
  })
}

async function createAuthUser(
  email: string,
  name: string,
  role: 'USER' | 'ADMIN',
  password = SEED_PASSWORD,
) {
  const userId = crypto.randomUUID()

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role, emailVerified: true },
    create: {
      id: userId,
      email,
      name,
      emailVerified: true,
      role,
    },
  })

  await upsertCredentialAccount(user.id, password)
  return user
}

async function main() {
  const seededUsers = await Promise.all(
    SEED_USERS.map((entry) => createAuthUser(entry.email, entry.name, entry.role)),
  )

  await prisma.task.deleteMany({
    where: {
      userId: { in: seededUsers.map((user) => user.id) },
    },
  })

  const [defaultUser, adminUser] = seededUsers

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
  })

  console.log('✅ Seed completed')
  console.log(`   test@example.com / ${SEED_PASSWORD} (USER)`)
  console.log(`   admin@example.com / ${SEED_PASSWORD} (ADMIN)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
