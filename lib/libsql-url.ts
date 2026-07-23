const LIBSQL_URL_PATTERN = /^(libsql:\/\/|file:)/i
const LIBSQL_REMOTE_PATTERN = /^libsql:\/\//i

export type LibSqlConnection = {
  url: string
  authToken?: string
}

function normalizeEnv(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function assertLibSqlScheme(url: string, envName: string): void {
  if (!LIBSQL_URL_PATTERN.test(url)) {
    throw new Error(
      `Invalid ${envName} for libSQL adapter. Use a libsql:// URL for Turso or file: URL for local SQLite.`
    )
  }
}

function withRequiredToken(url: string, authToken: string | undefined, envName: string): LibSqlConnection {
  if (LIBSQL_REMOTE_PATTERN.test(url)) {
    if (!authToken) {
      throw new Error(`${envName} uses libsql:// but TURSO_AUTH_TOKEN is missing.`)
    }
    return { url, authToken }
  }

  return { url }
}

export function resolveLibSqlConnection(): LibSqlConnection {
  const tursoUrl = normalizeEnv(process.env.TURSO_DATABASE_URL)
  const databaseUrl = normalizeEnv(process.env.DATABASE_URL)
  const authToken = normalizeEnv(process.env.TURSO_AUTH_TOKEN)

  if (tursoUrl) {
    if (!LIBSQL_REMOTE_PATTERN.test(tursoUrl)) {
      throw new Error('TURSO_DATABASE_URL must be a libsql:// URL.')
    }
    return withRequiredToken(tursoUrl, authToken, 'TURSO_DATABASE_URL')
  }

  if (databaseUrl) {
    assertLibSqlScheme(databaseUrl, 'DATABASE_URL')
    return withRequiredToken(databaseUrl, authToken, 'DATABASE_URL')
  }

  return { url: 'file:./prisma/local.db' }
}

export function resolveLibSqlUrl(): string {
  return resolveLibSqlConnection().url
}
