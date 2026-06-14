export interface DeploymentCheatsheetMeta {
  title: string
  project: string
  domain: string
  domainUrl: string
  server: string
  ip: string
  projectPath: string
  created: string
  author: string
}

export interface DeploymentPathRow {
  label: string
  path: string
}

export interface DeploymentCodeSection {
  id: string
  number: number
  title: string
  type: 'code'
  code: string
}

export interface DeploymentTableSection {
  id: string
  number: number
  title: string
  type: 'table'
  rows: DeploymentPathRow[]
}

export interface DeploymentPracticeGroup {
  title: string
  items: string[]
}

export interface DeploymentPracticesSection {
  id: string
  number: number
  title: string
  type: 'practices'
  groups: DeploymentPracticeGroup[]
}

export interface DeploymentLink {
  label: string
  href: string
}

export interface DeploymentLinksSection {
  id: string
  number: number
  title: string
  type: 'links'
  links: DeploymentLink[]
}

export type DeploymentCheatsheetSection =
  | DeploymentCodeSection
  | DeploymentTableSection
  | DeploymentPracticesSection
  | DeploymentLinksSection

export interface DeploymentCheatsheet {
  meta: DeploymentCheatsheetMeta
  sections: DeploymentCheatsheetSection[]
  footerNote: string
}

/** Однострочный деплой для копирования в терминал на сервере. */
export const DEPLOY_QUICK_COMMAND =
  'git pull origin main && pnpm install --frozen-lockfile && pnpm exec prisma migrate deploy && rm -rf .output && pnpm run build && pm2 restart fabsearch'

export const DEPLOYMENT_CHEATSHEET: DeploymentCheatsheet = {
  meta: {
    title: 'Fabsearch.ru — Шпаргалка по деплою и управлению',
    project: 'Nuxt 4 Fullstack Sandbox',
    domain: 'fabsearch.ru',
    domainUrl: 'https://fabsearch.ru',
    server: 'Reg.ru VPS (Stdp C2-M2-D40)',
    ip: '80.78.247.58',
    projectPath: '/var/www/fabsearch',
    created: '13 июня 2026',
    author: 'Grok (xAI) для Mike',
  },
  sections: [
    {
      id: 'paths',
      number: 1,
      title: 'Основные пути',
      type: 'table',
      rows: [
        { label: 'Проект', path: '/var/www/fabsearch' },
        { label: 'Nginx конфиг', path: '/etc/nginx/sites-available/fabsearch' },
        { label: 'PM2 процессы', path: '~/.pm2' },
        { label: 'Логи PM2', path: '~/.pm2/logs' },
        { label: 'Логи Nginx', path: '/var/log/nginx/' },
      ],
    },
    {
      id: 'pm2',
      number: 2,
      title: 'PM2 — Управление приложением',
      type: 'code',
      code: `# Посмотреть статус всех процессов
pm2 list

# Перезапустить приложение
pm2 restart fabsearch

# Посмотреть логи в реальном времени
pm2 logs fabsearch

# Посмотреть последние логи
pm2 logs fabsearch --lines 100

# Остановить приложение
pm2 stop fabsearch

# Удалить процесс из PM2
pm2 delete fabsearch

# Сохранить текущее состояние (после изменений)
pm2 save`,
    },
    {
      id: 'nginx',
      number: 3,
      title: 'Nginx — Веб-сервер',
      type: 'code',
      code: `# Проверить конфигурацию
sudo nginx -t

# Перезагрузить Nginx (без downtime)
sudo systemctl reload nginx

# Перезапустить Nginx
sudo systemctl restart nginx

# Посмотреть статус
sudo systemctl status nginx

# Посмотреть логи Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log`,
    },
    {
      id: 'ssl',
      number: 4,
      title: "SSL (Let's Encrypt)",
      type: 'code',
      code: `# Принудительно обновить сертификат
sudo certbot renew --force-renewal

# Проверить, когда истекает сертификат
sudo certbot certificates

# Тестовое обновление (без реального обновления)
sudo certbot renew --dry-run`,
    },
    {
      id: 'deploy',
      number: 5,
      title: 'Развёртывание обновлений (Workflow)',
      type: 'code',
      code: `cd /var/www/fabsearch

# 1. Получить последние изменения
git pull origin main

# 2. Установить зависимости (только pnpm, не npm install)
corepack enable
pnpm install --frozen-lockfile

# Если install падает после npm или lockfile сбился:
# rm -rf node_modules package-lock.json && pnpm install --frozen-lockfile

# 3. Применить миграции Prisma (если менялась схема)
pnpm exec prisma migrate deploy

# 4. Пересобрать проект (prisma generate внутри pnpm run build)
rm -rf .output
pnpm run build

# 5. Перезапустить приложение
pm2 restart fabsearch`,
    },
    {
      id: 'server',
      number: 6,
      title: 'Полезные команды сервера',
      type: 'code',
      code: `# Обновить систему
sudo apt update && sudo apt upgrade -y

# Перезагрузить сервер
sudo reboot

# Посмотреть использование ресурсов
htop                    # (если установлен)
free -h
df -h

# Посмотреть открытые порты
sudo ss -tlnp

# Посмотреть логи системы
sudo journalctl -u nginx -f
sudo journalctl -u pm2-root -f`,
    },
    {
      id: 'practices',
      number: 7,
      title: 'Рекомендуемые практики',
      type: 'practices',
      groups: [
        {
          title: 'При обновлении кода',
          items: [
            'git pull origin main (если конфликт — git reset --hard origin/main)',
            'corepack enable && pnpm install --frozen-lockfile',
            'rm -rf node_modules package-lock.json — только если раньше ставили через npm или install падает',
            'pnpm exec prisma migrate deploy (если менялась схема БД)',
            'rm -rf .output node_modules/.prisma перед pnpm run build',
            'Не запускай prisma db pull и не меняй prisma.task → prisma.tasks через sed',
            'pm2 restart fabsearch',
          ],
        },
        {
          title: 'Перед важными изменениями',
          items: ['Делай pm2 save', 'Делай снимок сервера в панели Reg.ru (если возможно)'],
        },
        {
          title: 'Мониторинг',
          items: [
            'Используй pm2 logs fabsearch при проблемах',
            'Проверяй sudo nginx -t после изменений в конфиге Nginx',
          ],
        },
      ],
    },
    {
      id: 'quick-links',
      number: 8,
      title: 'Быстрые ссылки',
      type: 'links',
      links: [
        { label: 'Сайт', href: 'https://fabsearch.ru' },
        { label: 'Репозиторий', href: 'https://github.com/MikeIv/Nuxt4_full' },
        { label: 'PM2 Документация', href: 'https://pm2.keymetrics.io/' },
        { label: 'Nginx Документация', href: 'https://nginx.org/en/docs/' },
      ],
    },
  ],
  footerNote: 'Храни эту шпаргалку в удобном месте. При необходимости обновляй.',
}
