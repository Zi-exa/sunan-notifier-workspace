# Setup Update APK Manual + EAS Update

Dokumen ini melengkapi fondasi update in-app yang sudah ada di mobile.

## Jalur Update yang Aktif

App sekarang mendukung dua sumber update:

1. APK manual:
   - dipakai jika Anda membagikan file APK langsung ke user
   - app akan mengecek manifest JSON dari `EXPO_PUBLIC_UPDATE_MANIFEST_URL`
   - jika versinya lebih baru, app menampilkan prompt update dan membuka URL APK

2. EAS Update:
   - dipakai untuk patch JS kecil
   - app akan mengecek update dari channel EAS build aktif setelah boot stabil
   - jika ada, app akan menawarkan reload untuk menerapkan patch

Urutan prioritas:
1. cek APK manual dulu
2. kalau tidak ada, baru cek EAS Update

## Yang Perlu Anda Siapkan

### 1. File manifest APK manual

Template ada di:

- `mobile/update-manifest.example.json`

Contoh isi:

```json
{
  "version": "1.0.1",
  "apkUrl": "https://example.com/downloads/sunan-notifier-1.0.1.apk",
  "title": "Update aplikasi tersedia",
  "notes": "Perbaikan bug login dan optimasi notifikasi.",
  "mandatory": false
}
```

Field wajib:
- `version`
- `apkUrl`

Field opsional:
- `title`
- `notes`
- `mandatory`

App juga menerima bentuk nested Android:

```json
{
  "android": {
    "version": "1.0.1",
    "apkUrl": "https://example.com/downloads/sunan-notifier-1.0.1.apk",
    "mandatory": false
  }
}
```

### 2. Hosting file manifest JSON

Manifest JSON harus bisa diakses publik lewat HTTPS. Opsi yang aman:

1. GitHub Pages / raw file JSON publik
2. Supabase Storage public bucket
3. server web biasa / hosting file statis

### 3. Hosting file APK

URL `apkUrl` juga harus publik lewat HTTPS. Opsi umum:

1. GitHub Releases
2. Supabase Storage public bucket
3. server file statis sendiri

## Konfigurasi `.env`

Isi:

```env
EXPO_PUBLIC_UPDATE_MANIFEST_URL=https://your-domain.com/sunan-notifier/update.json
```

Penting:
- jangan isi dengan URL `https://u.expo.dev/...`
- URL `u.expo.dev` hanya untuk EAS Update, bukan manifest APK manual

## Alur Rilis APK Manual

1. build APK baru
2. upload APK ke hosting publik
3. update file manifest JSON:
   - `version` ke versi baru
   - `apkUrl` ke file APK baru
   - opsional ubah `notes`, `title`, `mandatory`
4. pastikan `.env` app menunjuk ke URL manifest JSON itu

Begitu app dibuka user, checker akan:
- membandingkan versi app sekarang vs `version` di manifest
- jika versi remote lebih tinggi, app menampilkan prompt update

## Alur Rilis EAS Update

Channel build yang sudah disiapkan:
- `development`
- `preview`
- `production`

Contoh publish patch kecil:

```powershell
cd mobile
npx eas update --branch preview --message "Perbaikan UI kecil"
```

Atau untuk produksi:

```powershell
cd mobile
npx eas update --branch production --message "Perbaikan notifikasi"
```

Pastikan channel/branch EAS yang dipakai sesuai dengan build yang dipasang user.

## Yang Masih Harus Anda Isi

Implementasi app sudah siap, tetapi dua data berikut belum bisa saya tebak:

1. URL publik file manifest JSON
2. URL publik file APK hasil build terbaru

Tanpa dua URL itu:
- EAS Update tetap bisa dipakai untuk patch JS
- tapi jalur update APK manual akan diam/nonaktif
