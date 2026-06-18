import { hashPassword } from 'better-auth/crypto'
import { prisma } from '../server/utils/prisma'

const SEED_PASSWORD = 'password123'

async function ensureCredentialAccount(userId: string, password: string) {
  const existing = await prisma.account.findFirst({
    where: { userId, providerId: 'credential' },
  })

  if (existing) {
    return existing
  }

  const hashedPassword = await hashPassword(password)

  return prisma.account.create({
    data: {
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
  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role },
    create: {
      id: userId,
      email,
      name,
      emailVerified: true,
      role,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: userId,
          providerId: 'credential',
          password: hashedPassword,
        },
      },
    },
  })

  await ensureCredentialAccount(user.id, password)
  return user
}

async function main() {
  const defaultUser = await createAuthUser('test@example.com', 'Test User', 'USER')
  const adminUser = await createAuthUser('admin@example.com', 'Admin User', 'ADMIN')

  await prisma.task.deleteMany({
    where: {
      userId: { in: [defaultUser.id, adminUser.id] },
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
  })

  console.log('✅ Seed completed')
  console.log(`   test@example.com / ${SEED_PASSWORD} (USER)`)
  console.log(`   admin@example.com / ${SEED_PASSWORD} (ADMIN)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
