import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

const databaseUrl =
  process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? 'file:./prisma/local.db'

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
})
