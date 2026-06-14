# Fabsearch.ru — Шпаргалка по деплою и управлению

**Проект:** Nuxt 4 Fullstack Sandbox  
**Домен:** https://fabsearch.ru  
**Сервер:** Reg.ru VPS (Stdp C2-M2-D40)  
**IP:** 80.78.247.58  
**Папка проекта:** `/var/www/fabsearch`

---

## 1. Основные пути

| Что          | Путь                                   |
| ------------ | -------------------------------------- |
| Проект       | `/var/www/fabsearch`                   |
| Nginx конфиг | `/etc/nginx/sites-available/fabsearch` |
| PM2 процессы | `~/.pm2`                               |
| Логи PM2     | `~/.pm2/logs`                          |
| Логи Nginx   | `/var/log/nginx/`                      |

---

## 2. PM2 — Управление приложением

```bash
# Посмотреть статус всех процессов
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
pm2 save
```

---

## 3. Nginx — Веб-сервер

```bash
# Проверить конфигурацию
sudo nginx -t

# Перезагрузить Nginx (без downtime)
sudo systemctl reload nginx

# Перезапустить Nginx
sudo systemctl restart nginx

# Посмотреть статус
sudo systemctl status nginx

# Посмотреть логи Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 4. SSL (Let's Encrypt)

```bash
# Принудительно обновить сертификат
sudo certbot renew --force-renewal

# Проверить, когда истекает сертификат
sudo certbot certificates

# Тестовое обновление (без реального обновления)
sudo certbot renew --dry-run
```

---

## 5. Развёртывание обновлений (Workflow)

```bash
cd /var/www/fabsearch

# 1. Получить последние изменения
git pull origin main

# 2. Установить новые зависимости (если были)
npm install

# 3. Применить миграции Prisma (если были)
npx prisma migrate deploy

# 4. Пересобрать проект
npm run build

# 5. Перезапустить приложение
pm2 restart fabsearch
```

---

## 6. Полезные команды сервера

```bash
# Обновить систему
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
sudo journalctl -u pm2-root -f
```

---

## 7. Рекомендуемые практики

### При обновлении кода:

1. `git pull`
2. `npm install`
3. `npx prisma migrate deploy` (если менялась схема БД)
4. `npm run build`
5. `pm2 restart fabsearch`

### Перед важными изменениями:

- Делай `pm2 save`
- Делай снимок сервера в панели Reg.ru (если возможно)

### Мониторинг:

- Используй `pm2 logs fabsearch` при проблемах
- Проверяй `sudo nginx -t` после изменений в конфиге Nginx

---

## 8. Быстрые ссылки

- **Сайт:** https://fabsearch.ru
- **Репозиторий:** https://github.com/MikeIv/Nuxt4_full
- **PM2 Документация:** https://pm2.keymetrics.io/
- **Nginx Документация:** https://nginx.org/en/docs/

---

**Создано:** 13 июня 2026  
**Автор:** Grok (xAI) для Mike

---

_Храни эту шпаргалку в удобном месте. При необходимости обновляй._
