# SUNAN Notifier

Implementasi awal proyek SUNAN Notifier berdasarkan PRD dan task list.

Stack utama:
- Mobile: Expo + React Native + TypeScript + Expo Router
- Data layer: React Query + Zustand
- Integrasi SUNAN: Moodle Web Services API
- Backend: Supabase PostgreSQL + Edge Functions + pg_cron
- Notifikasi: Expo Notifications (dengan jalur Expo Push/FCM di backend)

## Struktur Utama

- mobile: aplikasi mobile (dikelola sebagai repo terpisah dan direferensikan sebagai submodule pada repo root)
- supabase/migrations: SQL schema dan cron setup
- supabase/functions: edge functions polling, queue, dan push dispatch
- tasks/todo.md: eksekusi plan + review hasil

## Clone Workspace

Karena folder `mobile` dikelola sebagai submodule, clone workspace ini dengan:

1. `git clone --recurse-submodules <repo-root>`
2. atau setelah clone biasa:
   - `git submodule update --init --recursive`

## Fitur yang Sudah Diimplementasikan

Sprint 1:
- Setup project Expo TypeScript
- Login NIM/password
- Request token Moodle
- Fetch daftar matkul

Sprint 2:
- Fetch assignments semua matkul
- Fetch deadline calendar
- Cek submission status per tugas
- Dashboard + daftar tugas dengan status

Sprint 3:
- Kalender deadline (mobile)
- Fondasi notifikasi local + deep link detail tugas
- Edge function polling + snapshot diff + queue notifikasi

Sprint 4:
- Settings notification toggle
- Settings interval polling (15/30/60)
- Settings do-not-disturb
- Pilih matkul dipantau
- Error handling dasar pada auth/fetch

## Setup Mobile

1. Masuk ke folder mobile:
   - cd mobile

2. Copy env:
   - salin `.env.example` menjadi `.env`

3. Isi variabel:
   - EXPO_PUBLIC_MOODLE_BASE_URL
   - EXPO_PUBLIC_MOODLE_SERVICE
   - EXPO_PUBLIC_SUPABASE_URL
   - EXPO_PUBLIC_SUPABASE_ANON_KEY
   - EXPO_PUBLIC_EXPO_PROJECT_ID (opsional, tapi disarankan)
   - EXPO_PUBLIC_UPDATE_MANIFEST_URL (opsional, khusus update APK manual; jangan isi dengan URL `u.expo.dev`)
   - EXPO_PUBLIC_USE_MOCK_DATA=true untuk mode demo

4. Jalankan aplikasi:
   - npm install
   - npm run start

5. Verifikasi:
   - npm run typecheck
   - npm run lint

## Setup Supabase

1. Jalankan SQL migration dari:
   - supabase/migrations/20260420_0001_init.sql
   - supabase/migrations/20260421_0002_cron.sql

2. Deploy edge functions:
   - poll-sunan-data
   - send-push
   - daily-reminder

3. Set environment variables server:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - MOODLE_BASE_URL
   - FCM_SERVICE_ACCOUNT_JSON (direkomendasikan untuk FCM HTTP v1)
   - FCM_SERVER_KEY (opsional fallback legacy)

4. Update placeholder URL dan bearer key pada file cron SQL sebelum eksekusi.

## Catatan Penting

- Build APK dan testing E2E device Android nyata belum dapat divalidasi penuh tanpa kredensial/infra production.
- Project sudah siap sebagai baseline implementasi lanjutan menuju release.

Dokumen operasional untuk menuntaskan task manual:
- `tasks/provisioning-checklist.md` (T-02, T-03, T-16)
- `tasks/e2e-android-checklist.md` (T-27)

## Persiapan Build APK (T-28)

Konfigurasi EAS sudah disiapkan di `mobile/eas.json` dengan profile:
- `preview` untuk APK internal (`buildType: apk`)
- `production` untuk App Bundle (`buildType: app-bundle`)

Langkah build saat kredensial sudah siap:
1. `cd mobile`
2. `npx eas login`
3. `npm run build:apk`

Untuk release Play Store:
1. `cd mobile`
2. `npx eas login`
3. `npm run build:aab`

## Alternatif Build Lokal Android Tanpa EAS Cloud

Jika kuota EAS Build cloud habis, project ini juga sudah disiapkan untuk build Android lokal di Windows menggunakan `expo prebuild` + Gradle.

Ringkasan jalur cepat:
1. `cd mobile`
2. `npm run prebuild:android:preview`
3. `npm run build:local:apk`

Panduan lengkap ada di:
- `tasks/local-android-build.md`

## Update In-App

Project ini sekarang mendukung dua jalur update:
- update APK manual lewat manifest JSON publik
- EAS Update untuk patch JS kecil

Panduan setup lengkap ada di:
- `tasks/app-update-setup.md`
- `mobile/update-manifest.example.json`
