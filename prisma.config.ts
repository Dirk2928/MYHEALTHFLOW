import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'
import { resolveLibSqlUrl } from './lib/libsql-url'

dotenv.config()

const databaseUrl = resolveLibSqlUrl()

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
})
