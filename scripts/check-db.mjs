import { execSync } from 'node:child_process'
import { config } from 'dotenv'
import pg from 'pg'

const PM2_APP_NAME = 'fabsearch'

function maskDatabaseUrl(url) {
  if (!url) {
    return '(не задан)'
  }

  return url.replace(/:([^:@/]+)@/, ':****@')
}

function readPm2DatabaseUrl() {
  try {
    const raw = execSync('pm2 jlist 2>/dev/null', { encoding: 'utf8' })
    const processes = JSON.parse(raw)
    const app = processes.find((item) => item.name === PM2_APP_NAME) ?? processes[0]
    const url = app?.pm2_env?.env?.DATABASE_URL

    return typeof url === 'string' && url.length > 0 ? url : null
  } catch {
    return null
  }
}

async function main() {
  config()

  const databaseUrl = process.env.DATABASE_URL

  console.log('=== Проверка PostgreSQL ===')
  console.log('DATABASE_URL из .env:', maskDatabaseUrl(databaseUrl))

  const pm2DatabaseUrl = readPm2DatabaseUrl()

  if (pm2DatabaseUrl) {
    console.log('DATABASE_URL в PM2:', maskDatabaseUrl(pm2DatabaseUrl))

    if (pm2DatabaseUrl !== databaseUrl) {
      console.warn(
        'WARN: .env и PM2 различаются — pm2 restart fabsearch --update-env или пересоздай процесс',
      )
    }
  }

  if (!databaseUrl) {
    console.error('FAIL: DATABASE_URL не задан в .env')
    process.exitCode = 1
    return
  }

  console.log('\nПодключение...')

  const pool = new pg.Pool({ connectionString: databaseUrl })

  try {
    const { rows } = await pool.query(
      'SELECT 1 AS ok, current_database() AS db, current_user AS "user"',
    )
    const row = rows[0]

    console.log(`OK: user=${row.user}, database=${row.db}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    console.error('FAIL:', message)

    if (message.includes('28P01') || message.includes('authentication failed')) {
      console.error('Подсказка: /notes → Документы → Решение проблем (PM2 + DATABASE_URL)')
    }

    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

await main()
