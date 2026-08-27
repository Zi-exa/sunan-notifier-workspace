# SUNAN Notifier

SUNAN Notifier adalah aplikasi mobile untuk memantau tugas, deadline, kalender, dan absensi dari SUNAN UMK. Aplikasi mengambil data dari Moodle Web Services SUNAN, menyimpan snapshot di Supabase, lalu mengirim notifikasi untuk perubahan penting seperti tugas baru, tugas dibuka, deadline H-1/H-hari, dan absensi.

Project ini bukan aplikasi resmi UMK. Repo ini adalah workspace publik yang menggabungkan source mobile sebagai submodule dan konfigurasi backend Supabase.

## Link

- Workspace: [Zi-exa/sunan-notifier-workspace](https://github.com/Zi-exa/sunan-notifier-workspace)
- Source mobile: [Zi-exa/sunan-notifier-mobile](https://github.com/Zi-exa/sunan-notifier-mobile)
- Download APK terbaru v1.0.1: [app-release.apk](https://github.com/Zi-exa/sunan-notifier-releases/releases/download/v1.0.1/app-release.apk)

## Fitur

- Login SUNAN memakai NIM dan password.
- Dashboard ringkas untuk tugas, absensi, dan status terbaru.
- Daftar tugas dan quiz dengan status pengumpulan.
- Monitoring absensi dari event SUNAN.
- Kalender akademik dari event Moodle.
- Notifikasi lokal dan push untuk tugas baru, tugas dibuka, deadline, dan absensi.
- Pengaturan notifikasi, tema, mata kuliah yang dipantau, serta pengecekan update aplikasi.
- EAS Update untuk patch JavaScript/assets dan rilis APK manual lewat GitHub Release.

## Arsitektur Singkat

```text
HP user
  -> Expo React Native app
  -> Moodle Web Services SUNAN
  -> Supabase Edge Functions
  -> PostgreSQL snapshots + notification queue
  -> Firebase Cloud Messaging / Expo Push
```

Alur utama:

1. User login di aplikasi memakai akun SUNAN.
2. Aplikasi mengambil data tugas, absensi, dan kalender dari SUNAN.
3. Backend Supabase melakukan polling berkala dan membandingkan snapshot data.
4. Jika ada perubahan penting, backend membuat antrean notifikasi.
5. `send-push` mengirim antrean ke perangkat aktif memakai FCM/Expo Push.
6. Saat notifikasi ditekan, aplikasi membuka halaman terkait.

## Struktur Repo

```text
.
+-- mobile/                 # Expo React Native app, dikelola sebagai git submodule
+-- supabase/
|   +-- migrations/         # Schema, grant, RLS, cron, dan RPC database
|   +-- functions/          # Edge Functions backend
+-- Redesign/               # Referensi desain
+-- README.md
```

Edge Functions utama:

- `poll-sunan-data`: mengambil data SUNAN, membandingkan snapshot, dan membuat antrean notifikasi.
- `send-push`: mengambil antrean secara atomik dan mengirim push notification.
- `daily-reminder`: membuat reminder deadline harian.
- `mobile-data`: endpoint aman untuk sinkronisasi profil, pengaturan, dan token perangkat.

## Prasyarat

Untuk menjalankan aplikasi mobile:

- Node.js dan npm.
- Akun Expo/EAS jika ingin build cloud atau publish EAS Update.
- Android Studio + Android SDK jika ingin build lokal.
- JDK sesuai kebutuhan Gradle/Android.

Untuk backend:

- Akun Supabase.
- Supabase CLI.
- Project Firebase untuk FCM Android.
- Service account Firebase untuk `FCM_SERVICE_ACCOUNT_JSON`.

## Clone

Folder `mobile` adalah submodule. Clone workspace dengan:

```powershell
git clone --recurse-submodules https://github.com/Zi-exa/sunan-notifier-workspace.git
cd sunan-notifier-workspace
```

Jika sudah clone tanpa submodule:

```powershell
git submodule update --init --recursive
```

## Setup Mobile

Masuk ke folder mobile dan install dependency:

```powershell
cd mobile
npm install
Copy-Item .env.example .env
```

Isi `.env`:

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `EXPO_PUBLIC_MOODLE_BASE_URL` | Ya | URL SUNAN, default `https://sunan.umk.ac.id`. |
| `EXPO_PUBLIC_MOODLE_SERVICE` | Ya | Nama service Moodle, default `moodle_mobile_app`. |
| `EXPO_PUBLIC_SUPABASE_URL` | Ya untuk mode real | URL project Supabase. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Ya untuk mode real | Anon/publishable key Supabase. Ini public, bukan secret. |
| `EXPO_PUBLIC_EXPO_PROJECT_ID` | Disarankan | Project ID Expo untuk registrasi push token. |
| `EXPO_PUBLIC_UPDATE_MANIFEST_URL` | Opsional | URL manifest JSON untuk update APK manual. Jangan isi dengan URL EAS Update. |
| `EXPO_PUBLIC_USE_MOCK_DATA` | Opsional | `true` untuk demo/dev tanpa akun SUNAN real, `false` untuk mode real. |

Jalankan development server:

```powershell
npm run start
```

Jika QR tidak muncul atau jaringan lokal sulit, coba:

```powershell
npm run start:lan:clear
npm run start:tunnel:clear
```

Catatan penting: Expo Go dapat dipakai untuk melihat UI, tetapi push notification Android tidak selalu lengkap di Expo Go. Untuk verifikasi push yang serius, pakai APK/dev build.

## Verifikasi Mobile

```powershell
cd mobile
npm run typecheck
npm run lint
```

## Setup Supabase

Link project Supabase:

```powershell
npx supabase link --project-ref <project-ref>
```

Set secret Edge Function:

```powershell
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
npx supabase secrets set MOODLE_BASE_URL=https://sunan.umk.ac.id
npx supabase secrets set FUNCTION_AUTH_KEY=<random-secret-atau-token-internal>
npx supabase secrets set FCM_SERVICE_ACCOUNT_JSON='<firebase-service-account-json>'
```

Isi Vault untuk pg_cron. Nilai `function_auth_key` harus sama dengan secret `FUNCTION_AUTH_KEY` yang diterima oleh Edge Function.

```powershell
npx supabase db query --linked "select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');"
npx supabase db query --linked "select vault.create_secret('<FUNCTION_AUTH_KEY>', 'function_auth_key');"
```

Apply migration:

```powershell
npx supabase db push
```

Deploy Edge Functions:

```powershell
npx supabase functions deploy poll-sunan-data --use-api
npx supabase functions deploy send-push --use-api
npx supabase functions deploy daily-reminder --use-api
npx supabase functions deploy mobile-data --use-api
```

Cek migration dan schema:

```powershell
npx supabase migration list --linked
npx supabase db lint --linked --level error
```

## Checklist Notifikasi

Notifikasi dianggap siap jika semua ini terpenuhi:

- `mobile/google-services.json` ada dan package name cocok dengan `id.umk.sunannotifier`.
- Secret `FCM_SERVICE_ACCOUNT_JSON` sudah terisi di Supabase.
- Edge Function `poll-sunan-data`, `daily-reminder`, `send-push`, dan `mobile-data` sudah deploy.
- Cron `poll-sunan-data-every-15m`, `send-push-every-15m`, dan `enqueue-daily-reminders` aktif.
- User membuka aplikasi minimal satu kali setelah install/update agar token perangkat terdaftar.
- Di database, perangkat aktif memakai token FCM native, bukan hanya token Expo lama.
- Pengaturan notifikasi user aktif.

Query cek cron:

```powershell
npx supabase db query --linked "select jobname, schedule, active from cron.job order by jobname;"
```

Query cek antrean terbaru:

```powershell
npx supabase db query --linked "select jenis_notifikasi, jadwal_kirim, dikirim_pada, alasan_gagal from public.tabel_antrian_notifikasi order by dibuat_pada desc limit 20;"
```

## Build Android

### Build APK dengan EAS

Build APK produksi untuk distribusi manual:

```powershell
cd mobile
npx eas login
npx eas build --platform android --profile production-apk
```

Build APK preview/internal:

```powershell
cd mobile
npm run build:apk
```

Build AAB untuk Play Store:

```powershell
cd mobile
npm run build:aab
```

### Build APK Lokal di Windows

Pastikan JDK dan Android SDK terbaca:

```powershell
$env:JAVA_HOME
where.exe java
$env:ANDROID_HOME
```

Jika Gradle gagal menemukan Android SDK, buat `mobile/android/local.properties`:

```properties
sdk.dir=C:/Users/<user>/AppData/Local/Android/Sdk
```

Build lokal:

```powershell
cd mobile
npm run build:local:apk
```

APK release biasanya ada di:

```text
mobile/android/app/build/outputs/apk/release/app-release.apk
```

## Rilis dan Update

Gunakan dua jalur update sesuai jenis perubahan:

- **EAS Update**: untuk perubahan JavaScript, tampilan, teks, query, dan logic yang tidak mengubah native module/config.
- **APK baru**: untuk perubahan native Android, permission, package, Firebase config, splash/icon native, SDK native, atau runtime version.

Publish EAS Update ke channel produksi:

```powershell
cd mobile
npx eas update --branch production --message "Catatan update"
```

APK publik disimpan di repo rilis, bukan di repo source mobile:

```text
https://github.com/Zi-exa/sunan-notifier-releases
```

Gunakan satu asset APK saja untuk setiap rilis: `app-release.apk`. Versinya mengikuti tag GitHub Release, misalnya `v1.0.1`.

Untuk rilis APK baru:

1. Naikkan versi aplikasi di `mobile/package.json` dan `mobile/app.json`.
2. Build APK baru.
3. Upload/ganti asset `app-release.apk` di GitHub Release versi terkait.
4. Jika memakai manifest APK manual, pastikan `EXPO_PUBLIC_UPDATE_MANIFEST_URL` menunjuk JSON yang benar.

Jangan upload file APK dengan nama alternatif seperti `SUNAN-Notifier-vX-buildY.apk`, supaya link download dan update manual tetap konsisten.

## Troubleshooting

### `java` tidak ditemukan

Install JDK, lalu set `JAVA_HOME` dan tambahkan `JAVA_HOME/bin` ke `PATH`.

### `SDK location not found`

Set `ANDROID_HOME` atau buat `mobile/android/local.properties` dengan `sdk.dir`.

### QR Expo tidak muncul

Coba jalankan:

```powershell
npm run start:lan:clear
```

Jika LAN tidak bisa dipakai, coba tunnel:

```powershell
npm run start:tunnel:clear
```

### Notifikasi tidak muncul

Periksa checklist notifikasi di atas. Penyebab paling umum:

- aplikasi belum dibuka ulang setelah update;
- permission notifikasi Android belum aktif;
- token perangkat belum terdaftar;
- secret FCM belum benar;
- cron belum aktif;
- tidak ada tugas/absensi baru yang memenuhi jadwal notifikasi.

### Notifikasi muncul dobel

Pastikan token lama untuk perangkat yang sama sudah nonaktif dan backend `send-push` memakai claim antrean atomik. Jika HP pernah dipakai login akun lain, buka aplikasi dengan akun saat ini agar jadwal lokal dan token backend disinkronkan ulang.

## Keamanan

- Jangan commit file `.env`, private key, service role key, atau Firebase service account JSON mentah.
- `EXPO_PUBLIC_*` akan ikut masuk ke bundle aplikasi, jadi jangan isi dengan secret.
- `google-services.json` hanya konfigurasi client Firebase Android, bukan service account secret.
- Akses tabel Supabase dari aplikasi mobile harus lewat Edge Function, bukan query langsung ke tabel sensitif.
- Tabel baru di schema `public` harus punya grant eksplisit, RLS aktif, dan akses `anon`/`authenticated` dibatasi sesuai kebutuhan.
