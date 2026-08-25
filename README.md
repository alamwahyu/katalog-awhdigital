# Katalog AWH Digital

Website katalog undangan digital dengan admin panel.

## Storage Production VPS

Mode utama untuk VPS memakai PostgreSQL:

- Data katalog disimpan di tabel `catalog_store`.
- Saat tabel masih kosong, data awal akan di-seed dari `catalog.json`.
- Upload gambar tema disimpan ke filesystem VPS lewat folder `thema/`.
- Saat tema dihapus atau gambar tema diganti, file gambar lama di `thema/` ikut dihapus selama tidak dipakai tema lain.

Fallback masih tersedia:

- Jika `DATABASE_URL` tidak ada tetapi `BLOB_READ_WRITE_TOKEN` ada, app memakai Vercel Blob.
- Jika keduanya tidak ada, app fallback ke `catalog.json` dan folder `thema/` lokal.

## Environment

Copy contoh env:

```bash
cp .env.example .env.local
```

Isi minimal untuk VPS:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgres://awh_catalog:password_database@127.0.0.1:5432/awh_catalog
THEMA_DIR=/var/www/awh-digital/thema
```

`THEMA_DIR` boleh dihapus jika ingin memakai folder `thema/` di dalam project.

## Jalankan Lokal

```bash
npm install
npm start
```

Buka:

- Website: `http://localhost:3001`
- Admin: `http://localhost:3001/admin.html`
- Health: `http://localhost:3001/api/health`

Jika PostgreSQL aktif, `/api/health` akan menampilkan:

```json
{
  "storage": "postgres",
  "database": "connected"
}
```

## Setup VPS Ubuntu 24

Install package dasar:

```bash
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib nginx
sudo npm install -g pm2
```

Pastikan versi Node minimal 20:

```bash
node -v
```

Jika Node bawaan Ubuntu terlalu lama, install Node 20/22 dari NodeSource atau gunakan `nvm`.

## Setup PostgreSQL

Masuk ke PostgreSQL:

```bash
sudo -u postgres psql
```

Buat user dan database:

```sql
CREATE USER awh_catalog WITH PASSWORD 'ganti_password_ini';
CREATE DATABASE awh_catalog OWNER awh_catalog;
\q
```

Schema akan dibuat otomatis oleh aplikasi. Jika ingin manual:

```bash
psql "postgres://awh_catalog:ganti_password_ini@127.0.0.1:5432/awh_catalog" -f database.sql
```

## Deploy App

Contoh lokasi deploy:

```bash
sudo mkdir -p /var/www/awh-digital
sudo chown -R $USER:$USER /var/www/awh-digital
```

Upload atau clone repo ke `/var/www/awh-digital`, lalu:

```bash
cd /var/www/awh-digital
npm install --omit=dev
cp .env.example .env.local
nano .env.local
mkdir -p thema
npm start
```

Jika sudah OK, jalankan dengan PM2:

```bash
pm2 start server.js --name awh-digital
pm2 save
pm2 startup
```

## Nginx Reverse Proxy

Buat config:

```bash
sudo nano /etc/nginx/sites-available/awh-digital
```

Isi:

```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/awh-digital /etc/nginx/sites-enabled/awh-digital
sudo nginx -t
sudo systemctl reload nginx
```

## SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
```

## Cek Setelah Deploy

```bash
curl http://127.0.0.1:3001/api/health
```

Pastikan hasilnya:

- `"storage": "postgres"`
- `"database": "connected"`

Jika admin gagal save, cek log:

```bash
pm2 logs awh-digital
```
