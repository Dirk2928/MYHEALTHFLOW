import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import * as dotenv from 'dotenv'
import { resolveLibSqlConnection } from './libsql-url'

dotenv.config()

const globalForPrisma = globalThis as { prisma?: PrismaClient }

function createPrismaClient() {
  const connection = resolveLibSqlConnection()
  const adapter = new PrismaLibSql(connection)

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma