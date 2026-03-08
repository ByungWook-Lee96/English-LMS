import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const master = await prisma.user.upsert({
    where: { username: 'master' },
    update: {},
    create: {
      username: 'master',
      password: hashedPassword,
      role: 'MASTER',
    },
  })

  console.log('Seed completed: Master user created (master / admin123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
