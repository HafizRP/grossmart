# Grossmart VPS Deployment Guide (Production & 24/7 Always Running)

Petunjuk pemasangan aplikasi Grossmart di server VPS Linux (Ubuntu 22.04 / 24.04 LTS).

---

## 1. Persiapan Server VPS
Jalankan di terminal VPS sebagai root/sudo:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git curl unzip sqlite3 supervisor \
  php8.2-fpm php8.2-cli php8.2-mbstring php8.2-xml php8.2-bcmath \
  php8.2-sqlite3 php8.2-curl php8.2-intl php8.2-zip

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 2. Clone Repository & Konfigurasi .env
```bash
sudo mkdir -p /var/www/grossmart
sudo chown -R $USER:www-data /var/www/grossmart
git clone <URL_REPO_GITHUB> /var/www/grossmart
cd /var/www/grossmart

cp .env.example .env
nano .env
```
Isi penting di `.env`:
```ini
APP_NAME=Grossmart
APP_ENV=production
APP_DEBUG=false
APP_URL=http://IP_VPS_ATAU_DOMAIN

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/grossmart/database/database.sqlite

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

Generate APP_KEY dan siapkan SQLite:
```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate
touch database/database.sqlite
php artisan migrate --force --seed
npm ci
npm run build
```

---

## 3. Konfigurasi Nginx
Salin konfigurasi dari folder `deploy/nginx/grossmart.conf`:
```bash
sudo cp deploy/nginx/grossmart.conf /etc/nginx/sites-available/grossmart
# Edit nama domain / IP di /etc/nginx/sites-available/grossmart
sudo nano /etc/nginx/sites-available/grossmart

sudo ln -s /etc/nginx/sites-available/grossmart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Konfigurasi Supervisor (Menjaga Background Queue & Cron Selalu Hidup 24/7)
Agar queue worker hidup terus dan otomatis restart jika crash/reboot:
```bash
sudo cp deploy/supervisor/grossmart-queue.conf /etc/supervisor/conf.d/
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start grossmart-queue:*
```

Tambahkan cron scheduler Laravel (`crontab -e`):
```cron
* * * * * cd /var/www/grossmart && php artisan schedule:run >> /dev/null 2>&1
```

---

## 5. Permission & Hak Akses
```bash
sudo chown -R www-data:www-data /var/www/grossmart/storage /var/www/grossmart/bootstrap/cache /var/www/grossmart/database
sudo chmod -R 775 /var/www/grossmart/storage /var/www/grossmart/bootstrap/cache /var/www/grossmart/database
```

---

## 6. Update Selanjutnya (Zero Downtime Script)
Setiap kali ada commit baru di branch `main`, cukup jalankan di VPS:
```bash
cd /var/www/grossmart
./deploy/deploy.sh
```
*(Bisa juga dipanggil otomatis via GitHub Actions SSH Deploy).*
