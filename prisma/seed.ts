import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const url =
  process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? 'file:./prisma/local.db'
const authToken = process.env.TURSO_AUTH_TOKEN
const adapter = new PrismaLibSql(
  authToken ? { url, authToken } : { url }
)

const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.nurse.create({
    data: {
      name: 'Nurse Raeva',
      email: 'nurse@test.com',
      password: hashedPassword,
    },
  })

  console.log('Test nurse created!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())