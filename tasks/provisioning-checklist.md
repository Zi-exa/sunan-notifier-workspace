# Provisioning Checklist (T-02, T-03, T-16)

Tanggal: 2026-04-21

Dokumen ini dipakai untuk menuntaskan tasklist yang masih tergantung infrastruktur eksternal:
- T-02 Setup Supabase project + skema database
- T-03 Setup Firebase project + konfigurasi FCM
- T-16 Setup Supabase cron job (15 menit)

## 1) Supabase Project Setup (T-02)

### Prasyarat
- Akun Supabase aktif
- Folder project sudah ada di lokal
- Supabase CLI terpasang (opsional, untuk deploy function via CLI)

### Langkah
1. Buat project baru di Supabase dashboard.
2. Catat nilai berikut dari Project Settings:
- Project URL
- Anon key
- Service role key
3. Isi env mobile:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
4. Simpan secret cron ke Supabase Vault:
- `project_url`: `https://<project-ref>.supabase.co`
- `function_auth_key`: token internal yang juga dipasang sebagai secret Edge Functions `FUNCTION_AUTH_KEY`
5. Jalankan migration SQL berurutan di SQL Editor atau `npx supabase db push`:
- supabase/migrations/20260420_0001_init.sql
- migration cron terbaru di `supabase/migrations` yang membaca secret dari Vault
6. Deploy edge functions:
- poll-sunan-data
- send-push
- daily-reminder

### Verifikasi
- Tabel inti terbuat: app_users, user_settings, user_devices, task_snapshots, notification_queue, poll_runs
- Tiga edge function status Active
- Mobile app bisa sync profil dan settings ke Supabase

## 2) Firebase + FCM Setup (T-03)

### Prasyarat
- Akun Google/Firebase aktif
- Package Android app: id.umk.sunannotifier

### Langkah
1. Buat project baru di Firebase Console.
2. Aktifkan Cloud Messaging.
3. Tambahkan Android app dengan package id: id.umk.sunannotifier.
4. Ambil kredensial FCM sesuai jalur backend yang dipakai:
- Jika tetap pakai legacy server key: ambil Server key
- Jika migrasi ke HTTP v1: siapkan service account JSON
5. Simpan secret ke Supabase Edge Functions:
- FCM_SERVICE_ACCOUNT_JSON (untuk jalur utama HTTP v1)
- FCM_SERVER_KEY (opsional fallback legacy)

### Verifikasi
- Endpoint send-push dapat mengirim test payload tanpa error
- Device menerima notifikasi test (minimal melalui jalur Expo Push)

## 3) Supabase Cron Activation (T-16)

### Prasyarat
- Migration 0001 sudah jalan
- Edge functions sudah deploy
- URL function dan bearer key sudah final

### Langkah
1. Pastikan secret `project_url` dan `function_auth_key` sudah ada di Supabase Vault.
2. Pastikan `FUNCTION_AUTH_KEY` dengan nilai yang sama sudah dipasang sebagai secret Edge Functions.
3. Jalankan migration cron terbaru.
4. Pastikan extension cron/net/vault aktif (sesuai ketersediaan project Supabase).

### Verifikasi
- Job cron tercatat di cron.job
- Job polling jalan tiap 15 menit
- Job send-push jalan tiap 15 menit
- Job daily-reminder jalan pukul 07.00

## 4) Secrets Matrix

Isi nilai berikut sebelum production:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- EXPO_PUBLIC_EXPO_PROJECT_ID
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- FUNCTION_AUTH_KEY
- MOODLE_BASE_URL
- FCM_SERVICE_ACCOUNT_JSON
- FCM_SERVER_KEY

## 5) Exit Criteria

Checklist ini dianggap selesai jika:
- T-02: project Supabase sudah aktif dan migration sukses
- T-03: Firebase/FCM siap kirim notifikasi
- T-16: cron Supabase aktif dan job tervalidasi
