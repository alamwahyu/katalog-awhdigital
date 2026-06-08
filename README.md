# Katalog AWH Digital Latest

Website katalog undangan digital dengan admin panel.

## Jalankan Mode Express Node.js

```bash
npm install
npm start
```

Buka:

- Website: `http://localhost:3000`
- Admin: `http://localhost:3000/admin.html`

Dalam mode Node.js:

- Data katalog dibaca dari `catalog.json` melalui `GET /api/catalog`.
- Create, update, dan delete dari admin menulis langsung ke `catalog.json` melalui `PUT /api/catalog`.
- Upload gambar tema disimpan ke folder `thema/` melalui `POST /api/upload-theme`.
- Jika tema dihapus atau gambar tema diganti, file gambar lama di folder `thema/` ikut dihapus selama tidak dipakai tema lain.

## Deploy Vercel

Project ini sudah disiapkan untuk Express serverless di Vercel:

- `app.js` berisi Express app.
- `server.js` menjalankan Express untuk local/VPS.
- `api/index.js` mengekspor Express app untuk Vercel Functions.
- `vercel.json` melakukan rewrite `/api/*` ke serverless function.

## Catatan Storage

Mode tulis file JSON dan upload ke folder hanya cocok untuk hosting Node.js dengan filesystem writable/persistent, misalnya VPS atau hosting Node.js yang mendukung persistent disk.

Jika deploy ke Vercel serverless/static, perubahan file tidak persisten. Karena itu route `PUT /api/catalog` dan `POST /api/upload-theme` akan menolak penyimpanan file saat berjalan di Vercel production. Untuk Vercel, gunakan database/storage seperti Supabase dan Vercel Blob/Cloudinary.
