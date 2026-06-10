# Katalog AWH Digital Latest blob

Website katalog undangan digital dengan admin panel.

## Storage

Project ini memakai Vercel Blob sebagai storage production:

- Data katalog disimpan sebagai private Blob di path `data/catalog.json`.
- Gambar tema upload disimpan di Blob prefix `theme-images/`.
- Jika `data/catalog.json` belum ada di Blob, server akan seed otomatis dari file lokal `catalog.json` saat `/api/catalog` pertama kali dibuka.
- Saat tema dihapus atau gambar diganti, gambar lama di Vercel Blob ikut dihapus selama tidak dipakai tema lain.

Saat development tanpa `BLOB_READ_WRITE_TOKEN`, server otomatis fallback ke:

- `catalog.json` untuk data katalog.
- folder `thema/` untuk upload gambar.

## Jalankan Lokal

```bash
npm install
npm start
```

Buka:

- Website: `http://localhost:3001`
- Admin: `http://localhost:3001/admin.html`

Untuk memakai Vercel Blob di lokal, tarik environment dari Vercel:

```bash
vercel env pull .env.local
```

Lalu pastikan `.env.local` berisi `BLOB_READ_WRITE_TOKEN`. File ini akan dibaca otomatis saat menjalankan `npm start`.

Alternatif paling mudah untuk local test memakai environment Vercel adalah menjalankan project dengan `vercel dev`.

## Setup Vercel Blob

1. Buka dashboard Vercel project.
2. Masuk ke tab `Storage`.
3. Buat atau connect `Blob` store ke project ini.
4. Vercel akan membuat environment variable `BLOB_READ_WRITE_TOKEN`.
5. Deploy ulang project.
6. Buka `/api/catalog` atau halaman utama untuk membuat seed awal `data/catalog.json` di Blob.

## Deploy Vercel

Project ini sudah disiapkan untuk Express serverless di Vercel:

- `app.js` berisi Express app dan API storage Blob.
- `server.js` menjalankan Express untuk local/VPS.
- `api/index.js` mengekspor Express app untuk Vercel Functions.
- `vercel.json` melakukan rewrite semua route ke serverless function.

Setelah deploy, admin panel akan melakukan create, update, delete katalog lewat `/api/catalog`, dan upload gambar lewat `/api/upload-theme`.
