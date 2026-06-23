import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaMariaDb({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'myhealthflow',
  connectionLimit: 5,
})

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