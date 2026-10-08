# Supabase Edge Functions - SUNAN Notifier

Fungsi serverless yang disiapkan:

1. poll-sunan-data
- Polling API SUNAN (Moodle Web Service)
- Sinkron snapshot tugas ke `tabel_snapshot_tugas`
- Queue notifikasi tugas baru, deadline H-1, deadline H-hari, dan absensi

2. send-push
- Ambil antrean dari `tabel_antrian_notifikasi`
- Kirim push ke device user (Expo push token atau FCM legacy)
- Hormati jam diam user (WIB) dengan menunda antrean sampai rentang selesai
- Retry kegagalan sementara hingga lima kali dengan backoff 15/30/60/120 menit
- Nonaktifkan token perangkat yang ditolak provider sebagai tidak valid

3. daily-reminder
- Jalankan reminder harian berdasarkan snapshot yang sudah ada
- Menambahkan notifikasi deadline H-1 dan H-hari

4. mobile-data
- Endpoint aman untuk kebutuhan mobile:
  - sync profil pengguna
  - ambil/simpan settings
  - simpan push token device
- Validasi token SUNAN dilakukan di server sebelum akses service role ke tabel public

## Environment Variables

Wajib:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Opsional (disarankan untuk isolasi auth antar endpoint internal):
- FUNCTION_AUTH_KEY

Untuk integrasi SUNAN:
- MOODLE_BASE_URL (default: https://sunan.umk.ac.id)

Untuk delivery FCM:
- FCM_SERVICE_ACCOUNT_JSON (direkomendasikan, untuk FCM HTTP v1)
- FCM_SERVER_KEY (opsional fallback legacy)

## Deploy

1. Jalankan migrasi SQL di folder supabase/migrations
2. Deploy function:
   - supabase functions deploy poll-sunan-data
   - supabase functions deploy send-push
   - supabase functions deploy daily-reminder
   - supabase functions deploy mobile-data
3. Simpan `project_url` dan `function_auth_key` di Supabase Vault, lalu jalankan migration cron terbaru
