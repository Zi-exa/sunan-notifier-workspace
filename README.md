# SUNAN Notifier

SUNAN Notifier adalah aplikasi mobile untuk memantau tugas, deadline, kalender, dan absensi dari SUNAN UMK. Aplikasi mengambil data dari Moodle Web Services, menyimpan snapshot di Supabase, lalu mengirim notifikasi untuk perubahan penting seperti tugas baru, tugas dibuka, deadline H-1/H-hari, dan absensi yang sedang dibuka.

Project ini bukan aplikasi resmi UMK. Repo ini adalah workspace publik yang menggabungkan source mobile sebagai submodule dan konfigurasi backend Supabase.

## Link

- Workspace: [Zi-exa/sunan-notifier-workspace](https://github.com/Zi-exa/sunan-notifier-workspace)
- Source mobile: [Zi-exa/sunan-notifier-mobile](https://github.com/Zi-exa/sunan-notifier-mobile)
- Rilis APK: [Zi-exa/sunan-notifier-releases](https://github.com/Zi-exa/sunan-notifier-releases)
- APK terbaru: [app-release.apk](https://github.com/Zi-exa/sunan-notifier-releases/releases/download/v1.0.1/app-release.apk)

## Fitur

- Login SUNAN memakai NIM dan password.
- Dashboard ringkas untuk tugas, absensi, dan status terbaru.
- Daftar tugas dan quiz dengan status pengumpulan.
- Monitoring absensi dari Upcoming Events SUNAN.
- Kalender akademik dari event Moodle.
- Notifikasi lokal dan push untuk tugas baru, tugas dibuka, deadline, dan absensi.
- Pengaturan notifikasi, jam hening, tema, dan mata kuliah yang dipantau.
- Dukungan EAS Update untuk patch JavaScript dan rilis APK manual lewat GitHub Release.

## Struktur Repo

```text
.
+-- mobile/                 # Expo React Native app, dikelola sebagai git submodule
+-- supabase/
|   +-- migrations/         # Schema, grant, RLS, dan cron setup
|   +-- functions/          # Edge Functions backend
+-- Redesign/               # Referensi desain
+-- README.md
```

Edge Functions utama:

- `poll-sunan-data`: mengambil data SUNAN, membandingkan snapshot, dan membuat antrean notifikasi.
- `send-push`: mengirim push notification dari queue.
- `daily-reminder`: membuat reminder deadline harian.
- `mobile-data`: endpoint aman untuk sinkronisasi data mobile ke Supabase.

## Clone

Folder `mobile` adalah submodule. Clone workspace dengan:

```bash
git clone --recurse-submodules https://github.com/Zi-exa/sunan-notifier-workspace.git
cd sunan-notifier-workspace
```

Jika sudah clone tanpa submodule:

```bash
git submodule update --init --recursive
```

## Setup Mobile

```bash
cd mobile
npm install
cp .env.example .env
npm run start
```

Isi `.env` sesuai kebutuhan:

```env
EXPO_PUBLIC_MOODLE_BASE_URL=https://sunan.umk.ac.id
EXPO_PUBLIC_MOODLE_SERVICE=moodle_mobile_app
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_EXPO_PROJECT_ID=
EXPO_PUBLIC_UPDATE_MANIFEST_URL=
EXPO_PUBLIC_USE_MOCK_DATA=true
```

Untuk koneksi Expo Go yang sulit di jaringan lokal, gunakan tunnel:

```bash
npm run start:tunnel
```

Verifikasi source mobile:

```bash
npm run typecheck
npm run lint
```

## Setup Supabase

1. Link project Supabase:

```bash
npx supabase link --project-ref <project-ref>
```

2. Apply migration:

```bash
npx supabase db push
```

3. Deploy Edge Functions:

```bash
npx supabase functions deploy poll-sunan-data --use-api
npx supabase functions deploy send-push --use-api
npx supabase functions deploy daily-reminder --use-api
npx supabase functions deploy mobile-data --use-api
```

4. Set secret backend:

```bash
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
npx supabase secrets set MOODLE_BASE_URL=https://sunan.umk.ac.id
npx supabase secrets set FUNCTION_AUTH_KEY=<random-secret>
npx supabase secrets set FCM_SERVICE_ACCOUNT_JSON='<firebase-service-account-json>'
```

Catatan Data API: migration terbaru memberi grant eksplisit ke `service_role`, mencabut akses tabel publik dari `anon`/`authenticated`, dan mengatur default privileges untuk tabel/sekuens baru. Jika menambah tabel baru di schema `public`, pastikan grant dan RLS tetap eksplisit.

## Build Android

Build APK produksi untuk distribusi manual:

```bash
cd mobile
npx eas login
npx eas build --platform android --profile production-apk
```

Build AAB untuk Play Store:

```bash
cd mobile
npx eas login
npm run build:aab
```

Build lokal Android di Windows juga tersedia:

```bash
cd mobile
npm run build:local:apk
```

## Rilis APK

APK publik disimpan di repo rilis, bukan di repo source mobile:

```text
https://github.com/Zi-exa/sunan-notifier-releases
```

Untuk rilis baru, upload APK ke GitHub Release di repo tersebut dan perbarui asset `app-release.apk` agar link update lama tetap mengarah ke APK terbaru.

## Keamanan

- Jangan commit file `.env`, private key, service role key, atau Firebase service account JSON mentah.
- `EXPO_PUBLIC_*` akan ikut masuk ke bundle aplikasi, jadi jangan isi dengan secret.
- `google-services.json` hanya konfigurasi client Firebase Android, bukan service account secret.
- Akses tabel Supabase dari aplikasi mobile sebaiknya tetap lewat Edge Function, bukan query langsung ke tabel sensitif.
