# Katalog AWH Digital Latest

Website katalog undangan digital dengan admin panel.

## Jalankan Mode Node.js

```bash
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

## Catatan Deploy

Mode tulis file JSON dan upload ke folder hanya cocok untuk hosting Node.js dengan filesystem writable/persistent, misalnya VPS atau hosting Node.js yang mendukung persistent disk.

Jika deploy ke Vercel serverless/static, perubahan file tidak persisten. Untuk Vercel, gunakan database/storage seperti Supabase dan Vercel Blob/Cloudinary.
