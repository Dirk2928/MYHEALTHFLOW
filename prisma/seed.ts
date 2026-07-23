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
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@test.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123'

  const hashedNursePassword = await bcrypt.hash(nursePassword, 10)
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)

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

  await prisma.admin.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      name: 'Admin User',
      password: hashedAdminPassword,
    },
    create: {
      name: 'Admin User',
      email: adminEmail,
      password: hashedAdminPassword,
    },
  })

  console.log(`Seeded nurse account: ${nurseEmail} / ${nursePassword}`)
  console.log(`Seeded admin account: ${adminEmail} / ${adminPassword}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())