export interface OpsPlaybookStep {
  title: string
  code?: string
  note?: string
}

export interface OpsPlaybookCase {
  id: string
  title: string
  summary: string
  symptoms: string[]
  cause: string
  steps: OpsPlaybookStep[]
  prevention: string[]
}

export interface OpsPlaybookTool {
  id: string
  title: string
  summary: string
  command: string
  scriptPath: string
  does: string[]
  avoid: string[]
  exampleOk: string
  exampleFail: string
}

export interface OpsPlaybook {
  title: string
  lead: string
  tool: OpsPlaybookTool
  cases: OpsPlaybookCase[]
}

export const NOTES_OPS_PLAYBOOK: OpsPlaybook = {
  title: 'Решение проблем на сервере',
  lead: 'Типовые инциденты fabsearch.ru: PostgreSQL, PM2, .env и health-check. Команды копируй в SSH на сервере.',
  tool: {
    id: 'db-check',
    title: 'Проверка PostgreSQL — pnpm db:check',
    summary:
      'Безопасная диагностика подключения к БД: маскирует пароль, сверяет .env с PM2 и выполняет SELECT 1. Не трогает prisma/schema.prisma.',
    command: `cd /var/www/fabsearch
pnpm db:check`,
    scriptPath: 'scripts/check-db.mjs',
    does: [
      'Читает DATABASE_URL из `.env` и показывает строку с замаскированным паролем',
      'Если запущен PM2 — сравнивает DATABASE_URL процесса с `.env` и предупреждает о расхождении',
      'Подключается через `pg` и выполняет `SELECT 1`, выводит `user` и `database`',
      'Работает локально и на сервере (из корня проекта)',
    ],
    avoid: [
      'Не используй `prisma db pull` для «проверки пароля» — перезапишет `prisma/schema.prisma`',
      'Не полагайся на сторонние скрипты с `--force` introspect',
    ],
    exampleOk: `=== Проверка PostgreSQL ===
DATABASE_URL из .env: postgresql://nuxtuser:****@localhost:5432/nuxt4_full?schema=public
DATABASE_URL в PM2: postgresql://nuxtuser:****@localhost:5432/nuxt4_full?schema=public

Подключение...
OK: user=nuxtuser, database=nuxt4_full`,
    exampleFail: `FAIL: password authentication failed for user "nuxtuser"
Подсказка: /notes → Документы → Решение проблем (PM2 + DATABASE_URL)`,
  },
  cases: [
    {
      id: 'pm2-database-url',
      title: 'PM2 использует старый DATABASE_URL (28P01)',
      summary:
        'PostgreSQL принимает пароль, node с dotenv — OK, но приложение в PM2 падает с password authentication failed.',
      symptoms: [
        'В логах: `28P01` / `password authentication failed for user "nuxtuser"`',
        '`pnpm db:check` показывает расхождение .env и PM2 или FAIL с 28P01',
        '`/api/health` → 500, Prisma `$queryRaw` падает',
      ],
      cause:
        'PM2 кэширует переменные окружения при первом `pm2 start`. `pm2 restart` не перечитывает `.env`. После смены пароля в PostgreSQL или правки `.env` процесс продолжает работать со старым `DATABASE_URL`.',
      steps: [
        {
          title: '1. Проверить .env, PM2 и подключение',
          code: `cd /var/www/fabsearch
pnpm db:check`,
          note: 'Подробности — блок «Проверка PostgreSQL» выше. БД на сервере: `nuxt4_full`.',
        },
        {
          title: '2. Синхронизировать пароль PostgreSQL и .env',
          code: `NEW_PASS=$(openssl rand -hex 16)
echo "Сохрани пароль: $NEW_PASS"
sudo -u postgres psql -c "ALTER USER nuxtuser WITH PASSWORD '$NEW_PASS';"
PGPASSWORD="$NEW_PASS" psql -U nuxtuser -h localhost -d nuxt4_full -c "SELECT 1;"

# Одна строка в .env, без переноса:
# DATABASE_URL="postgresql://nuxtuser:ВАШ_ПАРОЛЬ@localhost:5432/nuxt4_full?schema=public"`,
          note: 'Пароль в psql и в DATABASE_URL должны совпадать. Можно скопировать строку из «Общие настройки» в notes.',
        },
        {
          title: '3. Пересоздать PM2 с актуальным env',
          code: `cd /var/www/fabsearch
pm2 delete fabsearch

set -a
source .env
set +a

pnpm db:check

pm2 start .output/server/index.mjs \\
  --name fabsearch \\
  --cwd /var/www/fabsearch \\
  --update-env

pm2 save
pnpm db:check`,
        },
        {
          title: '4. Проверка',
          code: `curl -s http://localhost:3000/api/health
curl -s https://www.fabsearch.ru/api/health`,
          note: 'Используй GET (`curl -s`), не `curl -I` — HEAD для `/api/health` может дать 404.',
        },
        {
          title: '5. После любой правки .env (короткий путь)',
          code: `cd /var/www/fabsearch
set -a && source .env && set +a
pm2 restart fabsearch --update-env`,
        },
      ],
      prevention: [
        'После смены пароля в UI «Общие настройки» — скопируй DATABASE_URL в `.env` на сервере.',
        'Не используй `sed` для `prisma.task` → `prisma.tasks` и не запускай `prisma db pull`.',
        'Проверяй `pnpm db:check` после смены `.env` или деплоя.',
        "Рассмотри `ecosystem.config.cjs` с `require('dotenv').config()` — см. docs/fabsearch_deployment_cheatsheet.md.",
      ],
    },
    {
      id: 'health-head-404',
      title: 'Health через curl -I возвращает 404',
      summary: 'Локально health OK, с домена `curl -I` — 404, хотя сайт жив.',
      symptoms: [
        '`curl -s http://localhost:3000/api/health` → `{"status":"ok",...}`',
        '`curl -I https://fabsearch.ru/api/health` → `404 Page not found`',
      ],
      cause:
        'Команда `curl -I` отправляет HTTP HEAD. Nitro-роут `/api/health` обрабатывает GET; для HEAD может вернуть 404 — это не ошибка Nginx и не БД.',
      steps: [
        {
          title: 'Проверка GET-запросом',
          code: `curl -s https://www.fabsearch.ru/api/health
curl -s https://fabsearch.ru/api/health`,
        },
      ],
      prevention: ['Для мониторинга и ручной проверки используй `curl -s` (GET), не `curl -I`.'],
    },
  ],
}
