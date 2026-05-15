# Supabase Setup

Folder ini berisi artefak backend untuk SUNAN Notifier.

## Isi Folder

- migrations/20260420_0001_init.sql
  - membuat schema utama aplikasi
- migrations/20260421_0002_cron.sql
  - template pg_cron untuk polling dan dispatch notifikasi
- functions/poll-sunan-data/index.ts
  - polling Moodle API, update snapshot, enqueue notification
- functions/send-push/index.ts
  - kirim notification queue ke Expo Push / FCM
- functions/daily-reminder/index.ts
  - enqueue reminder H-1 dan H-hari
- functions/mobile-data/index.ts
  - endpoint aman untuk operasi mobile ke `app_users`, `user_settings`, dan `user_devices`
  - memvalidasi token SUNAN di server sebelum memakai service role Supabase

## Alur Ringkas

1. User login di app dan token Moodle tersimpan
2. Edge function poll-sunan-data jalan setiap 15 menit
3. Snapshot baru dibandingkan snapshot lama
4. Jika ada perubahan, row masuk notification_queue
5. send-push kirim queue ke device user
6. daily-reminder menyiapkan reminder jam 07.00
7. operasi mobile seperti sync profil, settings, dan device token lewat function mobile-data, bukan query langsung ke tabel public

Catatan auth internal:
- Endpoint function saat ini mendukung validasi menggunakan `SUPABASE_SERVICE_ROLE_KEY` atau `FUNCTION_AUTH_KEY`.
- Untuk cron, direkomendasikan gunakan `FUNCTION_AUTH_KEY` agar tidak tergantung rotasi service role key.
- Cron terbaru membaca `project_url` dan `function_auth_key` dari Supabase Vault; jangan jalankan job dengan placeholder `Bearer <FUNCTION_AUTH_KEY>`.

Catatan Data API grants:
- Mobile tidak boleh akses tabel `public` langsung; gunakan Edge Function.
- Tabel baru di `public` harus punya explicit grant untuk `service_role`, revoke untuk `anon`/`authenticated`, dan RLS aktif sebelum dipakai.

## Deploy Singkat

- supabase functions deploy poll-sunan-data
- supabase functions deploy send-push
- supabase functions deploy daily-reminder
- supabase functions deploy mobile-data

Pastikan environment secrets terisi di project Supabase sebelum deploy.
