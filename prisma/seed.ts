import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaLibSql({ 
  url: process.env.DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.nurse.upsert({
    where: { email: 'nurse@test.com' },
    update: { password: hashedPassword },
    create: {
      name: 'Nurse Raeva',
      email: 'nurse@test.com',
      password: hashedPassword,
    },
  })

  console.log('Nurse account ready: nurse@test.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())