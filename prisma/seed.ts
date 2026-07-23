import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import { resolveLibSqlConnection } from '../lib/libsql-url'

dotenv.config()

const connection = resolveLibSqlConnection()
const adapter = new PrismaLibSql(connection)

const prisma = new PrismaClient({ adapter })

async function main() {
  const nurseEmail = process.env.SEED_NURSE_EMAIL ?? 'nurse@test.com'
  const nursePassword = process.env.SEED_NURSE_PASSWORD ?? 'password123'

  const hashedNursePassword = await bcrypt.hash(nursePassword, 10)

  await prisma.nurse.upsert({
    where: {
      email: nurseEmail,
    },
    update: {
      name: 'Nurse Raeva',
      password: hashedNursePassword,
    },
    create: {
      name: 'Nurse Raeva',
      email: nurseEmail,
      password: hashedNursePassword,
    },
  })

  console.log(`Seeded nurse account: ${nurseEmail} / ${nursePassword}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())