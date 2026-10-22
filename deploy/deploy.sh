#!/bin/bash
set -e

echo "=== Memulai Deployment Grossmart di VPS ==="

# 1. Masuk mode maintenance
php artisan down || true

# 2. Tarik kode terbaru
git fetch origin main
git reset --hard origin/main

# 3. Dependensi PHP
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# 4. Dependensi Frontend & Kompilasi Aset
npm ci --prefer-offline --no-audit
npm run build

# 5. Database SQLite & Migrasi
if [ ! -f "database/database.sqlite" ]; then
    touch database/database.sqlite
    chmod 664 database/database.sqlite
fi
php artisan migrate --force

# 6. Optimasi Cache Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 7. Restart Queue Worker di Supervisor
if command -v supervisorctl &> /dev/null; then
    supervisorctl restart grossmart-queue:* || true
fi

# 8. Set Permission Direktori
chown -R www-data:www-data storage bootstrap/cache database
chmod -R 775 storage bootstrap/cache database

# 9. Keluar mode maintenance
php artisan up

echo "=== Deployment Selesai! Grossmart Aktif ==="
