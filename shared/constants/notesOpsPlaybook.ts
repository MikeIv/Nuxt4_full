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

export interface OpsPlaybook {
  title: string
  lead: string
  cases: OpsPlaybookCase[]
}

export const NOTES_OPS_PLAYBOOK: OpsPlaybook = {
  title: 'Решение проблем на сервере',
  lead: 'Типовые инциденты fabsearch.ru: PostgreSQL, PM2, .env и health-check. Команды копируй в SSH на сервере.',
  cases: [
    {
      id: 'pm2-database-url',
      title: 'PM2 использует старый DATABASE_URL (28P01)',
      summary:
        'PostgreSQL принимает пароль, node с dotenv — OK, но приложение в PM2 падает с password authentication failed.',
      symptoms: [
        'В логах: `28P01` / `password authentication failed for user "nuxtuser"`',
        '`node -e "require(\'dotenv\').config()..."` → DB OK',
        '`pm2 env 0 | grep DATABASE_URL` показывает другой пароль, чем в `.env`',
        '`/api/health` → 500, Prisma `$queryRaw` падает',
      ],
      cause:
        'PM2 кэширует переменные окружения при первом `pm2 start`. `pm2 restart` не перечитывает `.env`. После смены пароля в PostgreSQL или правки `.env` процесс продолжает работать со старым `DATABASE_URL`.',
      steps: [
        {
          title: '1. Сравнить .env и PM2',
          code: `cd /var/www/fabsearch
grep DATABASE_URL .env
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@'))"
pm2 env 0 | grep DATABASE_URL`,
          note: 'Пароли должны совпадать. На сервере БД: `nuxt4_full` (с подчёркиванием).',
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

node -e "require('dotenv').config(); const {Pool}=require('pg'); const p=new Pool({connectionString:process.env.DATABASE_URL}); p.query('select 1').then(()=>{console.log('DB OK'); p.end()}).catch(e=>{console.error('DB FAIL', e.message); p.end(); process.exit(1)})"

pm2 start .output/server/index.mjs \\
  --name fabsearch \\
  --cwd /var/www/fabsearch \\
  --update-env

pm2 save
pm2 env 0 | grep DATABASE_URL`,
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
        'Проверяй `pm2 env 0 | grep DATABASE_URL` после деплоя.',
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
