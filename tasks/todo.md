# SUNAN Notifier — Execution Todo

Tanggal: 2026-04-20

## Plan

- [x] 1. Inisialisasi project Expo + TypeScript + Expo Router
- [x] 2. Setup dependency utama (React Query, Zustand, SecureStore, Notifications, Supabase)
- [x] 3. Implementasi login NIM/password dan akuisisi token Moodle
- [x] 4. Implementasi fetch courses, assignments, calendar events, submission status
- [x] 5. Implementasi screen Dashboard, Tasks, Calendar, Settings
- [x] 6. Implementasi state global dan settings notifikasi user
- [x] 7. Tambahkan konfigurasi Supabase (schema + seed struktur data)
- [x] 8. Tambahkan template Edge Function polling + diff snapshot + enqueue notif
- [x] 9. Tambahkan notifikasi lokal dasar + deep link handling
- [x] 10. Verifikasi build/typecheck dan dokumentasi hasil

## Progress Log

- [x] Plan dibuat
- [x] Implementasi dimulai
- [x] Verifikasi selesai

## Review

### Cakupan Mobile

- Auth login NIM + password ke `token.php` SUNAN dengan fallback mock mode.
- Session disimpan di SecureStore (dan fallback AsyncStorage untuk web).
- Query layer (React Query) untuk course, assignment, calendar event, dan submission status.
- UI tab lengkap: Dashboard, Tugas, Kalender, Settings.
- Detail tugas + quick link ke SUNAN dan deep-link handling dari notifikasi.
- Local notification utilities + registrasi Expo push token.
- Sinkron badge count icon app berdasarkan jumlah tugas pending/overdue.

### Cakupan Backend (Supabase)

- SQL migration awal: tabel user, settings, devices, snapshots, notification queue, polling runs.
- SQL migration cron template: polling 15 menit, send push 15 menit, daily reminder.
- Edge Function `poll-sunan-data`: polling API Moodle, diff snapshot, enqueue notifikasi.
- Edge Function `send-push`: kirim notifikasi via Expo Push atau FCM legacy.
- Edge Function `daily-reminder`: enqueue reminder H-1 dan H-hari.

### Verifikasi

- `npm run typecheck` sukses.
- `npm run lint` sukses.

### Gap yang Butuh Konfigurasi Lanjutan

- Isi env production (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_EXPO_PROJECT_ID`).
- Isi secrets server (`SUPABASE_SERVICE_ROLE_KEY`, `FUNCTION_AUTH_KEY`, `FCM_SERVICE_ACCOUNT_JSON`, dan endpoint cron aktual).
- Uji end-to-end di device Android real dan proses build APK (EAS).

## Plan (Attendance Enhancement)

- [x] 1. Lengkapi model absensi dari event kalender SUNAN
- [x] 2. Buat screen absensi dengan filter status
- [x] 3. Tambahkan card absensi reusable dan quick link ke SUNAN
- [x] 4. Integrasikan tab Absensi + ringkasan absensi di Dashboard
- [x] 5. Tambahkan notifikasi lokal absensi dibuka dan segera ditutup
- [x] 6. Verifikasi typecheck dan lint setelah perubahan

## Review (Attendance Enhancement)

- Tab baru `Absensi` sudah aktif pada bottom navigation dan terhubung ke screen monitoring absensi.
- Dashboard kini menampilkan section `Absensi Aktif` beserta jumlah status `open` dan `closing_soon`.
- Komponen sinkron notifikasi absensi lokal ditambahkan dengan deduplikasi per sesi saat app aktif.
- Tap notifikasi absensi sekarang langsung membuka tab `Absensi` dengan filter otomatis (`open` atau `closing_soon`) sesuai jenis notifikasi.
- Event absensi target notifikasi kini diberi highlight visual pada kartu agar langsung terlihat setelah screen dibuka.
- Template backend juga diperluas untuk mendukung notification type `attendance_closing`.
- Verifikasi selesai dengan menjalankan `npm run typecheck` dan `npm run lint` di folder mobile.

## Plan (Tasklist Gap T-26)

- [x] 1. Buat klasifikasi error terstandar untuk auth/offline/server/validation
- [x] 2. Terapkan mapping error di client Moodle (REST + token.php)
- [x] 3. Tambahkan session expiry handler saat token invalid
- [x] 4. Terapkan retry policy React Query berbasis jenis error
- [x] 5. Tampilkan pesan error kontekstual di Dashboard, Tugas, Kalender, dan Absensi
- [x] 6. Verifikasi lint dan typecheck

## Review (Tasklist Gap T-26)

- Modul baru `lib/moodle/errors.ts` ditambahkan untuk klasifikasi error dan formatting pesan user.
- Client Moodle kini mengubah kegagalan jaringan menjadi error `offline` dan error token invalid menjadi `auth`.
- Query hooks kini punya retry policy adaptif dan guard auto-expire session untuk error `auth`.
- UI error state di tab utama kini memakai pesan yang lebih tepat sesuai jenis kegagalan.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` (keduanya lulus).

## Plan (Tasklist Gap T-28 Preparation)

- [x] 1. Tambahkan konfigurasi EAS build profile untuk APK internal
- [x] 2. Tambahkan script npm untuk build APK/AAB
- [x] 3. Tambahkan panduan eksekusi build di README
- [x] 4. Eksekusi build APK final dengan akun EAS production

## Review (Tasklist Gap T-28 Preparation)

- File `mobile/eas.json` sudah ditambahkan dengan profile `preview` (APK) dan `production` (AAB).
- Script `build:apk` dan `build:aab` sudah ditambahkan di `mobile/package.json`.
- README root sudah diperbarui dengan langkah build saat kredensial tersedia.
- Eksekusi build final berhasil setelah login EAS dan setup keystore remote.

## Plan (Tasklist Continuation - Manual Execution Guides)

- [x] 1. Susun checklist provisioning untuk T-02, T-03, dan T-16
- [x] 2. Susun checklist E2E Android untuk T-27
- [x] 3. Sinkronkan status implementasi dengan referensi dokumen checklist

## Review (Tasklist Continuation - Manual Execution Guides)

- Dokumen `tasks/provisioning-checklist.md` ditambahkan sebagai panduan step-by-step untuk setup Supabase/Firebase/cron.
- Dokumen `tasks/e2e-android-checklist.md` ditambahkan sebagai checklist skenario uji device nyata untuk menutup T-27.
- File status utama diperbarui agar menyebutkan checklist sudah tersedia, sehingga eksekusi manual berikutnya lebih terarah.

## Review (Provisioning Execution - Supabase)

- Supabase CLI login berhasil untuk project `rigzchjdqgpxaqybcrdg`.
- Edge Functions berhasil dideploy: `poll-sunan-data`, `send-push`, `daily-reminder`.
- Migration schema dan cron berhasil diaplikasikan ke remote DB.
- Cron jobs tervalidasi aktif: `poll-sunan-data-every-15m`, `send-push-every-15m`, `enqueue-daily-reminders`.
- Secret `MOODLE_BASE_URL` sudah terpasang pada project.
- Secret `FUNCTION_AUTH_KEY` sudah ditambahkan dan function auth logic diperbarui agar cron/internal invoke stabil.
- Verifikasi endpoint sukses dengan invoke langsung:
	- `poll-sunan-data` => `ok: true`
	- `daily-reminder` => `ok: true`
	- `send-push` => queue diproses (`queued: 1`, `failed: 1` pada token test invalid, sesuai ekspektasi)

## Review (Provisioning Execution - FCM HTTP v1)

- File service account Firebase berhasil divalidasi (`type: service_account`) dari workspace lokal.
- Secret `FCM_SERVICE_ACCOUNT_JSON` sudah dipasang ke project Supabase `rigzchjdqgpxaqybcrdg`.
- Edge Function `send-push` sudah di-deploy ulang dengan jalur utama FCM HTTP v1 + fallback legacy.
- Uji antrean notifikasi dengan token Android non-Expo menunjukkan fungsi berjalan dan merespons error valid dari Firebase: `The registration token is not a valid FCM registration token`.
- Status task T-03 kini dapat dianggap selesai; sisa manual utama ada di T-27 (uji device real).

## Review (T-28 Build Execution - Completed)

- EAS CLI sudah terpasang lokal (`eas-cli/18.7.0`) dan login berhasil dengan akun Expo.
- Project sudah ter-link ke EAS dengan project ID valid: `eb508cc1-ec67-415f-a234-bb2cdf068286`.
- Build profile `preview` sudah dijalankan via `npm run build:apk`.
- Build Android selesai di EAS Cloud dengan ID `fb1d0794-9e35-443a-bfe8-6264eb2ec0cf`.
- APK hasil build tersedia di `https://expo.dev/artifacts/eas/x1uLKMNt3stPZddQft8Yug.apk`.

## Plan (Attendance Visibility Gap - 2026-04-21)

- [x] 1. Audit alur data absensi dan konfirmasi akar masalah di jalur fetch
- [x] 2. Tambahkan fallback fetch modul attendance dari course contents SUNAN
- [x] 3. Gabungkan fallback dengan event kalender tanpa duplikasi data
- [x] 4. Sesuaikan UI untuk item absensi tanpa jadwal eksplisit
- [x] 5. Verifikasi lint/typecheck dan tulis review hasil

## Review (Attendance Visibility Gap - 2026-04-21)

- Akar masalahnya ada pada asumsi lama bahwa fitur `Absensi` hanya bisa hidup dari event kalender SUNAN; modul `Daftar Hadir` yang tampil di course page tetapi tidak punya event kalender yang kaya metadata akhirnya hilang dari tab `Absensi`.
- Client mobile sekarang tetap memakai kalender sebagai sumber utama, lalu menambahkan fallback `core_course_get_contents` khusus `modname=attendance` agar modul absensi tetap tampil meski jadwal sesi tidak diekspor jelas.
- Hasil fallback digabung tanpa duplikasi dengan sumber kalender memakai identitas URL/judul-course, sehingga event kalender yang lengkap tetap menang untuk status dan timing.
- UI kartu absensi kini mendukung status baru `available` untuk modul yang memang ada di kelas tetapi tidak membawa jam buka/tutup yang tepercaya dari SUNAN.
- Dashboard ikut menampilkan jumlah `Modul tersedia`, sehingga user tetap melihat keberadaan absensi walau data jadwalnya tidak lengkap.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile` dan keduanya lulus.

## Plan (Attendance Upcoming Event Payload Fix - 2026-04-21)

- [x] 1. Audit ulang bentuk payload `Upcoming Events` dari webservice Moodle
- [x] 2. Perbaiki parser event agar menerima object keyed-by-id selain array flat
- [x] 3. Verifikasi lint/typecheck dan catat lesson baru

## Review (Attendance Upcoming Event Payload Fix - 2026-04-21)

- Ditemukan bahwa `core_calendar_get_calendar_events` dapat mengirim `events` sebagai object keyed-by-eventid, bukan array sequential.
- Parser lama `toCalendarEventArray()` hanya menerima array, sehingga event kalender valid seperti `Daftar Hadir` bisa terbuang sebelum masuk ke fitur `Absensi`.
- Parser sekarang menerima dua bentuk payload sekaligus: array flat dan object map, lalu menormalkan field numerik penting (`id`, `timestart`, `timeduration`, `courseid`, `instance`).
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`, keduanya lulus.

## Plan (Attendance Requirement Narrowing - 2026-04-21)

- [x] 1. Audit ulang perilaku fitur Absensi terhadap requirement user terbaru
- [x] 2. Batasi daftar Absensi hanya ke item yang punya hari/jam valid
- [x] 3. Rapikan copy UI agar tidak lagi menyebut fallback modul umum
- [x] 4. Verifikasi lint/typecheck dan dokumentasikan hasil

## Review (Attendance Requirement Narrowing - 2026-04-21)

- Fitur `Absensi` kini hanya meloloskan item yang punya jadwal hari/jam valid; fallback modul attendance tanpa `startsAt` tidak lagi ditampilkan di daftar.
- Status `available` tetap dipertahankan, tetapi kini dipakai untuk sesi yang masih punya waktu mulai valid namun tidak punya batas tutup yang tegas, bukan untuk semua modul attendance umum.
- Copy UI di screen Absensi dan ringkasan Dashboard dirapikan agar sesuai requirement: fokus ke sesi absensi terjadwal seperti di `Upcoming Events` SUNAN.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`, keduanya lulus.

## Plan (Attendance Tasklist Audit - 2026-04-21)

- [x] 1. Audit tasklist asli dan dokumen status implementasi untuk fitur absensi
- [x] 2. Catat bahwa tasklist asli belum mendefinisikan screen Absensi secara rinci
- [x] 3. Ringkas gap antara tasklist/status dokumen dan requirement user terbaru

## Review (Attendance Tasklist Audit - 2026-04-21)

- Tasklist asli `sunan-notifier-tasklist.md` tidak memiliki task khusus untuk tab/screen `Absensi`; absensi hanya tersirat lewat PRD dan task kalender/notifikasi.
- Dokumen `tasks/tasklist-implementation-status.md` menambahkan klaim fitur absensi lengkap di luar 28 task awal: tab Absensi, filter status, ringkasan dashboard, notifikasi lokal, deep link, dan highlight target notifikasi.
- Requirement user terbaru lebih sempit: fitur Absensi harus meniru `Upcoming events` SUNAN yang benar-benar punya hari/jam, sehingga dokumen status implementasi saat ini tidak cukup presisi dan perlu dianggap overclaim sampai perilaku app sesuai bukti lapangan.

## Plan (Attendance Calendar Alignment - 2026-04-21)

- [x] 1. Hapus jalur fallback `core_course_get_contents` dari fetch absensi
- [x] 2. Tambahkan fetch `core_calendar_get_calendar_upcoming_view` untuk meniru `Upcoming events` SUNAN
- [x] 3. Gabungkan sumber upcoming dan calendar tetap dalam satu jalur data kalender Moodle
- [x] 4. Rapikan query pemanggil bila parameter course fallback sudah tidak dibutuhkan
- [x] 5. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Attendance Calendar Alignment - 2026-04-22)

- **Diagnostik lapangan** via script standalone (`scripts/test-attendance-api.mjs`) menunjukkan:
  - `mod_attendance_get_sessions` dan `mod_attendance_get_courses_with_today_sessions` TIDAK tersedia di SUNAN (plugin attendance web service tidak ter-install).
  - `core_calendar_get_calendar_events` mengembalikan **0 event** — calendar events Moodle SUNAN kosong.
  - `core_calendar_get_calendar_upcoming_view` adalah **satu-satunya sumber data** yang mengembalikan sesi absensi (8 events termasuk absensi hari ini).
- **Akar masalah utama**: `buildAttendanceIdentity()` di `attendance.ts` menggunakan **URL modul** (`view.php?id=652636`) sebagai identity key. Karena semua sesi dari modul attendance yang sama punya URL yang sama, saat merge sesi terakhir (6 Mei) menimpa sesi hari ini (22 April).
- **Fix utama**: Ubah `buildAttendanceIdentity()` agar menggunakan `eventId` (unik per calendar event) sebagai primary key. Ini mempertahankan semua sesi berbeda dari modul yang sama, sambil tetap menggabungkan event duplikat dari sumber API berbeda.
- **Fix tambahan**: Parser `calendarPayload.events` diubah ke `toCalendarEventArray()` untuk menangani object keyed-by-eventid.
- **Revert**: Parameter `courseid` di `core_calendar_get_calendar_upcoming_view` dihapus kembali karena diagnostik membuktikan endpoint lebih baik tanpa parameter (mengembalikan semua course).
- **Cleanup**: Dead types, debug code, dan source union `'course_module'` dihapus.
- Verifikasi `npm run typecheck` dan `npm run lint` keduanya lulus.

## Plan (Initial Screen Preload - 2026-04-23)

- [x] 1. Audit kenapa beberapa tab masih loading saat pertama kali dibuka
- [x] 2. Pindahkan preload ke jalur global yang selalu dilewati sebelum `Tabs` dirender
- [x] 3. Isi cache React Query untuk Dashboard, Tugas, Absensi, dan Kalender sejak awal
- [x] 4. Nonaktifkan lazy mount tab agar semua halaman siap setelah preload awal
- [x] 5. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Initial Screen Preload - 2026-04-23)

- Akar masalahnya ada pada preload lama yang hanya hidup di `mobile/app/index.tsx`; alur login bisa langsung masuk ke `/(tabs)` sehingga preload itu terlewati dan beberapa halaman masih loading saat pertama kali dibuka.
- Preload sekarang dipindah ke gate global `mobile/components/app/InitialDataGate.tsx`, jadi cold start, login, dan jalur masuk ke area tab sama-sama melewati bootstrap data yang konsisten.
- Gate tersebut memanaskan cache React Query untuk `courses`, `assignments`, `attendance-sessions`, dan `calendar-events` sebelum tab dirender.
- Konfigurasi `Tabs` diubah menjadi `lazy: false`, sehingga seluruh screen tab ikut mount sejak awal setelah data siap.
- `mobile/app/index.tsx` disederhanakan menjadi entry redirect biasa supaya tidak ada dua mekanisme preload yang tumpang tindih.
- Verifikasi: `npm run typecheck` sukses. `npm run lint` juga sukses dan sekarang bersih tanpa warning.

## Plan (Initial Preload Flow Correction - 2026-04-23)

- [x] 1. Ubah preload agar tidak lagi menahan app di loading screen global
- [x] 2. Jalankan preload sebagai proses background dari area tab/screen awal
- [x] 3. Rapikan konfigurasi tab agar tidak lagi bergantung pada gate blocking
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Initial Preload Flow Correction - 2026-04-23)

- Koreksi user valid: implementasi sebelumnya memindahkan preload ke splash gate global, sehingga app langsung masuk ke loading screen sebelum screen pertama tampil.
- Jalur preload sekarang dipindah ke komponen non-blocking `mobile/components/app/InitialDataPreloader.tsx` yang berjalan di background setelah area tab terbuka.
- `mobile/app/(tabs)/_layout.tsx` tidak lagi membungkus `Tabs` dengan gate blocking; preload dipasang sebagai side-effect biasa sehingga user tetap masuk ke screen pertama secara normal.
- Opsi `lazy: false` juga dihapus karena preload background sudah cukup untuk memanaskan cache tanpa memaksa semua tab mount serentak.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Restore Initial Loading Screen - 2026-04-23)

- [x] 1. Undo perubahan preload non-blocking terakhir
- [x] 2. Aktifkan lagi loading screen global sebelum `Tabs` dirender
- [x] 3. Hapus preloader background yang sudah tidak dipakai
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Restore Initial Loading Screen - 2026-04-23)

- Sesuai permintaan user, perubahan terakhir dibalik dan alur awal kembali memakai loading screen global sebelum area tab tampil.
- Komponen `InitialDataGate` dipulihkan untuk mem-block render `Tabs` sampai preload courses, assignments, attendance, dan calendar selesai.
- Komponen `InitialDataPreloader` dihapus kembali karena jalur preload background tidak lagi dipakai.
- `mobile/app/(tabs)/_layout.tsx` kembali membungkus `Tabs` dengan gate blocking dan mengaktifkan lagi `lazy: false`.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Loading Acceleration - 2026-04-23)

- [x] 1. Audit bottleneck loading awal dan spinner kedua di dashboard
- [x] 2. Kurangi pekerjaan yang ikut mem-block loading screen awal
- [x] 3. Hentikan refetch agresif yang memunculkan indikator muter lagi setelah masuk dashboard
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Loading Acceleration - 2026-04-23)

- Ditemukan dua sumber utama keluhan user:
  - `InitialDataGate` ikut menunggu `calendar-events`, padahal data itu belum dibutuhkan untuk merender dashboard.
  - Query `assignments` dan `attendance` memakai `refetchOnMount: 'always'` dan `refetchOnWindowFocus: 'always'`, sehingga setelah lolos loading screen awal dashboard masih memicu spinner/refetch kedua.
- Gate awal sekarang hanya mem-block data yang benar-benar dipakai dashboard (`courses`, `assignments`, `attendance`), sedangkan `calendar-events` dipindah menjadi `prefetchQuery()` background setelah app siap.
- `Tabs` tidak lagi dipaksa `lazy: false`, jadi area dashboard tidak harus menunggu mounting semua tab tersembunyi sekaligus.
- Query `assignments` dan `attendance` kembali memakai perilaku default React Query dengan cache warm dari gate, sehingga dashboard tidak langsung refetch lagi saat pertama masuk.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Expo Go Loading Recovery - 2026-04-23)

- [x] 1. Audit ulang jalur blocking yang masih berat di Expo Go setelah akselerasi awal
- [x] 2. Kurangi kerja blocking gate dengan memisahkan hydration status submit tugas ke background
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Expo Go Loading Recovery - 2026-04-23)

- Bottleneck terbesar yang tersisa ada pada `hydrateAssignmentsWithSubmissionStatus()`, karena fungsi ini memanggil endpoint status/attempt untuk setiap tugas dan quiz satu per satu.
- `InitialDataGate` sekarang hanya mengambil daftar tugas ringan via `getAssignments()` untuk membuat dashboard cepat tampil, lalu hasilnya langsung ditulis ke cache React Query.
- Hydration status submit yang mahal tetap dijalankan, tetapi dipindah ke background dan hasil akhirnya meng-update cache setelah dashboard sudah terbuka.
- Dengan pola ini, Expo Go tidak perlu menunggu seluruh status submit ter-hydrate hanya untuk masuk ke halaman awal.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Expo Go QR Recovery - 2026-04-23)

- [x] 1. Audit apakah gejala lebih mengarah ke crash bundle atau koneksi Expo Go ke Metro
- [x] 2. Tambahkan script start yang cocok untuk kasus QR scan gagal (`tunnel` dan `clear`)
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Expo Go QR Recovery - 2026-04-23)

- Dari inspeksi project, tidak ada indikasi source rusak: `typecheck` dan `lint` tetap lulus setelah perubahan terakhir.
- Gejala “QR muncul tapi Expo Go bilang something went wrong” lebih cocok ke masalah konektivitas Expo Go ke Metro dev server, terutama saat `expo start` berjalan dalam mode `lan`.
- Untuk mempercepat recovery, `mobile/package.json` sekarang menyediakan:
  - `npm run start:tunnel`
  - `npm run start:tunnel:clear`
  - `npm run start:clear`
- Jalur `tunnel` lebih cocok untuk HP yang tidak bisa menjangkau laptop langsung lewat IP lokal atau terhalang firewall/hotspot isolation.

## Review (Expo Go Remote Update Diagnosis - 2026-04-23)

- Pesan `java.io.IOException: Failed to download remote update` menegaskan bahwa Expo Go gagal mengambil bundle/update dari dev server setelah QR berhasil dibaca.
- Ini berarti kegagalan terjadi sebelum kode aplikasi dijalankan, sehingga akar masalah utamanya ada di koneksi Expo Go ke Metro/tunnel, bukan di komponen React pada project.

## Plan (App Logo Update - 2026-04-23)

- [x] 1. Audit file logo baru dan asset Expo yang sekarang dipakai
- [x] 2. Ganti referensi logo aplikasi ke asset logo UMK baru
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (App Logo Update - 2026-04-23)

- Konfigurasi Expo di `mobile/app.json` sekarang memakai file `assets/images/Logo Universitas Muria Kudus [RiderGalau].png` untuk `icon`, `splash.image`, `android.adaptiveIcon.foregroundImage`, dan `web.favicon`.
- File logo baru valid dan terbaca sebagai PNG berukuran `1920x1440`.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Logo Shadow Removal + Theme-Aware Splash - 2026-04-24)

- [x] 1. Turunkan asset logo baru menjadi file splash dan icon yang lebih tepat pakai
- [x] 2. Hapus shadow dari jalur icon/loading screen agar mengikuti background aplikasi
- [x] 3. Ubah konfigurasi Expo supaya splash native mengikuti mode terang/gelap sistem
- [x] 4. Perbarui screen loading React agar memakai logo baru dan background sesuai tema
- [x] 5. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Logo Shadow Removal + Theme-Aware Splash - 2026-04-24)

- Asset baru diturunkan menjadi `sunan-notifier-mark.png` untuk icon/splash; wordmark penuh tetap direpresentasikan di loading screen React lewat teks `SUNAN Notifier`.
- Konfigurasi Expo sekarang memakai `userInterfaceStyle: automatic`, sehingga splash native dapat mengikuti mode sistem dengan background terang `#f0f4ff` dan gelap `#0b1120`.
- Screen loading React `AppSplashScreen` tidak lagi memakai emoji atau wrapper berbayang; sekarang langsung menampilkan mark logo baru di atas background tema aktif.
- Preferensi tampilan di Settings dinaikkan dari switch gelap/terang menjadi tiga opsi: `Ikuti Sistem`, `Gelap`, dan `Terang`, dengan default store baru `system` agar pengalaman awal konsisten dengan perangkat.
- Verifikasi selesai dengan `npm run typecheck`, `npm run lint`, dan `npx expo config --json` di folder `mobile`.

## Plan (Initial Screen Cleanup - 2026-04-24)

- [x] 1. Audit apakah screen awal yang dikeluhkan berasal dari Expo Go atau komponen app sendiri
- [x] 2. Jika masih ada screen app yang redundant, sederhanakan atau hilangkan agar langsung ke login/loading utama
- [x] 3. Verifikasi hasil dan dokumentasikan batasan bila screen itu milik Expo Go

## Review (Initial Screen Cleanup - 2026-04-24)

- Screen pada screenshot user terkonfirmasi sebagai overlay bundling milik Expo Go, bukan komponen React app. Indikator utamanya adalah progress `Bundling xx%` di header/footer Expo Go.
- Karena itu screen tersebut tidak bisa dihapus dari source project selama testing masih lewat Expo Go; jalur yang benar-benar bisa dihilangkan dari app adalah splash entry React setelah bundle selesai dimuat.
- Route awal `mobile/app/index.tsx` sekarang tidak lagi merender `AppSplashScreen`; app akan langsung redirect ke `login` atau `/(tabs)` setelah status auth siap.
- Native splash di `mobile/app/_layout.tsx` juga ditahan sampai auth selesai resolve (`hydrated && status !== 'loading'`) agar tidak muncul jeda kosong sebelum redirect.
- Verifikasi selesai dengan `npm run typecheck`, `npm run lint`, dan `npx expo config --json` di folder `mobile`.

## Plan (APK Splash Stale Resource Audit - 2026-04-24)

- [x] 1. Audit folder native Android dan resource splash/icon yang benar-benar dipakai saat build APK
- [x] 2. Sinkronkan resource native bila masih membawa asset lama meski `app.json` sudah berubah
- [x] 3. Verifikasi konfigurasi akhir dan dokumentasikan penyebab APK masih menampilkan screen lama

## Review (APK Splash Stale Resource Audit - 2026-04-24)

- Project `mobile` tidak memiliki folder native `android/`, jadi tidak ada resource Android lokal yang stale di repo; EAS build membaca langsung konfigurasi aktif dari `mobile/app.json`.
- Konfigurasi aktif per 24 April 2026 sudah menunjuk ke `sunan-notifier-mark.png` untuk `icon`, `android.adaptiveIcon.foregroundImage`, dan `splash.image`.
- Karena itu, jika APK yang terpasang masih menampilkan screen lama, akar masalah yang paling mungkin bukan file native stale di workspace, melainkan APK dibangun dari snapshot lebih lama atau splash sistem Android/OEM yang memang tetap menampilkan icon/nama app saat startup.
- Pengecekan workspace juga menunjukkan tidak ada artefak `.apk` lokal di folder project, sehingga file yang diinstal user kemungkinan berasal dari hasil build terpisah di luar workspace aktif ini.

## Plan (APK Install Failure Audit - 2026-04-24)

- [x] 1. Audit konfigurasi package/build yang paling sering membuat APK gagal di-install
- [x] 2. Perbaiki mismatch config yang bisa diatasi dari project
- [x] 3. Verifikasi config dan catat kemungkinan blocker yang butuh pesan error install spesifik dari device

## Review (APK Install Failure Audit - 2026-04-24)

- Audit EAS menunjukkan build APK internal memang berasal dari profile `preview`, dan semua build sebelumnya memakai package utama yang sama (`id.umk.sunannotifier`), sehingga bentrok install dengan app lama atau signature berbeda tetap mungkin terjadi di device.
- Solusi yang diterapkan adalah config dinamis baru di `mobile/app.config.js`: build `preview` dan `development` sekarang memakai app identity terpisah `id.umk.sunannotifier.preview` dengan nama app `SUNAN Notifier Preview`.
- Build produksi tetap memakai package utama `id.umk.sunannotifier`, jadi jalur release tidak ikut berubah.
- Verifikasi berhasil: `npx expo config --json` tetap menunjukkan package produksi, sedangkan `EAS_BUILD_PROFILE=preview npx expo config --json` sekarang menunjukkan package preview yang terpisah.
- Verifikasi tambahan `npm run typecheck` dan `npm run lint` juga lulus.

## Plan (Login Logo Branding - 2026-04-24)

- [x] 1. Tambahkan logo aplikasi ke hero halaman login
- [x] 2. Rapikan spacing agar layout tetap seimbang di layar mobile
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Login Logo Branding - 2026-04-24)

- Halaman login sekarang menampilkan mark logo SUNAN Notifier di area hero sebelum judul, memakai asset yang sama dengan splash/icon agar branding konsisten.
- Penempatan logo dibuat ringan tanpa shadow tambahan dan ukuran dijaga tetap proporsional untuk layar mobile.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Login Screen Redesign - 2026-04-24)

- [x] 1. Audit struktur halaman login sekarang terhadap mockup terbaru user
- [x] 2. Ubah layout dan styling login agar lebih clean dan mendekati mockup
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Login Screen Redesign - 2026-04-24)

- Halaman login dirombak menjadi layout yang lebih dekat dengan mockup: background terang, brand block terpusat, wordmark dua warna, dan kartu form putih yang lebih ringan.
- Field NIM dan password sekarang memakai shell berikon sehingga visual lebih mirip desain referensi dan lebih mudah dipindai di layar mobile.
- Banner akun tersimpan tetap dipertahankan, tetapi tampil lebih halus agar tidak merusak komposisi desain utama.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Login Theme Alignment + Larger Logo - 2026-04-24)

- [x] 1. Audit styling login yang masih hardcoded dan ukuran logo saat ini
- [x] 2. Perbesar logo dan ubah login agar mengikuti theme terang/gelap aktif
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Login Theme Alignment + Larger Logo - 2026-04-24)

- Logo di hero login diperbesar dari ukuran sebelumnya agar brand lebih dominan saat screen pertama dibuka.
- Seluruh warna halaman login dipindahkan dari hardcoded color ke `ThemeContext`, sehingga background, card, input, banner akun tersimpan, tombol, dan teks sekarang ikut mode terang/gelap aktif.
- Struktur visual hasil redesign sebelumnya tetap dipertahankan, tetapi sekarang responsif terhadap perubahan theme tanpa membuat versi gelap terlihat seperti layar terang yang ditempel di atas background gelap.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Login Dark Mode Refinement - 2026-04-24)

- [x] 1. Audit titik visual login dark mode yang masih kurang tegas
- [x] 2. Pertegas card, input, hero, dan wordmark khusus untuk mode gelap
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Login Dark Mode Refinement - 2026-04-24)

- Hero login sekarang menjadi panel penuh dengan border/blue tint saat mode gelap aktif, sehingga branding di bagian atas tidak tenggelam di background gelap.
- Logo diperbesar lagi dan wordmark `Notifier` dibuat lebih terang pada dark mode agar fokus visual pertama lebih kuat.
- Card form, suggestion banner, input shell, placeholder, dan tombol login sekarang punya kontras yang lebih tegas khusus dark mode tanpa merusak versi terang.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Login Hero Card Removal - 2026-04-24)

- [x] 1. Hapus panel/card di area logo hero login
- [x] 2. Jaga spacing hero tetap rapi setelah panel dihilangkan
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Login Hero Card Removal - 2026-04-24)

- Panel/card di area logo hero login sudah dihapus, jadi logo dan wordmark sekarang tampil langsung di background halaman tanpa bingkai tambahan.
- Spacing hero tetap dijaga agar branding tidak terlalu mepet ke form sesudah card dihilangkan.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Profile Photo Visibility Audit - 2026-04-24)

- [x] 1. Audit alur data foto profil SUNAN dari auth response ke komponen avatar
- [x] 2. Perbaiki URL atau render avatar jika foto SUNAN gagal tampil meski tersedia
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Profile Photo Visibility Audit - 2026-04-24)

- Akar masalahnya ada pada `userpictureurl` dari SUNAN yang sebelumnya disimpan mentah, padahal file Moodle untuk klien webservice perlu diakses lewat endpoint file yang sesuai token.
- Helper baru `getAuthenticatedMoodleFileUrl()` di `mobile/lib/moodle/client.ts` sekarang menormalkan URL file Moodle ke jalur `/webservice/pluginfile.php` dan menambahkan query `token` bila perlu.
- Auth store menerapkan normalisasi ini saat login baru dan saat session lama di-hydrate, sehingga user yang sudah pernah login tidak wajib login ulang hanya untuk memperbaiki avatar.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Screen Simplification - 2026-04-24)

- [x] 1. Audit ulang struktur settings dan identifikasi titik yang terasa terlalu padat
- [x] 2. Rapikan layout jadi section yang lebih sederhana tanpa mengubah fungsi inti
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Settings Screen Simplification - 2026-04-24)

- Halaman `Settings` dirapikan menjadi alur yang lebih pendek: header ringkas, kartu akun, lalu section inti `Tampilan`, `Notifikasi`, `Sinkronisasi`, `Mata Kuliah Dipantau`, dan aksi bawah.
- Opsi yang sebelumnya tersebar dalam banyak card besar kini dipadatkan menjadi row setting yang lebih cepat dipindai, terutama untuk toggle notifikasi dan pilihan tema.
- Pengaturan `Frekuensi cek` dan `Jam tidak ganggu` sekarang dikelompokkan dalam satu section `Sinkronisasi`, sehingga user tidak perlu membaca dua blok terpisah untuk satu konteks yang sama.
- Section mata kuliah dipantau tetap mempertahankan fungsi lama, tetapi visual seleksinya dibuat lebih ringan dengan row check yang lebih jelas.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Copy Trim + Course Scope Drafting - 2026-04-24)

- [x] 1. Pangkas copy settings yang masih terasa berlebihan
- [x] 2. Ubah pilihan `Mata Kuliah Dipantau` menjadi draft lokal agar tap tidak langsung memicu reload data global
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Settings Copy Trim + Course Scope Drafting - 2026-04-24)

- Copy di halaman `Settings` dipangkas lagi: header cukup `Pengaturan`, hint akun dihapus, deskripsi per-toggle notifikasi dihilangkan, dan section dibuat lebih hemat teks.
- Akar masalah reload ada pada `Mata Kuliah Dipantau` yang sebelumnya langsung menulis `monitoredCourseIds` ke store global; karena store itu dipakai query layer dan `InitialDataGate`, tiap tap memicu siklus data ulang.
- Pilihan mata kuliah sekarang disimpan dulu sebagai draft lokal di screen `Settings`, lalu baru diterapkan ke store saat tombol `Simpan Pengaturan` ditekan.
- Dengan pola ini, tap checklist tidak lagi terasa seperti reload screen; reload data baru terjadi saat user memang sengaja menyimpan scope matkul yang baru.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Title Removal + Icon Pass - 2026-04-24)

- [x] 1. Hapus judul `Pengaturan` yang masih terasa redundant di screen settings
- [x] 2. Tambahkan ikon pada section dan aksi settings yang memang butuh affordance visual
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Settings Title Removal + Icon Pass - 2026-04-24)

- Judul atas `Pengaturan` dihapus agar screen langsung mulai dari kartu akun tanpa header yang redundant.
- Section `Tampilan`, `Notifikasi`, `Sinkronisasi`, dan `Mata Kuliah Dipantau` sekarang memakai ikon yang relevan agar fungsi tiap blok lebih cepat dikenali tanpa perlu menambah copy.
- Row notifikasi, opsi tema, label sinkronisasi, dan tombol aksi `Simpan` / `Keluar` juga diberi ikon untuk memperjelas affordance visual.
- Seleksi `Mata Kuliah Dipantau` ikut dirapikan supaya memakai state draft lokal sebagai sumber highlight, jadi tampilan checklist tetap konsisten sebelum user menekan `Simpan`.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Cross-Screen Icon Pass - 2026-04-24)

- [x] 1. Audit screen utama dan komponen shared untuk menentukan titik ikon yang benar-benar membantu
- [x] 2. Tambahkan dukungan ikon pada komponen shared yang dipakai lintas halaman
- [x] 3. Terapkan ikon yang konsisten di Dashboard, Tugas, Absensi, Kalender, dan detail tugas
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Cross-Screen Icon Pass - 2026-04-24)

- Komponen shared `SectionCard`, `EmptyState`, `KpiGrid`, `TaskCard`, dan `AttendanceCard` sekarang mendukung ikon berbasis `FontAwesome`, sehingga bahasa visual baru tersebar konsisten ke banyak screen tanpa edit manual yang terpisah-pisah.
- `Dashboard` kini memakai ikon pada badge aktif, KPI, section absensi/deadline, dan empty state.
- `Tugas` dan `Absensi` ikut mendapatkan ikon melalui card dan empty state yang sudah diperbarui.
- `Kalender` dirapikan dengan header kartu kalender berikon, section deadline/absensi/event yang kini memakai `SectionCard`, dan item event berikon.
- Header tab utama sekarang juga memakai judul berikon, dan title `Settings` diselaraskan menjadi `Pengaturan`.
- Screen detail tugas ikut diberi ikon pada activity badge, metadata waktu, label section, empty state, dan tombol buka ke SUNAN.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Nearest Deadline Ordering - 2026-04-24)

- [x] 1. Audit sorting tugas dan absensi yang sekarang masih tidak memakai urutan deadline/waktu terdekat
- [x] 2. Ubah util sorting global agar tugas dan absensi konsisten memakai urutan waktu terdekat
- [x] 3. Rapikan copy UI yang masih menyebut urutan lama
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Nearest Deadline Ordering - 2026-04-24)

- Akar masalahnya ada pada util sorting global: tugas masih diurutkan berdasarkan deadline paling jauh (`descending`), sedangkan absensi masih mengurutkan per status lalu sesi terbaru, bukan berdasarkan waktu terdekat.
- `sortAssignmentsByDeadline()` sekarang mengurutkan tugas berdasarkan deadline yang paling dekat ke waktu sekarang, menaruh tugas tanpa deadline di belakang, dan menurunkan item `submitted` di bawah tugas yang masih perlu aksi.
- `sortAttendanceSessions()` sekarang mengurutkan absensi berdasarkan waktu relevan terdekat: prioritas ke `closesAt` jika ada, lalu `startsAt`, sambil tetap menaruh item `closed` di bagian akhir.
- Copy dashboard juga dirapikan dari “deadline terbaru” menjadi “deadline paling dekat” agar sesuai perilaku baru.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Save Success Alert - 2026-04-24)

- [x] 1. Audit feedback yang sekarang muncul setelah `Simpan Pengaturan`
- [x] 2. Tambahkan peringatan sukses yang jelas saat save berhasil
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Settings Save Success Alert - 2026-04-24)

- Feedback lama setelah menekan `Simpan Pengaturan` hanya berupa status banner di dalam screen, sehingga mudah terlewat.
- Aksi save sekarang juga memunculkan alert native `Tersimpan` setelah proses simpan benar-benar berhasil, jadi user mendapat konfirmasi yang lebih jelas dan langsung terlihat.
- Banner status sukses tetap dipertahankan sebagai indikator visual pasca-save di halaman.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Draft Save Consistency - 2026-04-24)

- [x] 1. Audit kenapa `Simpan Pengaturan` tidak memunculkan alert dan tidak terasa menyimpan perubahan
- [x] 2. Ubah settings screen agar semua field memakai draft lokal dan benar-benar commit saat tombol `Simpan` ditekan
- [x] 3. Tambahkan alert `Tidak ada perubahan` saat user menekan simpan tanpa perubahan
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Settings Draft Save Consistency - 2026-04-24)

- Akar masalahnya ada pada flow settings yang tidak konsisten: sebagian field langsung menulis ke store saat disentuh, sebagian lain memakai draft, dan tombol `Simpan` malah `return` diam-diam saat `appUserId` kosong.
- Screen `Settings` sekarang memakai draft lokal untuk tema, notifikasi, interval cek, jam tidak ganggu, dan mata kuliah dipantau; tombol `Simpan` menjadi titik commit tunggal ke store lokal.
- Jika tidak ada perubahan, app sekarang menampilkan alert `Tidak ada perubahan` daripada diam.
- Jika user belum punya `appUserId`, perubahan tetap disimpan lokal di device; sinkron ke server hanya dijalankan bila identitas Supabase tersedia.
- Jika sinkron server gagal, app memberi alert bahwa pengaturan lokal tetap tersimpan tetapi sinkron server gagal.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Themed Settings Alert - 2026-04-24)

- [x] 1. Audit jalur alert di settings dan pastikan native alert diganti ke komponen yang bisa di-theme
- [x] 2. Buat komponen alert/dialog ringan yang mengikuti desain dan mode terang/gelap aplikasi
- [x] 3. Pasang alert custom untuk kasus berhasil, tidak ada perubahan, dan sinkron server gagal
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Themed Settings Alert - 2026-04-24)

- Alert native di settings sudah diganti ke komponen in-app baru `AppAlertDialog`, sehingga feedback simpan sekarang bisa mengikuti bahasa visual aplikasi.
- Dialog baru memakai warna, border, shadow, dan ikon yang konsisten dengan design system, serta otomatis ikut mode terang/gelap aktif.
- `Settings` sekarang memakai dialog ini untuk tiga kasus utama: berhasil disimpan, tidak ada perubahan, dan tersimpan lokal tetapi sinkron server gagal.
- Status banner di bawah tombol tetap dipertahankan sebagai konteks tambahan, tetapi dialog menjadi feedback utama yang langsung terlihat user.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Collapsible Sections - 2026-04-24)

- [x] 1. Audit section panjang di halaman settings yang membuat tombol simpan turun terlalu jauh
- [x] 2. Ubah `Notifikasi` dan `Mata Kuliah Dipantau` menjadi section collapsible/dropdown dengan ringkasan status
- [x] 3. Pastikan tombol `Simpan Pengaturan` lebih cepat terlihat tanpa mengorbankan flow draft save
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Settings Collapsible Sections - 2026-04-24)

- Akar masalahnya bukan pada tombol `Simpan`, tetapi pada dua section panjang yang selalu terbuka, sehingga CTA utama terdorong terlalu ke bawah.
- `Notifikasi` dan `Mata Kuliah Dipantau` sekarang menjadi section collapsible dengan header yang tetap menampilkan ringkasan status, jadi user bisa melihat konteks tanpa membuka seluruh isi.
- Default state kedua section dibuat tertutup agar tombol `Simpan Pengaturan` lebih cepat terlihat saat screen pertama kali dibuka.
- Flow draft save tetap utuh: perubahan baru benar-benar disimpan saat tombol `Simpan Pengaturan` ditekan, tanpa memicu reload saat user baru memilih opsi.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Accordion Sections - 2026-04-24)

- [x] 1. Ubah section panjang di settings agar memakai pola accordion satu-terbuka
- [x] 2. Pastikan `Notifikasi` dan `Mata Kuliah Dipantau` saling menutup saat salah satunya dibuka
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Settings Accordion Sections - 2026-04-24)

- Section `Notifikasi` dan `Mata Kuliah Dipantau` sekarang tidak lagi bisa sama-sama terbuka dalam waktu yang sama.
- Saat user membuka salah satu section, section panjang lainnya otomatis menutup, sehingga area bawah layar dan tombol `Simpan Pengaturan` tetap lebih cepat kembali terlihat.
- Perilaku collapse lama tetap dipertahankan: section yang sedang terbuka masih bisa ditutup lagi dengan tap kedua.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Section Order - 2026-04-24)

- [x] 1. Ubah urutan section settings agar `Sinkronisasi` tampil sebelum `Notifikasi`
- [x] 2. Pastikan perubahan tidak mengganggu flow accordion dan save
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Settings Section Order - 2026-04-24)

- Card `Sinkronisasi` sekarang dipindah ke atas `Notifikasi`, sehingga pengaturan interval cek dan jam tidak ganggu muncul lebih cepat sebelum section accordion opsional.
- Flow accordion untuk `Notifikasi` dan `Mata Kuliah Dipantau` tetap utuh, karena perubahan hanya menggeser urutan render section.
- Flow draft save dan tombol `Simpan Pengaturan` tidak berubah.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Full Accordion - 2026-04-24)

- [x] 1. Ubah `Tampilan` dan `Sinkronisasi` agar ikut memakai pola collapsible seperti `Notifikasi`
- [x] 2. Rapikan state section settings menjadi satu accordion state agar hanya satu section utama terbuka pada satu waktu
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Settings Full Accordion - 2026-04-24)

- `Tampilan` dan `Sinkronisasi` sekarang memakai pola collapsible yang sama seperti `Notifikasi`, jadi semua section utama di settings punya perilaku yang konsisten.
- State section dirapikan dari beberapa boolean terpisah menjadi satu `expandedSection`, sehingga hanya satu section utama yang bisa terbuka pada satu waktu dan logic accordion lebih sederhana.
- Header tiap section sekarang tetap menampilkan ringkasan singkat, misalnya mode tampilan aktif atau interval sinkronisasi + jam tidak ganggu, jadi konteks tetap terlihat saat section tertutup.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Smooth Accordion Animation - 2026-04-24)

- [x] 1. Tambahkan animasi transisi yang halus saat section settings dibuka atau ditutup
- [x] 2. Pastikan animasi tetap aman di Android dan tidak merusak flow accordion yang sudah ada
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Settings Smooth Accordion Animation - 2026-04-24)

- Accordion settings sekarang memakai `LayoutAnimation` saat state section berubah, sehingga tinggi card dan perpindahan layout tidak lagi terasa patah saat buka-tutup.
- Chevron header ikut dianimasikan dengan `Animated`, dan isi section diberi fade-in plus sedikit translate supaya transisi terasa lebih halus saat section dibuka.
- Aktivasi `LayoutAnimation` untuk Android ditambahkan secara eksplisit agar perilaku animasi tetap bekerja aman di Expo/React Native Android.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Logout Success Alert - 2026-04-24)

- [x] 1. Tambahkan notice logout sukses yang tetap bisa terlihat setelah redirect ke login
- [x] 2. Tampilkan alert logout sukses dengan komponen dialog yang konsisten dengan desain aplikasi
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Logout Success Alert - 2026-04-24)

- Akar masalahnya: logout langsung mengubah status auth jadi `unauthenticated`, sehingga screen settings hilang sebelum alert lokal sempat terlihat.
- Flow sekarang memakai `logoutNotice` sementara di auth store; setelah logout sukses, user diarahkan ke login dan dialog sukses ditampilkan di screen tujuan yang masih aktif.
- Dialog logout memakai `AppAlertDialog`, jadi tampilannya tetap konsisten dengan desain aplikasi dan mode terang/gelap.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Monitored Course Scope Fix - 2026-04-24)

- [x] 1. Pisahkan `Mata Kuliah Dipantau` dari scope data UI agar tidak lagi mengosongkan dashboard/tugas/absensi saat satu course dipilih
- [x] 2. Batasi monitored course hanya untuk jalur notifikasi/monitoring yang memang sesuai namanya
- [x] 3. Rapikan copy UI yang masih menyebut data layar utama dibatasi oleh matkul dipantau
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Monitored Course Scope Fix - 2026-04-24)

- Akar masalahnya ada pada arsitektur filter: `Mata Kuliah Dipantau` dipakai untuk membatasi seluruh query dashboard, tugas, absensi, kalender, dan preload awal. Saat user memilih course seperti PKL yang belum punya data tugas/absensi yang didukung, seluruh app terlihat kosong.
- Scope monitored course sekarang dipisahkan dari data UI. Query layar utama dan preload awal kembali memuat seluruh course aktif user, sehingga memilih satu matkul dipantau tidak lagi menghilangkan isi app.
- Pilihan `Mata Kuliah Dipantau` sekarang dipakai pada jalur yang sesuai namanya, yaitu notification sync tugas dan absensi. Jadi monitoring tetap menghormati pilihan course tanpa memblokir tampilan data utama.
- Copy dashboard yang sebelumnya menyiratkan data utama dibatasi oleh matkul dipantau juga sudah dirapikan agar sesuai perilaku baru.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Auto Dismiss Save Alert - 2026-04-24)

- [x] 1. Tambahkan dukungan auto-dismiss opsional pada komponen alert aplikasi
- [x] 2. Terapkan auto-dismiss hanya pada alert sukses `Tersimpan` di settings
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Auto Dismiss Save Alert - 2026-04-24)

- Komponen `AppAlertDialog` sekarang mendukung `autoCloseMs`, jadi alert tertentu bisa hilang sendiri tanpa menambah komponen toast terpisah.
- Auto-dismiss hanya diterapkan pada alert sukses `Tersimpan` di settings, sehingga feedback save terasa ringan; alert lain seperti `Tidak ada perubahan`, sinkron gagal, dan logout tetap manual agar tidak mudah terlewat.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Single Save Alert Only - 2026-04-24)

- [x] 1. Hilangkan auto-dismiss pada alert simpan di settings
- [x] 2. Hapus banner status di bawah tombol `Simpan Pengaturan` agar feedback save tinggal satu popup
- [x] 3. Rapikan state save yang tidak lagi dipakai dan verifikasi `npm run typecheck` serta `npm run lint`

## Review (Single Save Alert Only - 2026-04-24)

- Alert sukses `Tersimpan` di settings kembali menjadi dialog manual biasa, jadi tidak hilang sendiri sebelum user sempat membacanya.
- Banner status di bawah tombol `Simpan Pengaturan` sudah dihapus, sehingga setelah save sekarang hanya ada satu feedback utama berupa popup alert.
- State `syncState` juga dirapikan kembali karena status `ok/partial` tidak lagi dipakai untuk banner lokal.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Monitored Course Help Icon - 2026-04-24)

- [x] 1. Tambahkan ikon bantuan kecil pada header `Mata Kuliah Dipantau`
- [x] 2. Tampilkan dialog penjelasan saat ikon ditekan tanpa mengganggu accordion section
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Monitored Course Help Icon - 2026-04-24)

- Section `Mata Kuliah Dipantau` sekarang punya ikon tanda tanya kecil di header sebagai affordance bantuan inline.
- Saat ikon ditekan, app menampilkan dialog info yang menjelaskan bahwa setting ini dipakai untuk monitoring/notifikasi, bukan untuk menyaring data utama layar.
- Klik pada ikon bantuan tidak ikut memicu buka-tutup accordion, karena event ditekan dihentikan di level ikon.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Help Icon Click Fix - 2026-04-24)

- [x] 1. Pisahkan area klik ikon bantuan dari area klik accordion pada header section
- [x] 2. Rapikan posisi ikon bantuan agar lebih natural di sisi kanan header
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Help Icon Click Fix - 2026-04-24)

- Akar masalahnya ada pada struktur header: ikon bantuan diletakkan di dalam `Pressable` accordion, sehingga tap user lebih mudah tertangkap sebagai aksi buka-tutup section daripada aksi bantuan.
- Header collapsible sekarang dipisah menjadi area klik utama untuk toggle, area summary, dan area aksi kecil di sisi kanan. Dengan itu ikon bantuan punya target sentuh sendiri dan tidak bentrok dengan accordion.
- Posisi ikon bantuan juga dipindah ke cluster aksi kanan dekat chevron, sehingga tampilannya lebih rapi dan lebih mudah dipindai daripada menempel langsung ke teks judul.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Stable Dashboard First Paint - 2026-04-24)

- [x] 1. Tambahkan penanda bahwa status tugas sudah final atau masih hasil preload sementara
- [x] 2. Cegah dashboard dan daftar tugas menghitung KPI/status dari data tugas yang belum stabil
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Stable Dashboard First Paint - 2026-04-24)

- Akar masalahnya ada pada preload awal: `InitialDataGate` menulis daftar tugas mentah ke cache lebih dulu, lalu background hydration memperbarui status submit belakangan. Dashboard sempat menghitung KPI dan deadline dari data sementara itu, sehingga angka terlihat salah lalu berubah sendiri.
- `AssignmentItem` sekarang punya penanda `statusResolved`, dengan nilai `false` pada hasil fetch awal dan `true` setelah hydration status submit selesai atau fallback final sudah ditetapkan.
- Dashboard dan screen `Tugas` sekarang mengecek kestabilan status tugas dulu. Saat status masih diselaraskan, UI menampilkan placeholder/loading ringan, bukan angka KPI dan ringkasan tugas yang salah.
- Fix ini menjaga boot tetap relatif cepat karena app tidak kembali menunggu hydration berat di splash global, tetapi first paint dashboard tidak lagi menampilkan data tugas yang keliru.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Dashboard Dark Hero Card - 2026-04-24)

- [x] 1. Rapikan komposisi hero card `SUNAN Notifier` di dashboard agar lebih clean dan seimbang
- [x] 2. Ubah hero card ke palet dark yang tetap dipakai walau app sedang di mode terang
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Dashboard Dark Hero Card - 2026-04-24)

- Hero card `SUNAN Notifier` di dashboard sekarang memakai palet dark lokal yang selalu sama, jadi tampilannya tetap tegas meski app sedang di mode terang.
- Struktur card dirapikan dengan hierarki yang lebih bersih: badge status, label konteks `Dashboard akademik UMK`, avatar pengguna, lalu blok judul/greeting/subtitle yang lebih ringkas.
- Greeting dipendekkan ke nama depan agar hero tidak terasa penuh, dan avatar fallback ikut memakai aksen biru yang sama dengan card supaya branding lebih konsisten.
- Perubahan sengaja dibatasi ke hero dashboard saja; theme global, KPI grid, dan section lain tetap mengikuti mode terang/gelap normal.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Settings Dark Account Card - 2026-04-24)

- [x] 1. Samakan gaya visual card akun SUNAN di settings dengan hero dark pada dashboard
- [x] 2. Pertahankan perubahan secara lokal hanya pada card akun agar theme global settings tidak ikut berubah
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Settings Dark Account Card - 2026-04-24)

- Card akun SUNAN di halaman settings sekarang memakai palet dark lokal yang sama arahnya dengan hero dashboard, jadi branding utama terasa konsisten walau halaman settings sedang mode terang.
- Struktur card dirapikan menjadi blok yang lebih clean: badge `AKUN SUNAN`, label konteks `Portal akademik UMK`, avatar di sisi kanan, lalu nama akun dan NIM di bagian bawah.
- Glow halus dan border biru tetap dipakai, tetapi perubahan dibatasi hanya pada card akun. Section settings lain tetap mengikuti theme terang/gelap normal.
- Avatar fallback ikut memakai aksen biru yang sama agar tampilan tetap konsisten saat foto profil tidak tersedia.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Local Android Build Path - 2026-04-24)

- [x] 1. Audit konfigurasi Expo/Android project untuk menentukan jalur build lokal tanpa EAS cloud
- [x] 2. Tambahkan script dan panduan repo untuk prebuild Android serta build lokal APK/AAB
- [x] 3. Verifikasi konfigurasi yang disentuh dan catat batasan environment saat ini

## Review (Local Android Build Path - 2026-04-24)

- Project sekarang punya script khusus untuk jalur build lokal Android: prebuild biasa, prebuild `preview`, prebuild `production`, lalu build lokal APK/AAB via Gradle.
- Dokumen operasional baru `tasks/local-android-build.md` merangkum jalur tercepat untuk menghasilkan APK installable internal tanpa Expo Go dan tanpa kuota EAS cloud.
- README root juga sudah ditambahkan pointer ke panduan build lokal agar jalur ini tidak tersembunyi.
- Saya validasi template native hasil `expo prebuild` pada project ini: `android/app/build.gradle` saat ini masih menandatangani `release` dengan debug keystore, sehingga `assembleRelease` cukup untuk APK internal/testing. Untuk Play Store, signing release tetap harus diganti ke upload keystore milik sendiri.
- Verifikasi perubahan repo selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.
- Build APK penuh belum bisa saya eksekusi di mesin kerja saat ini karena toolchain Android lokal belum tersedia di PATH (`java`, `adb`, dan emulator belum terpasang/terdeteksi).

## Plan (APK Login Non-JSON Fix - 2026-04-25)

- [x] 1. Audit kenapa login di APK menerima respons HTML/non-JSON dari endpoint token SUNAN
- [x] 2. Perbaiki request token Moodle agar lebih kompatibel untuk build APK dan rapikan pesan error login
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (APK Login Non-JSON Fix - 2026-04-25)

- Error login di APK berasal dari endpoint `login/token.php` yang mengembalikan halaman web/HTML, bukan payload token JSON yang diharapkan app.
- Jalur login token sekarang tidak lagi memakai query GET; request diubah menjadi `POST` `application/x-www-form-urlencoded` dengan header `Accept: application/json`, sehingga lebih aman dan lebih kompatibel untuk build APK release yang bisa melewati gateway atau WAF berbeda.
- Parser respons juga dirapikan: jika server membalas HTML, app sekarang membedakan kasus itu dari sekadar JSON rusak, jadi diagnosis login lebih jelas.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (SUNAN Maintenance Alert - 2026-04-25)

- [x] 1. Tambahkan deteksi maintenance SUNAN pada jalur error login
- [x] 2. Tampilkan alert maintenance khusus di layar login saat server membalas halaman maintenance
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (SUNAN Maintenance Alert - 2026-04-25)

- Jalur parser respons login sekarang mendeteksi halaman maintenance HTML dari SUNAN, bukan hanya kasus umum “non-JSON”.
- Jika respons login mengandung indikasi maintenance, app memberi code error khusus dan pesan user-facing yang lebih tepat: SUNAN sedang maintenance dan perlu dicoba lagi beberapa menit kemudian.
- Layar login sekarang menampilkan `AppAlertDialog` warning khusus saat maintenance terdeteksi, jadi user tidak hanya melihat teks error kecil di bawah form.
- Dialog logout tetap dipertahankan dan tidak bentrok dengan dialog maintenance karena state visibilitasnya dipisah.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Dynamic Footer + KPI Icon Pass - 2026-04-25)

- [x] 1. Ubah footer/tab bar jadi lebih dinamis dan mendekati gaya floating pada mockup
- [x] 2. Perbesar dan rapikan ikon pada kartu statistik dashboard agar lebih dominan seperti referensi
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Dynamic Footer + KPI Icon Pass - 2026-04-25)

- Footer/tab bar sekarang memakai gaya floating card dengan radius besar, shadow, dan state aktif yang lebih hidup. Item aktif punya bubble/icon plate tersendiri, sedangkan item nonaktif tetap ringan seperti pada mockup.
- Komponen shared `KpiGrid` dirombak dari layout ikon kecil di header menjadi tile besar di sisi kiri, sehingga kartu statistik dashboard terlihat lebih tegas dan mudah dipindai.
- Dashboard ikut disesuaikan agar ikon statistik memakai warna semantic yang lebih dekat ke contoh: biru untuk matkul aktif, hijau untuk belum dikerjakan/sudah submit, dan merah untuk overdue.
- Perubahan dibatasi pada komponen tab bar dan komponen KPI shared, jadi efeknya konsisten tetapi tidak mengganggu flow screen lain.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Footer Icon Rebalance + KPI Scale Down - 2026-04-25)

- [x] 1. Rapikan ulang proporsi footer agar ikon active/inactive lebih pas dan label tidak terasa berat
- [x] 2. Kecilkan kembali ukuran ikon statistik dashboard tanpa menghilangkan hierarki visual
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Footer Icon Rebalance + KPI Scale Down - 2026-04-25)

- Footer floating sekarang dibuat lebih ringan: tinggi bar diturunkan, active shell dan active bubble diperkecil, serta label ikut dikecilkan agar proporsinya tidak menekan konten layar.
- Ikon tab juga disesuaikan agar lebih cocok dengan fungsi masing-masing: `list-alt` untuk tugas, `calendar-o` untuk kalender, dan `gear` untuk settings.
- Ikon statistik dashboard diperkecil lagi dengan tile kiri yang tetap terbaca jelas, tetapi tidak lagi terasa terlalu dominan dibanding angka KPI.
- Perubahan tetap dibatasi pada `Tabs` layout dan komponen shared `KpiGrid`, jadi konsistensi screen lain tetap terjaga.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Footer Centered Active Pill - 2026-04-25)

- [x] 1. Ubah active tab agar duduk di dalam footer sebagai pill terpusat, bukan terlihat mengambang di atas bar
- [x] 2. Rapikan alignment icon dan label semua tab agar mengikuti referensi visual baru
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Footer Centered Active Pill - 2026-04-25)

- Active tab sekarang tidak lagi memakai bubble ikon yang terasa naik ke atas footer. Seluruh item aktif diubah menjadi pill utuh yang berada di tengah bar, lebih dekat ke referensi yang Anda kirim.
- Alignment icon dan label semua tab dirapikan supaya garis tengahnya konsisten dan tiap item terasa duduk di dalam footer, bukan menempel ke tepi atas.
- Perubahan dibatasi pada komponen tab bar shared, jadi screen lain tidak ikut berubah.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Custom Floating Footer Dock - 2026-04-25)

- [x] 1. Ganti styling footer default berbasis `tabBarIcon` menjadi custom tab bar agar dock benar-benar floating
- [x] 2. Rapikan state aktif, ukuran label, dan lebar item supaya tidak pecah dan lebih dekat ke referensi
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Custom Floating Footer Dock - 2026-04-25)

- Footer tidak lagi dipaksakan lewat `tabBarIcon` bawaan. Sekarang navigator tabs memakai custom `FloatingTabBar`, jadi bentuk dock, shadow, bubble aktif, dan lebar item bisa diatur penuh sebagai satu komponen yang rapi.
- Label tab sekarang dipaksa satu baris dengan `numberOfLines={1}` dan slot item yang lebih stabil, sehingga teks seperti `Dashboard`, `Absensi`, dan `Kalender` tidak lagi pecah ke dua baris seperti sebelumnya.
- State aktif diubah menjadi bubble bulat yang duduk di dalam dock putih dengan shadow sendiri, sementara dock luar tetap punya margin dan elevasi yang cukup sehingga terasa mengambang, bukan sekadar bar biasa dengan ikon yang dibesarkan.
- Header screen tetap tidak berubah; perubahan dibatasi pada komponen footer shared dan wiring tabs layout agar risiko regresi layar lain tetap rendah.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Transparent Footer Background - 2026-04-25)

- [x] 1. Audit implementasi `FloatingTabBar` saat ini dan tentukan area background wrapper yang perlu dibuat transparan
- [x] 2. Sesuaikan komponen/footer styles agar hanya dock yang terlihat mengambang di atas konten
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Transparent Footer Background - 2026-04-25)

- Panel putih besar di belakang footer dihapus. `FloatingTabBar` sekarang hanya mempertahankan layout dock sebagai container transparan, jadi visual yang terlihat tinggal item footer dan bubble aktifnya.
- Dengan background dock dibuat transparan, footer sekarang terasa lebih langsung melayang di atas card/konten halaman, bukan seperti kartu putih besar yang memutus layar bagian bawah.
- Perubahan dibatasi pada style visual footer; struktur navigasi tabs, label, dan interaksi tab tidak ikut diubah lagi.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Floating Dock Without Red Wrapper - 2026-04-25)

- [x] 1. Audit struktur wrapper dan dock pada `FloatingTabBar` untuk membedakan area merah vs area hitam
- [x] 2. Pulihkan surface dock utama dan ubah wrapper agar tidak mengambil blok layout besar
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Floating Dock Without Red Wrapper - 2026-04-25)

- Dock putih rounded utama dipulihkan kembali sebagai surface footer yang terlihat. Jadi visual utama yang Anda tandai hitam tetap ada.
- Wrapper luar sekarang diposisikan `absolute` di bawah layar dan tetap transparan, sehingga area kosong besar yang Anda tandai merah tidak lagi menjadi blok layout tersendiri yang memutus konten halaman.
- Fokus perubahan hanya pada hubungan wrapper dan dock; item tab, bubble aktif, dan perilaku navigasi tidak ikut dirombak lagi.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Smaller + Rounder Floating Dock - 2026-04-25)

- [x] 1. Audit proporsi dock/footer saat ini untuk menentukan ukuran dan radius yang perlu diperkecil/diperbesar
- [x] 2. Sesuaikan style `FloatingTabBar` agar dock lebih rounded dan lebih kecil
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Smaller + Rounder Floating Dock - 2026-04-25)

- Dock footer diperkecil secara menyeluruh: tinggi, padding, slot idle, dan bubble aktif semuanya diturunkan sedikit supaya footer tidak terasa terlalu besar di bagian bawah layar.
- Radius dock dinaikkan agar siluetnya lebih membulat dan lebih dekat ke bentuk capsule/floating dock yang Anda inginkan.
- Ikon dan label tab ikut dikecilkan sedikit agar proporsi antar elemen tetap seimbang setelah tinggi dock diturunkan.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Smaller Active Bubble Only - 2026-04-25)

- [x] 1. Audit proporsi bubble aktif saat ini tanpa mengubah ukuran dock utama
- [x] 2. Kecilkan bubble aktif dan elemen di dalamnya secara halus
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Smaller Active Bubble Only - 2026-04-25)

- Bubble aktif diperkecil lagi tanpa mengubah ukuran dock utama, jadi struktur footer tetap stabil tetapi state aktifnya tidak terlalu mendominasi.
- Ukuran ikon aktif, padding bubble, dan bayangannya ikut diturunkan sedikit supaya proporsinya tetap konsisten setelah diameter bubble dikecilkan.
- Perubahan sengaja dibatasi hanya pada style `tabItemFocused`, sehingga tab idle dan bentuk dock utama tetap sama seperti iterasi sebelumnya.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Rounded-Square Active Bubble - 2026-04-25)

- [x] 1. Audit style bubble aktif saat ini di `FloatingTabBar`
- [x] 2. Ubah bubble aktif menjadi lebih square tanpa mengganggu dock utama
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Rounded-Square Active Bubble - 2026-04-25)

- Bubble aktif tidak lagi memakai radius penuh/circle. Radius-nya diturunkan ke bentuk rounded-square, sehingga tampilannya lebih kotak tetapi masih lembut dan sejalan dengan dock utama.
- Perubahan dibatasi hanya pada `borderRadius` bubble aktif, jadi ukuran dock, slot idle, dan alignment footer tetap sama seperti iterasi sebelumnya.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Narrower Floating Dock Width - 2026-04-25)

- [x] 1. Audit wrapper footer saat ini untuk menentukan titik pengurangan lebar dock
- [x] 2. Kecilkan lebar tab bar lewat style container `FloatingTabBar`
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Narrower Floating Dock Width - 2026-04-25)

- Lebar dock diperkecil dari wrapper luar dengan menambah `paddingHorizontal` pada `shell`, sehingga bentuk dock dan jarak antar-tab di dalamnya tetap aman.
- Perubahan ini sengaja tidak menyentuh ukuran bubble aktif, ukuran tab idle, atau proporsi konten di dalam dock. Jadi footprint horizontal mengecil tanpa membuka regresi alignment baru.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Smaller Vertical Footer Footprint - 2026-04-25)

- [x] 1. Audit style footer saat ini untuk memisahkan ukuran horizontal vs vertikal yang perlu dikoreksi
- [x] 2. Pulihkan lebar wrapper dan kecilkan tinggi dock/bubble secara vertikal di `FloatingTabBar`
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review dan lesson koreksi

## Review (Smaller Vertical Footer Footprint - 2026-04-25)

- Lebar dock dikembalikan ke proporsi sebelumnya, jadi footer tidak lagi menyempit ke samping.
- Footprint vertikal yang diperkecil: tinggi dock, padding vertikal dock, tinggi slot idle, tinggi bubble aktif, dan line-height label. Jadi footer sekarang lebih tipis dari atas ke bawah tanpa mengubah struktur horizontalnya.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (More Square Footer Tabs - 2026-04-25)

- [x] 1. Audit radius dock dan bubble aktif saat ini di `FloatingTabBar`
- [x] 2. Sesuaikan radius footer agar tab terasa lebih square tanpa merusak layout
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review dan lesson koreksi

## Review (More Square Footer Tabs - 2026-04-25)

- Radius dock footer diturunkan dari bentuk capsule yang sangat bulat ke bentuk rounded-rectangle yang lebih square.
- Bubble aktif juga ikut dibuat lebih square dengan menurunkan radius-nya, tetapi ukuran dan posisi bubble tidak diubah lagi agar layout footer tetap stabil.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Swipe Tabs + Smooth Transition - 2026-04-25)

- [x] 1. Audit dependensi gesture/animation dan struktur screen tab untuk menentukan jalur swipe yang aman
- [x] 2. Buat wrapper shared untuk swipe kiri/kanan antar-tab dengan animasi transisi yang halus
- [x] 3. Pasang wrapper pada screen tab utama dan beri guard agar tidak bentrok dengan scroll/filter horizontal
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`, lalu catat review hasilnya

## Review (Swipe Tabs + Smooth Transition - 2026-04-25)

- Wrapper shared baru `SwipeableTabScreen` menangani swipe kiri/kanan antar-tab dengan `PanResponder` dan `Animated`, jadi transisi terasa halus tanpa menambah dependensi gesture baru ke project.
- Navigasi swipe memakai urutan tab tetap (`Dashboard -> Tugas -> Absensi -> Kalender -> Settings`) dan menyimpan arah transisi sementara agar screen tujuan bisa masuk dengan animasi yang konsisten setelah navigasi terjadi.
- Screen `Tugas` dan `Absensi` diberi `gestureExclusionTop` di area filter horizontal, sehingga swipe halaman tidak memakan gesture untuk menggeser chip filter.
- Wrapper dipasang pada semua tab utama termasuk state loading/error, jadi gesture antar-tab tetap konsisten di mayoritas kondisi screen.
- Verifikasi selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Native Swipe Tabs Correction - 2026-04-25)

- [x] 1. Ganti navigator `Tabs` lama menjadi Expo Router material top tabs yang memakai native pager sebagai sumber swipe utama
- [x] 2. Adaptasi `FloatingTabBar` agar tetap jadi footer floating visual yang sama pada navigator baru
- [x] 3. Tambahkan `TabSwipeContext` untuk lock/unlock swipe saat `FilterChips` digeser horizontal
- [x] 4. Hapus wrapper `SwipeableTabScreen` dan util swipe screen-level dari semua tab utama
- [x] 5. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Native Swipe Tabs Correction - 2026-04-25)

- Akar masalah keluhan user valid: swipe screen-level berbasis `PanResponder` kalah negosiasi gesture dengan `ScrollView`, jadi walau animasi wrapper benar, perpindahan tab tetap terasa gagal atau tidak konsisten.
- Navigator `/(tabs)` sekarang memakai Expo Router `withLayoutContext` di atas `createMaterialTopTabNavigator`, sehingga swipe kiri/kanan ditangani native pager milik navigator, bukan wrapper buatan di dalam screen.
- Footer floating tetap dipertahankan lewat `FloatingTabBar` sebagai custom tab bar; jadi desain dock, bubble aktif, dan tap navigation tetap sejalur dengan iterasi visual terakhir.
- `FilterChips` sekarang mengunci swipe parent sementara selama drag horizontal, lalu membuka lagi setelah selesai, sehingga chip filter di `Tugas` dan `Absensi` bisa digeser tanpa memicu perpindahan tab.
- Wrapper `SwipeableTabScreen` dan util `tabSwipe` dihapus sepenuhnya dari repo agar tidak ada dua sistem gesture yang saling bertabrakan.
- Verifikasi statis selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Filter Chip Gesture Conflict Fix - 2026-04-25)

- [x] 1. Audit ulang konflik gesture pada chip kategori `Tugas` dan `Absensi`
- [x] 2. Hapus interaksi horizontal pada `FilterChips` dan ubah jadi layout wrap
- [x] 3. Rapikan navigator dengan menghapus `TabSwipeContext` yang sudah tidak diperlukan
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Filter Chip Gesture Conflict Fix - 2026-04-25)

- Koreksi user valid: walau navigator swipe sudah native, chip filter horizontal tetap membuat pengalaman terasa nyangkut di `Tugas` dan `Absensi` karena gesture horizontal masih bersaing dengan pager.
- Solusi yang lebih stabil diterapkan dengan mengubah `FilterChips` dari `ScrollView` horizontal menjadi layout wrap biasa. Semua kategori sekarang tetap terlihat dan bisa dipilih tanpa gesture geser horizontal.
- Karena sumber konflik sudah dihapus, `TabSwipeContext` dan mekanisme lock/unlock swipe parent ikut dihapus agar navigator kembali sederhana: pager selalu aktif dan tidak lagi bergantung pada state gesture transient.
- Hasil akhirnya lebih konsisten: swipe kiri/kanan antar-tab tetap native, sementara filter kategori di `Tugas` dan `Absensi` tidak lagi bisa membuat gesture terasa macet.
- Verifikasi statis selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Filter Chip Layout Polish - 2026-04-25)

- [x] 1. Audit ulang tampilan filter chip setelah konflik gesture dihapus
- [x] 2. Rapikan spacing wrapper dan proporsi chip agar layout wrap tetap terasa intentional
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Filter Chip Layout Polish - 2026-04-25)

- Setelah filter chip diubah dari horizontal scroll ke wrap, tampilan awalnya memang berisiko terasa seperti fallback layout. Karena itu spacing wrapper pada screen `Tugas` dan `Absensi` dirapikan agar filter bar punya margin yang lebih seimbang terhadap konten.
- Komponen `FilterChips` sekarang memakai padding internal, tinggi minimum, dan bobot teks yang lebih konsisten, sehingga tiap chip terlihat seperti elemen UI yang sengaja didesain, bukan sekadar tombol yang patah ke baris baru.
- Label chip juga dipaksa tetap satu baris agar bentuk pill tetap rapi saat layar sempit.
- Verifikasi statis selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Structured Filter Grid - 2026-04-25)

- [x] 1. Rancang ulang filter chip menjadi grid terstruktur yang lebih rapi untuk 5-6 opsi mobile
- [x] 2. Implementasikan grid dengan baris terkontrol agar `Absensi` dan `Tugas` tidak lagi terlihat seperti wrap bebas
- [x] 3. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Structured Filter Grid - 2026-04-25)

- `FilterChips` sekarang tidak lagi hanya `wrap` bebas. Komponen diubah menjadi grid baris terstruktur dengan 3 kolom utama.
- Untuk baris yang tidak penuh, layout dibuat adaptif: 2 item di baris terakhir otomatis menjadi dua chip lebar yang terpusat, sedangkan 1 item akan melebar penuh. Ini membuat screen `Tugas` dengan 5 filter tetap terlihat sengaja didesain, bukan sisa wrap acak.
- Label chip kini boleh dua baris dengan alignment tengah, jadi kategori seperti `Segera Tutup` atau `Belum Terverifikasi` tetap muat tanpa mendorong bentuk chip jadi janggal.
- Verifikasi statis selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Per-Screen Filter Grid Tuning - 2026-04-25)

- [x] 1. Audit hasil grid generik di screen `Tugas` yang punya jumlah opsi berbeda dari `Absensi`
- [x] 2. Tambahkan konfigurasi jumlah kolom per screen pada `FilterChips`
- [x] 3. Terapkan 2 kolom untuk `Tugas` dan pertahankan 3 kolom untuk `Absensi`
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Per-Screen Filter Grid Tuning - 2026-04-25)

- Koreksi user valid: grid 3 kolom yang cocok untuk `Absensi` justru terlihat janggal di `Tugas` saat opsi yang tampil hanya 4 item, karena satu chip terakhir menjadi baris tunggal yang terlalu lebar.
- `FilterChips` sekarang mendukung konfigurasi `columns` per screen. `Tugas` memakai 2 kolom, sedangkan `Absensi` tetap memakai 3 kolom default.
- Dengan ini, `Tugas` tampil sebagai grid 2x2 yang lebih stabil untuk 4 opsi aktif, dan jika opsi `Belum Terverifikasi` muncul lagi, baris terakhir akan tampil sebagai chip tunggal yang tetap compact, bukan full-width yang terasa aneh.
- Verifikasi statis selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Attendance History Reliability - 2026-04-25)

- [x] 1. Audit kenapa filter `Riwayat` pada absensi kosong walau user pernah absensi kemarin
- [x] 2. Tambahkan persistence history absensi lokal per akun agar sesi yang pernah terlihat tetap tersimpan setelah lewat
- [x] 3. Rapikan empty state `Riwayat` agar menjelaskan sumber history yang dipakai aplikasi
- [x] 4. Verifikasi `npm run typecheck` dan `npm run lint`

## Review (Attendance History Reliability - 2026-04-25)

- Akar masalahnya ada pada sumber data SUNAN saat ini: jalur absensi yang benar-benar terisi di lingkungan nyata adalah `core_calendar_get_calendar_upcoming_view`, dan endpoint itu berfokus pada sesi upcoming/aktif, bukan history lampau. Akibatnya filter `Riwayat` bisa kosong walau user memang pernah absensi sebelumnya.
- Solusi yang diterapkan adalah persistence history lokal per akun di perangkat. Setiap sesi absensi yang pernah terdeteksi app kini disimpan, lalu saat waktunya lewat statusnya dinormalisasi menjadi `closed` dan ikut tampil di filter `Riwayat`.
- Ini membuat `Riwayat` benar-benar berguna untuk sesi yang sudah pernah dilihat aplikasi sebelumnya, sambil tetap jujur terhadap batasan source SUNAN: app tidak bisa menampilkan sesi lampau yang tidak pernah dikirim/terlihat sama sekali.
- Empty state `Riwayat` di screen `Absensi` juga diperjelas agar user tahu bahwa history berasal dari sesi yang pernah terdeteksi app lalu sudah lewat.
- Verifikasi statis selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Android Splash Consistency + Remove Preview Label - 2026-04-25)

- [x] 1. Audit kenapa HP menampilkan splash/icon berbeda dibanding emulator
- [x] 2. Bersihkan asset mark yang dipakai icon/splash agar native Android tidak menampilkan kotak gelap
- [x] 3. Hapus suffix `Preview` dari nama aplikasi pada config dinamis dan resource native Android
- [x] 4. Refresh native Android resources dan verifikasi config/lint/typecheck

## Review (Android Splash Consistency + Remove Preview Label - 2026-04-25)

- Perbedaan HP vs emulator berasal dari native Android splash pada cold start. Di HP, Android menampilkan splash sistem lebih jelas, sedangkan emulator sering tidak memperlihatkannya jika versi Android lebih lama atau app dibuka dari warm start/resume.
- Akar visual kotak gelap ada pada asset mark yang dipakai native icon/splash. Asset itu sekarang diganti dengan mark yang lebih bersih untuk dipakai launcher icon, adaptive icon foreground, dan splash image.
- Suffix `Preview` dihapus dari nama aplikasi. Profile `preview` tetap memakai package terpisah (`id.umk.sunannotifier.preview`) agar tidak bentrok instalasi, tetapi label yang terlihat user sekarang tetap `SUNAN Notifier`.
- Resource native Android direfresh ulang lewat `expo prebuild` profile preview, sehingga `strings.xml`, launcher assets, dan `splashscreen_logo.png` yang dipakai build lokal ikut sinkron dengan config baru.
- Verifikasi selesai dengan `npm run typecheck`, `npm run lint`, `npx expo config --json`, dan `EAS_BUILD_PROFILE=preview npx expo config --json`.

## Plan (Local APK Build Execution - 2026-04-25)

- [x] 1. Audit lokasi Java dan Android SDK yang benar di mesin lokal
- [x] 2. Tambahkan `android/local.properties` agar Gradle selalu menemukan SDK
- [x] 3. Jalankan build APK release lokal sampai sukses
- [x] 4. Catat hasil output APK dan status verifikasi

## Review (Local APK Build Execution - 2026-04-25)

- Root cause kegagalan build lokal bukan lagi Java, tetapi Android SDK tidak dikenali oleh Gradle karena `android/local.properties` belum ada. File itu sekarang ditambahkan dengan `sdk.dir` yang menunjuk ke `C:\Users\khabsi\AppData\Local\Android\Sdk`.
- Build release lokal berhasil dijalankan dengan `JAVA_HOME`, `ANDROID_HOME`, dan `ANDROID_SDK_ROOT` yang di-set eksplisit pada command build, sehingga proses tidak tergantung terminal lama yang kebetulan pernah punya env aktif.
- APK final berhasil dihasilkan di `D:\Belajar\sunan notifier\mobile\android\app\build\outputs\apk\release\app-release.apk`.
- Ukuran file hasil build saat verifikasi: `77,391,567` bytes, waktu modifikasi `2026-04-25 17:54:44`.
- Verifikasi tambahan tetap lulus: `npm run typecheck`, `npm run lint`, dan build `gradlew app:assembleRelease`.

## Plan (GitHub Upload - 2026-04-25)

- [x] 1. Audit repo aplikasi yang aktif, branch saat ini, dan status autentikasi GitHub CLI
- [x] 2. Stage seluruh perubahan source aplikasi lalu buat commit yang mewakili kondisi terbaru
- [x] 3. Buat atau hubungkan remote GitHub untuk repo `mobile`, lalu push branch aktif
- [x] 4. Verifikasi URL repo hasil push dan catat scope upload yang benar

## Review (GitHub Upload - 2026-04-25)

- Repo aplikasi yang aktif tetap `D:\Belajar\sunan notifier\mobile`, karena root workspace belum berupa git repo. Upload GitHub kali ini mencakup source aplikasi mobile yang memang sedang dikembangkan dan punya histori git.
- Semua perubahan source yang belum masuk git berhasil di-stage lalu dikomit dengan hash `81dc723` dan message `feat: polish SUNAN Notifier app experience`.
- Repo GitHub baru berhasil dibuat di `https://github.com/Zi-exa/sunan-notifier-mobile` dengan visibility `PRIVATE`, lalu branch `master` berhasil dipush dan sekarang tracking `origin/master`.
- Verifikasi akhir menunjukkan remote `origin` sudah aktif, branch lokal bersih, dan repo GitHub terbaca normal lewat GitHub CLI.

## Plan (Safe Root Workspace Upload - 2026-04-25)

- [x] 1. Audit root workspace untuk file sensitif, temp, dan struktur repo yang aman dipublikasikan
- [x] 2. Tetapkan strategi aman untuk folder `mobile` sebagai repo terpisah, bukan di-copy mentah ke repo root
- [x] 3. Tambahkan guardrail repo root (`.gitignore`, catatan submodule, dan pengecualian file sensitif)
- [x] 4. Inisialisasi repo root, tambahkan file aman + submodule `mobile`, lalu push ke GitHub
- [x] 5. Verifikasi isi repo root dan catat apa saja yang sengaja tidak di-upload

## Review (Safe Root Workspace Upload - 2026-04-25)

- Root workspace `D:\Belajar\sunan notifier` sekarang sudah menjadi git repo terpisah dan berhasil di-push ke `https://github.com/Zi-exa/sunan-notifier-workspace` dengan visibility `PRIVATE`.
- Folder `mobile` tidak disalin ulang sebagai source mentah ke repo root. Ia direferensikan sebagai submodule ke repo aplikasi yang sudah lebih dulu aman dan aktif di `https://github.com/Zi-exa/sunan-notifier-mobile`, sehingga histori dan batas keamanan repo aplikasi tetap terjaga.
- Guardrail keamanan ditambahkan lewat `.gitignore` root untuk mengecualikan `.cursor`, file env, service-account JSON, key/keystore, cache build, dan `supabase/.temp/`.
- File sensitif/temp yang sengaja tidak ikut upload mencakup `mobile/.env`, `mobile/sunan-notifier-firebase-adminsdk-fbsvc-836e60584f.json`, seluruh cache/build lokal, serta `supabase/.temp/*`.
- Commit root workspace yang ter-push adalah `09ffe2a` dengan message `chore: add safe workspace sources`, dan branch `master` sekarang tracking `origin/master`.

## Plan (Android Native Splash Cleanup - 2026-04-25)

- [x] 1. Audit asset dan config splash Android yang aktif, termasuk varian `drawable-night` dan launcher icon yang dipakai cold start di HP
- [x] 2. Pastikan root cause antara native Android system splash vs in-app loading screen benar-benar terpisah
- [x] 3. Bersihkan asset mark agar tidak punya fringe putih dan pisahkan jalur native splash dari background bitmap kotak
- [x] 4. Ubah config/plugin splash Android agar system splash memakai logo transparan di atas background sistem, bukan bitmap penuh
- [x] 5. Verifikasi lewat `expo config`, prebuild Android, dan inspeksi resource hasil generate sebelum commit

## Review (Android Native Splash Cleanup - 2026-04-25)

- Root cause utamanya ada dua: asset `sunan-notifier-mark.png` punya fringe putih pada piksel semi-transparan, dan plugin splash Android sebelumnya membangkitkan `splashscreen_logo.png` berupa bitmap penuh berlatar belakang. Saat dipakai sebagai `windowSplashScreenAnimatedIcon`, Android 12+/OEM splash merender seluruh bitmap itu sebagai kotak di tengah layar.
- Asset mark dibersihkan dengan mempertahankan alpha tetapi menyeragamkan warna seluruh piksel non-transparan ke biru logo yang sebenarnya, sehingga halo putih di tepi logo hilang baik untuk launcher icon maupun loading screen React.
- Konfigurasi splash dipindahkan ke plugin `expo-splash-screen` dengan `android.drawable.icon` dan `darkIcon`, lalu drawable XML baru mengarahkan system splash ke `@mipmap/ic_launcher_foreground`. Hasilnya background splash tetap diatur oleh `windowSplashScreenBackground`, sementara icon yang dirender sistem sekarang hanya logo transparan, bukan bitmap kotak.
- Native splash pertama tetap akan muncul pada cold start di Android dan tidak bisa dihilangkan total dari source app, terutama pada Android 12+ atau OEM launcher tertentu. Perbaikan ini menargetkan kualitas dan konsistensinya, bukan menghapus mekanisme splash sistem.
- Verifikasi yang lulus: `npm run typecheck`, `npm run lint`, `npx expo config --json`, dan `npx expo prebuild --platform android --no-install`. Hasil generate native menunjukkan `res/drawable/splashscreen_logo.xml` serta `res/drawable-night/splashscreen_logo.xml` transparan sudah menggantikan `splashscreen_logo.png` lama.
- Verifikasi `assembleRelease` masih tertahan oleh bug native lain yang sudah ada sebelumnya: generated autolinking Android masih menyuntik `id.umk.sunannotifier.preview` ke `ReactNativeApplicationEntryPoint.java`. Itu tidak berasal dari splash fix ini, tetapi tetap perlu dibereskan terpisah agar build release lokal kembali hijau.

## Plan (In-App About Section - 2026-04-25)

- [x] 1. Audit jalur paling masuk akal untuk menaruh `About` di dalam aplikasi tanpa merusak alur settings yang sudah ringkas
- [x] 2. Tambahkan section `About` yang konsisten dengan desain app dan tampilkan mark `ZxiruL`
- [x] 3. Verifikasi hasil dengan `typecheck` dan `lint`
- [ ] 4. Commit perubahan di repo `mobile` lalu sinkronkan repo root yang menyimpan task log

## Review (In-App About Section - 2026-04-25)

- Section `About` ditambahkan ke halaman `Settings` dengan pola accordion yang sama seperti section lain, jadi tidak merusak ritme visual maupun area aksi utama.
- Kontennya memuat identitas aplikasi, versi aktif dari config Expo, ringkasan fungsi aplikasi, dan mark khusus `ZxiruL` sebagai signature yang terlihat jelas tetapi tetap menyatu dengan desain settings.
- Penempatan dipilih di bawah `Mata Kuliah Dipantau` dan di atas card aksi, sehingga informasi aplikasi tetap mudah ditemukan tanpa menggeser struktur pengaturan inti.
- Verifikasi statis selesai dengan `npm run typecheck` dan `npm run lint` di folder `mobile`.

## Plan (Floating Filter Popup - 2026-04-25)

- [x] 1. Audit pola filter inline yang ada di halaman `Tugas` dan `Absensi`, serta posisi aman terhadap dock footer floating
- [x] 2. Buat komponen floating filter button + popup reusable yang konsisten dengan tema aplikasi
- [x] 3. Pasang di screen `Tugas` dan `Absensi`, lalu hapus filter inline lama
- [x] 4. Verifikasi dengan `typecheck` dan `lint`
- [x] 5. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Floating Filter Popup - 2026-04-25)

- Filter inline di halaman `Tugas` dan `Absensi` dipindah menjadi tombol floating tunggal di kanan bawah, tepat di atas dock footer, sehingga area konten utama kembali bersih dan tidak lagi memakan tinggi layar di atas list.
- Komponen reusable baru `FloatingFilterMenu` menangani tombol ikon, indikator filter aktif, backdrop tap-to-close, dan popup pilihan filter yang mengikuti tema terang/gelap.
- Popup filter ditambatkan ke tombol floating yang sama, jadi interaksinya tetap cepat tetapi tidak lagi mengganggu swipe antar-tab maupun scroll vertikal screen.
- Screen `Tugas` dan `Absensi` kini memakai komponen yang sama dan hanya mengirim daftar opsi masing-masing, sehingga pola filternya konsisten dan mudah dipelihara.

## Plan (Floating Filter Animation Polish - 2026-04-25)

- [x] 1. Audit transisi buka-tutup popup filter saat ini dan tentukan animasi yang paling ringan
- [x] 2. Tambahkan animasi fade + slide untuk popup dan backdrop tanpa mengubah perilaku filter
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [x] 4. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Floating Filter Animation Polish - 2026-04-25)

- Popup filter sekarang tidak lagi muncul secara mendadak. Komponen `FloatingFilterMenu` memakai animasi fade, slide-up, dan scale ringan saat buka-tutup, sehingga transisinya terasa lebih halus namun tetap cepat.
- Backdrop ikut difade in/out agar perpindahan fokus ke menu terasa lebih natural, dan tombol floating juga sedikit membesar saat popup aktif untuk memberi feedback visual yang lebih rapi.
- Perubahan ini tetap lokal di komponen reusable, jadi `Tugas` dan `Absensi` otomatis mendapat animasi yang sama tanpa perubahan perilaku filter di masing-masing screen.

## Plan (Anchored Filter Motion Polish - 2026-04-25)

- [x] 1. Audit motion popup filter setelah polish pertama dan cari cara agar animasinya terasa benar-benar muncul dari tombol
- [x] 2. Tambahkan anchor motion diagonal dan micro-motion isi popup tanpa mengubah layout atau posisi tombol
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [x] 4. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Anchored Filter Motion Polish - 2026-04-25)

- Popup filter sekarang masuk dari arah tombol dengan drift diagonal kecil, bukan hanya fade dan slide vertikal, jadi gerakannya lebih terasa tertambat ke FAB filter.
- Header popup dan setiap opsi filter ikut masuk dengan micro-motion berurutan yang halus, sehingga menu terasa lebih hidup tanpa menjadi berat atau lambat.
- Ikon tombol filter juga mendapat rotasi kecil saat menu aktif, jadi hubungan visual antara tombol pemicu dan popup lebih jelas.

## Plan (Settings Bottom CTA Safe Spacing - 2026-04-25)

- [x] 1. Audit kenapa tombol logout di halaman `Settings` tertutup dock footer floating
- [x] 2. Ubah padding bawah konten `Settings` menjadi dinamis mengikuti safe area dan tinggi dock
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [x] 4. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Settings Bottom CTA Safe Spacing - 2026-04-25)

- Akar masalahnya ada pada `ScrollView` `Settings` yang masih memakai `paddingBottom` statis `32`, padahal halaman ini punya area aksi bawah (`Simpan Pengaturan` dan `Keluar dari Akun`) serta dock footer floating yang menutup area bawah layar.
- Padding bawah sekarang dihitung dinamis dari safe area bawah perangkat plus ruang ekstra untuk tinggi dock footer, sehingga kartu aksi di bagian paling bawah selalu berhenti di atas tab bar.
- `scrollIndicatorInsets` juga ikut disesuaikan agar indikator scroll tidak berhenti di balik dock bawah.

## Plan (Tab Bottom Spacing Consistency - 2026-04-25)

- [x] 1. Audit jarak bawah konten terhadap dock footer pada semua tab utama, bukan hanya `Settings`
- [x] 2. Buat helper shared untuk clearance dock footer dan clearance tombol filter floating
- [x] 3. Terapkan spacing yang lebih rapat namun aman pada `Dashboard`, `Tugas`, `Absensi`, `Kalender`, dan `Settings`
- [x] 4. Verifikasi dengan `typecheck` dan `lint`
- [x] 5. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Tab Bottom Spacing Consistency - 2026-04-25)

- Audit menunjukkan spacing bawah memang belum konsisten: `Dashboard` dan `Kalender` masih memakai `paddingBottom` statis kecil, `Settings` sudah dinamis, sedangkan `Tugas` dan `Absensi` memakai padding statis terlalu besar setelah penambahan tombol filter floating.
- Helper shared baru `floatingLayout.ts` sekarang memusatkan perhitungan clearance untuk dock footer dan tombol filter floating, jadi semua tab utama memakai patokan layout bawah yang sama.
- Jarak konten ke dock di `Tugas` dan `Absensi` dibuat lebih rapat dengan menurunkan offset tombol filter dan clearance kontennya, sementara `Dashboard`, `Kalender`, dan `Settings` ikut dipindah ke pola dinamis yang sama agar hasilnya konsisten di seluruh tab.

## Plan (Selective Tab Spacing Tuning - 2026-04-25)

- [x] 1. Audit ulang hasil spacing setelah helper shared dipasang, lalu tentukan halaman mana yang memang sudah pas dan mana yang masih terlalu jauh
- [x] 2. Koreksi hanya `Tugas`, `Absensi`, dan `Settings` tanpa mengubah `Dashboard` dan `Kalender` yang sudah sesuai
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [x] 4. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Selective Tab Spacing Tuning - 2026-04-25)

- Koreksi user valid: setelah helper shared dipasang, `Dashboard` dan `Kalender` sudah pas, tetapi clearance untuk halaman dengan tombol filter floating (`Tugas` dan `Absensi`) masih terlalu longgar, dan `Settings` juga sedikit terlalu jauh.
- `Dashboard` dan `Kalender` dibiarkan tetap memakai clearance dock standar. `Tugas` dan `Absensi` kini memakai clearance konten yang lebih rapat khusus untuk FAB filter, sementara `Settings` dikembalikan ke clearance dock standar tanpa tambahan ekstra.
- Dengan pendekatan ini, spacing bawah tetap konsisten per kategori halaman, tetapi tidak dipaksa seragam secara buta ketika pola layout-nya memang berbeda.

## Plan (Further Filter Tab Spacing Reduction - 2026-04-25)

- [x] 1. Turunkan lagi offset FAB filter dan content clearance halaman filter tanpa mengubah halaman dock-only yang sudah pas
- [x] 2. Verifikasi dengan `typecheck` dan `lint`
- [x] 3. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Further Filter Tab Spacing Reduction - 2026-04-25)

- Offset tombol filter floating diturunkan lagi, jadi FAB di `Tugas` dan `Absensi` duduk lebih dekat ke dock footer.
- Clearance konten untuk halaman dengan FAB filter juga diperkecil lagi agar kartu terakhir tidak meninggalkan jarak kosong yang terlalu besar sebelum dock bawah.
- `Dashboard`, `Kalender`, dan `Settings` tidak diubah lagi pada iterasi ini karena user sudah mengonfirmasi halaman-halaman itu sudah pas.

## Plan (Match Filter Tabs to Dashboard Spacing - 2026-04-25)

- [x] 1. Samakan clearance konten `Tugas` dan `Absensi` dengan clearance dock standar yang dipakai `Dashboard`
- [x] 2. Verifikasi dengan `typecheck` dan `lint`
- [x] 3. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Match Filter Tabs to Dashboard Spacing - 2026-04-25)

- Koreksi user valid: meski sudah dirapatkan, clearance `Tugas` dan `Absensi` masih terasa lebih besar dari `Dashboard`.
- Clearance konten untuk halaman filter sekarang tidak lagi punya nilai terpisah. `Tugas` dan `Absensi` memakai patokan yang sama dengan `Dashboard`, yaitu clearance dock standar.
- Tombol filter tetap floating di atas dock, tetapi list konten sekarang berhenti pada baseline bawah yang sama seperti halaman dashboard.

## Plan (Premium Filter Popup Visuals - 2026-04-25)

- [x] 1. Audit komponen popup filter dan definisi opsi agar ikon bisa ditambahkan tanpa memecah typing
- [x] 2. Polish visual popup: badge aktif, surface opsi yang lebih rapi, divider halus, dan ikon per kategori
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [x] 4. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Premium Filter Popup Visuals - 2026-04-25)

- Popup filter kini memakai header yang lebih premium dengan badge filter aktif, bukan hanya teks ringkas biasa.
- Setiap opsi filter sekarang punya ikon kategori yang relevan di `Tugas` dan `Absensi`, jadi daftar filter lebih cepat dipindai.
- Visual list opsi dirapikan dengan icon tile kecil, hint text ringan, dan divider antar-opsi yang lebih halus agar card popup terasa lebih polished.

## Plan (Compact Filter Popup Cleanup - 2026-04-25)

- [x] 1. Audit elemen popup filter yang redundant dari screenshot terbaru
- [x] 2. Sederhanakan popup filter dengan header lebih ringkas, row lebih pendek, dan dekorasi lebih sedikit
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [x] 4. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Compact Filter Popup Cleanup - 2026-04-25)

- Koreksi user valid: versi premium sebelumnya terlalu ramai dan tinggi, terutama karena badge aktif, hint text, tile ikon, dan divider tambahan bertumpuk dalam ruang sempit.
- Popup sekarang dipadatkan: header tinggal judul + status aktif, row opsi dibuat satu baris yang lebih pendek, dan elemen dekoratif sekunder dihapus.
- Ikon kategori tetap dipertahankan, tetapi tampil lebih ringan tanpa tile besar, sehingga popup terasa jauh lebih rapi dan cepat dipindai.

## Plan (Clickable About Mark - 2026-04-25)

- [x] 1. Audit area mark di section `About` dan tentukan action link eksternal yang aman
- [x] 2. Buat badge mark bisa ditekan untuk membuka profil GitHub dan tambahkan affordance visualnya
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [x] 4. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Clickable About Mark - 2026-04-25)

- Badge mark `ZxiruL` di section `About` sekarang bisa ditekan dan membuka profil GitHub creator.
- Copy kecil di samping mark diperjelas menjadi ajakan membuka GitHub, dan badge diberi affordance link lewat `external-link` icon serta pressed state ringan.
- Jika perangkat gagal membuka URL eksternal, app sekarang memberi dialog warning yang jelas, bukan diam tanpa feedback.

## Plan (Explicit Task Detail Button - 2026-04-25)

- [x] 1. Audit komponen kartu tugas dan pastikan route detail yang sudah ada bisa dipakai ulang tanpa duplikasi logic
- [x] 2. Tambahkan tombol `Detail Tugas` sebagai aksi eksplisit hanya di tab `Tugas`, tanpa mengubah kartu tugas yang dipakai dashboard
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [x] 4. Commit perubahan di repo `mobile` lalu sinkronkan repo root

## Review (Explicit Task Detail Button - 2026-04-25)

- Tab `Tugas` sekarang menampilkan tombol aksi `Detail Tugas` di setiap kartu, sehingga jalur ke halaman detail tidak hanya mengandalkan tap ke seluruh kartu.
- Route detail yang sudah ada tetap dipakai ulang, jadi tidak ada duplikasi logic atau screen baru; tombol dan area kartu di tab `Tugas` sama-sama mengarah ke detail tugas yang sama.
- Kartu `TaskCard` di dashboard tidak ikut berubah karena tombol detail dibuat opt-in dan hanya diaktifkan dari screen `Tugas`.

## Plan (Fix Dark Theme Return From Task Detail - 2026-04-25)

- [x] 1. Audit layout navigasi root dan screen detail tugas untuk mencari sumber background terang saat kembali ke tab `Tugas`
- [x] 2. Perbaiki theme React Navigation / stack content background agar transisi push-pop tetap mengikuti mode gelap
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [x] 4. Commit perubahan di repo `mobile`, lalu sinkronkan repo root dan catat lesson baru

## Review (Fix Dark Theme Return From Task Detail - 2026-04-25)

- Koreksi user valid: bug tema tidak datang dari styling lokal screen `Tugas`, tetapi dari layer React Navigation yang masih memakai theme dasar dan content background default saat push-pop screen detail.
- `NavThemeProvider` sekarang memakai navigation theme yang disinkronkan ke palet app, bukan `DarkTheme`/`DefaultTheme` mentah. Ini membuat warna `background`, `card`, `text`, dan `border` tetap konsisten dengan theme app sendiri.
- `Stack` root juga sekarang punya `contentStyle` gelap mengikuti `colors.bgBase`, jadi transisi ke `Detail Tugas` lalu kembali ke tab `Tugas` tidak lagi memunculkan layar terang di mode malam.

## Plan (Fix Native Dark Flash On Task Back - 2026-04-25)

- [x] 1. Audit resource native Android (`styles.xml`, `colors.xml`, varian `values-night`) untuk mencari background terang yang masih dipakai saat transisi back
- [x] 2. Sinkronkan `AppTheme` window/status/navigation background ke color resource yang punya varian light/dark
- [x] 3. Verifikasi statis perubahan resource dan jalankan `typecheck`, `lint`, serta cek plugin lewat `expo config`
- [ ] 4. Commit perubahan di repo `mobile`, lalu sinkronkan repo root dan catat lesson koreksinya

## Review (Fix Native Dark Flash On Task Back - 2026-04-25)

- Koreksi user valid: jika flash terang masih muncul saat `back`, berarti bug belum selesai di layer React Navigation. Audit lanjutan menunjukkan `AppTheme` Android masih menyimpan warna terang statis di `styles.xml`.
- Solusi final dipindahkan ke plugin Expo lokal yang tracked di repo, bukan berhenti di folder generated `android/` yang di-ignore. Plugin itu sekarang menyuntik `app_background` ke `values` dan `values-night`, lalu mengikat `windowBackground`, `statusBarColor`, dan `navigationBarColor` ke resource tersebut.
- Dengan jalur ini, prebuild/build Android berikutnya akan meregenerasi theme native yang konsisten dengan mode gelap app saat kembali dari `Detail Tugas`.

## Plan (Fix Task Detail White Flash Surface - 2026-04-25)

- [x] 1. Audit ulang screen `Detail Tugas` dan route option-nya untuk mencari surface putih yang masih bisa terlihat sangat cepat saat transisi
- [x] 2. Pastikan root surface `Detail Tugas` gelap penuh dan ubah animasi route ke transisi yang tidak menonjolkan blank card
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [ ] 4. Commit perubahan di repo `mobile`, lalu sinkronkan repo root dan catat lesson baru

## Review (Fix Task Detail White Flash Surface - 2026-04-25)

- Screenshot terbaru menunjukkan header detail sudah benar, tetapi body screen masih bisa tampak putih sepersekian detik. Itu mengarah ke surface `Detail Tugas` sendiri, bukan lagi hanya theme navigation atau background native Android.
- `Detail Tugas` sekarang tidak lagi me-return `ScrollView` langsung. Screen dibungkus root `View` berwarna theme gelap, dan `contentContainerStyle` scroll view juga ikut diberi background gelap + `flexGrow` supaya area kosong tidak fallback ke putih.
- Route `task/[id]` juga sekarang memakai animasi `fade`, bukan slide horizontal default, sehingga transisi tidak lagi menonjolkan blank surface saat push/pop sangat cepat.

## Plan (Remove Native Stack Flash On Task Detail Transition - 2026-04-25)

- [x] 1. Audit ulang screenshot/gejala dan konfirmasi bahwa flash putih berasal dari animasi native stack saat push/pop, bukan lagi dari surface konten
- [x] 2. Ubah route `Detail Tugas` ke transisi yang tidak memunculkan flash di Android
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [ ] 4. Commit perubahan di repo `mobile`, lalu sinkronkan repo root dan catat lesson baru

## Review (Remove Native Stack Flash On Task Detail Transition - 2026-04-25)

- Koreksi user valid: ketika flash masih muncul saat masuk dan keluar `Detail Tugas`, sementara screenshot menunjukkan sisa konten lama di tepi layar, masalahnya sudah jelas ada di animasi native stack.
- Route `task/[id]` sekarang memakai `animation: 'none'`, jadi Android tidak lagi menjalankan transisi push/pop yang sempat menampilkan surface putih/stripe lama saat gerakan sangat cepat.
- Ini memang tradeoff yang disengaja: transisi jadi instan, tetapi lebih bersih dan tidak memunculkan artefak visual yang merusak mode gelap.

## Plan (Use Stable Back Route From Task Detail - 2026-04-25)

- [x] 1. Tandai navigasi dari tab `Tugas` ke `Detail Tugas` dengan parameter asal route
- [x] 2. Override tombol back header dan tombol back Android di `Detail Tugas` agar kembali ke tab `Tugas` via route stabil, bukan pop bawaan
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [ ] 4. Commit perubahan di repo `mobile`, lalu sinkronkan repo root dan catat lesson baru

## Review (Use Stable Back Route From Task Detail - 2026-04-25)

- Jalur dari tab `Tugas` ke `Detail Tugas` sekarang membawa parameter asal (`from=tasks`), jadi screen detail tahu kapan harus kembali ke tab itu lewat route stabil.
- `Detail Tugas` sekarang tidak lagi mengandalkan pop default untuk kasus tersebut. Tombol back header dan tombol back Android di-override ke `router.dismissTo('/(tabs)/tasks')`, sehingga keluar dari detail tidak lagi memakai pop bawaan yang sempat memunculkan flash.
- Untuk jalur lain yang bukan dari tab `Tugas`, fallback tetap aman: jika stack bisa kembali, pakai `router.back()`, dan kalau tidak bisa, route diganti ke `/(tabs)/tasks`.

## Plan (Restore Safe Task Detail Flow - 2026-04-25)

- [x] 1. Kembalikan `Detail Tugas` dan route stack ke baseline aman sebelum tombol detail ditambahkan
- [x] 2. Sederhanakan `TaskCard` agar tombol `Detail Tugas` tetap ada tetapi tetap memakai single `Pressable` yang sama dengan kartu lama
- [x] 3. Hapus workaround route/native yang ditambahkan khusus untuk bug ini tetapi tidak menyelesaikan akar masalah
- [x] 4. Verifikasi dengan `typecheck` dan `lint`
- [ ] 5. Commit perubahan di repo `mobile`, lalu sinkronkan repo root dan catat lesson baru

## Review (Restore Safe Task Detail Flow - 2026-04-25)

- Koreksi user valid: karena `Detail Tugas` sebelumnya aman dan bug baru muncul tepat setelah tombol `Detail Tugas` ditambahkan, akar masalah lebih masuk akal ada di implementasi CTA baru, bukan di route detail lama.
- `Detail Tugas` dan route stack saya kembalikan ke baseline aman yang dipakai sebelum rangkaian workaround bug ini. Jadi screen detail kembali ke perilaku sederhana yang sebelumnya sudah terbukti stabil.
- Tombol `Detail Tugas` tetap ada di kartu tugas, tetapi sekarang hanya menjadi CTA visual di dalam kartu `Pressable` yang sama. Tidak ada lagi nested `Pressable`, route param tambahan, custom back handler, atau override transition yang membuka regresi baru.

## Plan (Lightweight Task Detail Link - 2026-04-26)

- [x] 1. Pertahankan jalur navigasi `Detail Tugas` yang sekarang sudah kembali ke baseline aman
- [x] 2. Ubah CTA `Detail Tugas` dari blok bawah menjadi link kecil di area header kartu khusus tab `Tugas`
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [ ] 4. Commit perubahan di repo `mobile`, lalu sinkronkan repo root

## Review (Lightweight Task Detail Link - 2026-04-26)

- Jalur `Task -> Detail Tugas -> Back` tetap memakai baseline aman yang sudah dipulihkan sebelumnya; tidak ada perubahan lagi di route detail, stack, atau back behavior.
- CTA `Detail Tugas` di kartu `Tugas` sekarang diperkecil jadi link header yang ringan di sisi kanan atas, dekat badge status, bukan blok besar di bawah isi kartu.
- Kartu tetap satu `Pressable` utuh, jadi affordance eksplisit tetap ada tanpa memperkenalkan nested target sentuh atau jalur navigasi baru.

## Plan (Restore Navigation Theme Flash Fix - 2026-04-26)

- [x] 1. Bandingkan source sekarang dengan baseline sebelum CTA untuk memastikan bug flash bukan lagi berasal dari nested CTA atau route detail khusus
- [x] 2. Kembalikan fix global React Navigation yang menyamakan theme navigation dan `Stack` content background dengan palet app
- [x] 3. Verifikasi dengan `typecheck` dan `lint`
- [x] 4. Commit perubahan di repo `mobile`, lalu sinkronkan repo root dan catat lesson koreksinya

## Review (Restore Navigation Theme Flash Fix - 2026-04-26)

- Audit git menunjukkan delta functional dari baseline aman sebelum CTA tinggal `detailLabel` visual di kartu `Tugas`; route `task/[id]` dan screen detail sendiri sudah kembali ke jalur lama.
- Sumber yang masih paling masuk akal untuk flash cepat saat masuk dan keluar detail adalah layer React Navigation yang sempat kembali memakai `DarkTheme`/`DefaultTheme` mentah tanpa `contentStyle`, sehingga scene stack bisa fallback ke surface default saat push/pop.
- Fix sekarang dipindahkan ke tempat yang elegan dan global: `NavThemeProvider` kembali memakai theme yang disinkronkan ke palet app, dan `Stack` root kembali memaksa `contentStyle` mengikuti `colors.bgBase`.
- Koreksi tambahan user valid: `ScrollView` tidak boleh menjadi satu-satunya pemilik background screen untuk route detail. `task/[id]` sekarang dibungkus root `View` berwarna `bgBase`, lalu `ScrollView` hanya mengisi konten di atas root tersebut agar surface transisi tetap gelap bahkan sebelum konten selesai muncul.

## Plan (Gate Theme Hydration Before Navigator Mount - 2026-04-26)

- [x] 1. Audit `settingsStore`, `ThemeProvider`, dan navigator `(tabs)` untuk memverifikasi apakah persist hydration bisa membuat tab scene mount dengan palette awal yang salah
- [x] 2. Tambahkan status hydration di `settingsStore` dan tahan root navigator sampai theme preference selesai direstore
- [x] 3. Eksplisitkan lagi background screen `(tabs)` di stack root agar scene di belakang route detail tidak fallback ke default
- [x] 4. Verifikasi dengan `typecheck` dan `lint`, lalu commit repo `mobile` dan sinkronkan repo root

## Review (Gate Theme Hydration Before Navigator Mount - 2026-04-26)

- Hipotesis user valid: `settingsStore` memang memakai `persist`, tetapi sebelumnya tidak punya sinyal hydration sendiri. Akibatnya navigator bisa mount dulu memakai `themeMode` awal (`system`) sebelum preference tersimpan seperti `dark` selesai direstore dari AsyncStorage.
- Karena `(tabs)/_layout.tsx` memakai `sceneStyle: { backgroundColor: colors.bgBase }`, render awal dengan palette salah bisa membuat scene navigator di bawah `Detail Tugas` sempat terang saat push/pop, lalu baru gelap setelah hydration selesai.
- Fix sekarang menahan `RootLayout` sampai `settingsStore` selesai rehydrate, sehingga `ThemeProvider`, `Stack`, dan material top tabs tidak pernah mount dengan theme sementara yang salah. `Stack.Screen name=\"(tabs)\"` juga sekarang eksplisit memakai `contentStyle` `bgBase` untuk memperkecil peluang fallback putih.

## Plan (Sync Native Appearance To App Theme - 2026-04-26)

- [x] 1. Audit native Android theme resource dan konfirmasi apakah `windowBackground` sudah memakai color resource yang benar
- [x] 2. Sinkronkan native app appearance ke `themeMode` tersimpan sebelum navigator dirender, agar resource day/night tidak tetap mengikuti default sistem saat app sebenarnya dipaksa dark
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu commit repo `mobile` dan sinkronkan repo root

## Review (Sync Native Appearance To App Theme - 2026-04-26)

- Audit menunjukkan `AppTheme` Android memang sudah memakai `@color/app_background`, jadi resource source-of-truth-nya tidak lagi hardcoded putih. Masalahnya bergeser ke pemilihan resource: `values` vs `values-night` masih mengikuti appearance native app saat startup.
- Karena app punya theme preference sendiri lewat `settingsStore`, app bisa berada di dark mode walau native appearance belum dipaksa dark. Dalam kondisi itu, React screen gelap tetapi native layer dan scene transisi masih bisa memakai resource light sesaat.
- Fix sekarang memanggil `Appearance.setColorScheme()` sesuai `themeMode` tersimpan sebelum navigator dirender, sehingga native app appearance ikut sinkron ke mode app dan resource background dark/light dipilih konsisten sejak awal.

## Plan (Unfreeze Tabs Scene Under Task Detail - 2026-04-26)

- [x] 1. Audit opsi native-stack yang relevan untuk memastikan screen `(tabs)` di bawah `Detail Tugas` tidak sedang di-freeze saat blur
- [x] 2. Nonaktifkan freeze pada route `(tabs)` dan `task/[id]`, lalu beri surface background eksplisit pada material top tabs navigator
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu commit repo `mobile` dan sinkronkan repo root

## Review (Unfreeze Tabs Scene Under Task Detail - 2026-04-26)

- Audit type menunjukkan `freezeOnBlur` tersedia di native stack. Itu berarti route `(tabs)` yang berada di bawah `Detail Tugas` memang bisa dibekukan saat blur, lalu hidup lagi saat back transition dimulai.
- Jika screen di bawah detail dibekukan dan navigator tab sendiri tidak punya surface wrapper yang eksplisit, slide-back bisa menyingkap blank/putih sepersekian detik sebelum scene `Tugas` benar-benar repaint.
- Fix sekarang mematikan `freezeOnBlur` untuk route `(tabs)` dan `task/[id]`, lalu membungkus material top tabs dengan surface `bgBase` sendiri agar layer di bawah detail tetap hidup dan tetap gelap selama transisi.

## Plan (Force Task Detail Native Card Background - 2026-04-26)

- [x] 1. Set `contentStyle` eksplisit pada route `task/[id]` agar native stack punya background gelap langsung di level screen, bukan hanya global
- [x] 2. Matikan animasi route `task/[id]` lagi sekarang setelah guard lain sudah terpasang, untuk meniadakan frame transisi yang bisa menyingkap layer putih
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu commit repo `mobile` dan sinkronkan repo root

## Review (Force Task Detail Native Card Background - 2026-04-26)

- Setelah guard layout, theme hydration, native appearance, dan unfrozen scene terpasang, titik paling sempit yang tersisa adalah card transition milik native stack untuk route `task/[id]` sendiri.
- `task/[id]` sekarang punya `contentStyle` eksplisit di level route, jadi background scene-nya tidak lagi hanya mewarisi `screenOptions` global. Ini penting karena opsi route spesifik biasanya dipakai paling dekat dengan card yang sedang dianimasikan.
- Animasi route juga dimatikan lagi (`animation: 'none'`) untuk tes yang paling deterministik: bila white flash memang berasal dari frame transisi native card, jalur ini akan menghapusnya sepenuhnya.

## Plan (Convert Task Detail To Popup Modal - 2026-04-26)

- [x] 1. Ubah route `task/[id]` dari screen stack biasa menjadi popup/modal transparan
- [x] 2. Refactor UI `task/[id]` menjadi card popup terpusat dengan backdrop, tombol tutup, dan konten scrollable
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu commit repo `mobile` dan sinkronkan repo root

## Review (Convert Task Detail To Popup Modal - 2026-04-26)

- User mengubah target UX: daripada terus mengejar artefak back transition di screen penuh, `Detail Tugas` sekarang dipindah ke popup/modal supaya keluar-masuk tidak lagi bergantung pada slide-back screen stack biasa.
- Route `task/[id]` sekarang memakai `presentation: 'transparentModal'`, `animation: 'fade'`, `headerShown: false`, dan background transparan di stack level.
- Isi detail juga sudah diubah ke overlay card dengan backdrop gelap, close button, dan konten yang tetap scrollable. Jadi entry point `Detail Tugas` tetap sama dari kartu tugas, tetapi pengalaman visualnya sekarang berupa popup di atas halaman `Tugas`.

## Plan (Preserve Tasks Header While Detail Modal Is Open - 2026-04-26)

- [x] 1. Audit resolver judul header tab untuk memastikan kenapa route `task/[id]` jatuh ke fallback `Dashboard`
- [x] 2. Simpan tab terakhir yang valid dan gunakan itu saat modal detail tugas terbuka
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu commit repo `mobile` dan sinkronkan repo root

## Review (Preserve Tasks Header While Detail Modal Is Open - 2026-04-26)

- Akar bug-nya ada di `TabsHeaderTitle`: komponen itu membaca `usePathname()` langsung, lalu `getAppTabRouteKeyFromPathname('/task/123')` jatuh ke fallback `index`, sehingga judul di header belakang modal berubah ke `Dashboard`.
- Fix sekarang menyimpan tab terakhir yang valid di ref. Saat pathname normal tab berubah, ref ikut diperbarui. Saat pathname adalah route detail tugas (`/task/...`), header memakai tab terakhir itu, bukan fallback.
- Hasilnya: ketika popup `Detail Tugas` muncul dari tab `Tugas`, header yang terlihat di belakang popup tetap `Tugas`.

## Plan (Keep Tasks Layout Mounted During Detail Return - 2026-04-26)

- [x] 1. Hapus guard loading/resolving yang me-return screen penuh terpisah dari `tasks.tsx`
- [x] 2. Pindahkan state loading, resolving, dan error menjadi state inline di dalam layout utama `Tugas`
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu commit repo `mobile` dan sinkronkan repo root

## Review (Keep Tasks Layout Mounted During Detail Return - 2026-04-26)

- Koreksi user valid: kalau tab `Tugas` sempat remount dan jatuh ke `return <LoadingView />`, screen di bawah route detail ikut berganti total. Itu bisa memunculkan flash walau route detail sendiri sudah dijaga background-nya.
- `tasks.tsx` sekarang selalu mempertahankan root `View` + `ScrollView` yang sama. Yang berubah hanya isi area list: loading card inline, resolving card inline, error state inline, atau daftar tugas.
- Dengan ini, saat kembali dari `Detail Tugas`, screen dasar tidak lagi tukar ke screen loading penuh hanya karena query tugas sedang re-evaluate sebentar.

## Plan (Investigate Auto Logout Impact On Notifications - 2026-04-27)

- [x] 1. Audit semua titik yang bisa mengubah sesi menjadi `unauthenticated`, terutama `expireSession` dan jalur logout
- [x] 2. Cek apakah komponen sinkronisasi notifikasi dan query data SUNAN hanya aktif saat user masih `authenticated`
- [x] 3. Rangkum dampaknya ke notifikasi yang sudah ada vs notifikasi baru yang harus dibuat saat app berjalan

## Review (Investigate Auto Logout Impact On Notifications - 2026-04-27)

- Auto logout memang berpotensi langsung mematikan alur notifikasi. `authStore.expireSession()` dan `logout()` sama-sama menghapus session secure store lalu mengubah status ke `unauthenticated`, jadi token SUNAN tidak lagi tersedia untuk query data.
- Layout tab utama merender `AttendanceNotificationSync` dan `TaskNotificationSync` hanya ketika status auth masih `authenticated`. Begitu status berubah, route `(tabs)` redirect ke `/login`, sehingga dua komponen sinkronisasi itu ikut unmount dan berhenti memproses notifikasi.
- Query tugas, kalender, dan absensi juga semuanya `enabled` hanya saat token/session masih ada. Jadi setelah auto logout, app tidak lagi mengambil data baru dari SUNAN yang dibutuhkan untuk memicu notifikasi berikutnya.
- Notifikasi tugas/absensi yang dipakai aktif saat ini mayoritas datang dari sync lokal saat app sedang hidup (`sendImmediateTaskNotification` / `sendImmediateAttendanceNotification` dengan trigger 1 detik), bukan dari jadwal background mandiri yang tetap berjalan tanpa sesi aktif.
- Kesimpulannya: jika app sering logout sendiri, sangat masuk akal kalau notifikasi baru tidak muncul, karena pipeline data dan komponen pemicunya memang berhenti ketika sesi SUNAN dianggap habis.

## Plan (Prevent False Auto Logout From Optional SUNAN Endpoint Errors - 2026-04-27)

- [x] 1. Audit semua kode error yang saat ini dianggap auth/session invalid dan cocokkan dengan endpoint opsional yang bisa gagal walau token masih valid
- [x] 2. Sempitkan klasifikasi auth expiry agar hanya token/login yang benar-benar invalid yang memicu `expireSession`
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu catat akar masalah dan dampak fix ke notifikasi

## Review (Prevent False Auto Logout From Optional SUNAN Endpoint Errors - 2026-04-27)

- Akar masalah paling mungkin ada di klasifikasi auth yang terlalu agresif. Sebelumnya app menganggap `403`, `accessexception`, `usernotfullysetup`, dan `servicerequireslogin` sebagai sesi invalid, lalu `useSessionExpiryGuard` langsung memanggil `expireSession` untuk query yang gagal.
- Ini berbahaya karena beberapa endpoint yang dipakai app bersifat opsional atau capability-sensitive, misalnya pengambilan quiz, calendar action events, calendar events, upcoming view, dan status submit per aktivitas. Jika salah satu endpoint itu diblok atau tidak tersedia di SUNAN, app bisa salah menganggap token habis lalu logout sendiri.
- Fix sekarang mempersempit auth expiry ke kasus yang benar-benar menunjukkan sesi/token tidak valid: `invalidtoken`, `requireloginerror`, dan `require_login_exception`. Status HTTP `403` juga tidak lagi otomatis dianggap auth expiry; hanya `401` yang langsung diperlakukan sebagai sesi habis.
- Dengan perubahan ini, error hak akses atau endpoint opsional yang tidak tersedia akan jatuh sebagai server error biasa. Query opsional bisa tetap ditangani oleh fallback existing tanpa menjatuhkan seluruh sesi, sehingga logout palsu dan hilangnya notifikasi ikut berkurang.

## Plan (Make Auto Logout Maintenance-Aware - 2026-04-27)

- [x] 1. Audit apakah auth error dari query background langsung membuang sesi tanpa verifikasi lanjutan
- [x] 2. Tambahkan verifikasi sesi ringan sebelum `expireSession`, agar maintenance atau error endpoint opsional tidak langsung dianggap token invalid
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu catat perilaku baru dan dampaknya ke notifikasi

## Review (Make Auto Logout Maintenance-Aware - 2026-04-27)

- Setelah klasifikasi auth dipersempit, masih ada celah: setiap auth error dari query background tetap langsung memicu `expireSession` tanpa cross-check. Jika SUNAN sedang maintenance dan mengembalikan respons auth-like sesaat, sesi masih bisa terbuang walau token sebenarnya masih valid.
- Fix sekarang menambahkan verifikasi sesi ringan lewat `core_webservice_get_site_info` sebelum app benar-benar logout. Hanya jika probe itu juga memastikan token invalid, sesi dibuang.
- Jika probe mengembalikan `valid`, `maintenance`, atau `unavailable`, app tidak langsung logout. Ini menjaga user tetap login saat SUNAN sedang bermasalah atau ketika endpoint tertentu error sementara.
- Guard ini juga didedup per signature error dan diberi cooldown singkat, jadi beberapa query yang gagal bersamaan tidak akan memicu logout/probe berulang-ulang dalam waktu rapat.

## Plan (Fix False-Positive SUNAN Session Expiry - 2026-04-27)

- [x] 1. Audit pemicu `expireSession` dan endpoint SUNAN yang sekarang bisa mengubah auth error menjadi logout global
- [x] 2. Bedakan error token/session invalid dari error izin/fitur endpoint opsional, lalu implementasikan fix minimal
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, dokumentasikan hasil di task log dan lessons, lalu commit repo yang berubah

## Review (Fix False-Positive SUNAN Session Expiry - 2026-04-27)

- Akar bug paling mungkin ada pada klasifikasi auth yang terlalu agresif. `AUTH_ERROR_CODES` sebelumnya memasukkan `accessexception`, `usernotfullysetup`, dan `servicerequireslogin`, padahal kode-kode itu bisa muncul karena izin endpoint, konfigurasi service, atau fitur SUNAN tertentu yang tidak dibuka — bukan karena token user sudah invalid.
- Karena `useSessionExpiryGuard` di query global akan memanggil `expireSession()` untuk setiap `AppError.kind === 'auth'`, satu endpoint opsional seperti quiz, kalender, atau submission status yang ditolak bisa menjatuhkan seluruh sesi user dan melempar app ke login.
- Fix sekarang mempersempit auth/session-expired hanya ke kode yang memang menunjukkan sesi invalid (`invalidtoken`, `requireloginerror`, `require_login_exception`) dan menangani `require_login_exception` juga dari nama exception-nya langsung.
- Saya juga menurunkan agresivitas fallback HTTP status: `401` tetap dianggap auth, tetapi `403` tidak lagi otomatis dianggap sesi habis. Dengan ini, akses ditolak pada endpoint tertentu tidak akan lagi memicu logout global.
- Dampak yang diharapkan: user tetap login saat SUNAN menolak endpoint opsional atau fitur tertentu, sementara logout otomatis tetap terjadi saat token memang benar-benar invalid.

## Plan (Hide Tabs Header During Initial Splash Gate - 2026-04-27)

- [x] 1. Audit kenapa header `(tabs)` tetap muncul ketika `InitialDataGate` masih menampilkan splash/loading penuh
- [x] 2. Tambahkan state boot ringan yang bisa dibaca root stack agar header tab disembunyikan selama preload awal
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu dokumentasikan hasil dan commit perubahan

## Review (Hide Tabs Header During Initial Splash Gate - 2026-04-27)

- Akar bug ada di pemisahan layer navigator: `InitialDataGate` hanya mengganti isi route `(tabs)` menjadi splash/loading, tetapi header `Dashboard` berasal dari `Stack.Screen name=\"(tabs)\"` di root layout, jadi header itu tetap hidup walau isi screen masih gate loading.
- Fix sekarang menambahkan store kecil `tabsBootStore` sebagai sumber kebenaran status preload tab. `InitialDataGate` menulis `loading/ready/failed` ke store itu, dan root stack membaca statusnya untuk mematikan `headerShown` khusus route `(tabs)` selama gate masih `loading`.
- `AppBootstrap` juga mereset status boot ke `loading` setiap sesi auth berubah, jadi login baru tidak mewarisi status `ready` dari sesi sebelumnya dan tidak sempat menampilkan header tab satu frame sebelum gate aktif.
- Dampaknya: saat splash/loading penuh tampil di area tab, header `Dashboard` tidak lagi ikut muncul di atasnya. Begitu preload selesai atau gagal, header tab kembali tampil normal.

## Plan (Audit All Main App Functions - 2026-04-27)

- [ ] 1. Petakan area fitur utama yang harus diuji: auth, dashboard, tugas, detail tugas, absensi, kalender, settings, notifikasi, splash/loading, dan navigation
- [ ] 2. Jalankan verifikasi statis/build yang tersedia dan audit code path utama untuk menemukan bug atau fitur yang belum lengkap
- [ ] 3. Perbaiki bug yang jelas jika ditemukan, verifikasi ulang, lalu dokumentasikan hasil audit dan risiko yang masih tersisa

## Plan (Full App QA Audit - 2026-04-27)

- [x] 1. Petakan area fitur utama dan jalankan verifikasi statis/build yang tersedia (`typecheck`, `lint`, config/build sanity)
- [x] 2. Audit code path utama untuk auth, notifikasi, dashboard, tugas, absensi, kalender, settings, navigation, splash/loading, dan modal
- [x] 3. Perbaiki bug yang jelas jika ditemukan, verifikasi ulang, lalu dokumentasikan hasil, celah tersisa, dan commit perubahan

## Review (Full App QA Audit - 2026-04-27)

- Verifikasi statis lulus: `npm run typecheck`, `npm run lint`, dan `npx expo config --json`.
- Bug notifikasi yang saya fix:
  - tap notifikasi saat app cold start sebelumnya bisa hilang karena bootstrap hanya mendengar listener live. Sekarang app juga memulihkan `last notification response` saat startup.
  - tap notifikasi saat user sudah logout tidak lagi melempar ke detail tugas kosong; payload sekarang diarahkan ke login dulu dan dibuka lagi setelah sesi kembali `authenticated`.
  - parser payload notifikasi absensi sekarang menerima `attendanceEventId` dan `eventId`, jadi payload dari backend dan lokal sama-sama terbaca benar.
  - sync notifikasi tugas sekarang menunggu `statusResolved !== false`, jadi boot preload ringan tidak lagi berisiko memicu notifikasi palsu sebelum status submit selesai dihydrate.
- Bug auth/bootstrap yang saya fix:
  - preload awal di `InitialDataGate` sekarang tidak lagi melewati jalur expiry guard. Jika boot fetch gagal karena auth dan probe sesi memastikan token invalid, app akan masuk jalur `expireSession()` yang sama dengan query biasa.
- Bug screen-state yang saya fix:
  - `Tugas`, `Absensi`, dan `Kalender` sekarang memprioritaskan error/loading upstream dari `coursesQuery`, jadi tidak lagi jatuh ke empty state palsu ketika query turunan `enabled: false`.
  - `Kalender` section deadline sekarang konsisten dengan screen lain: `TaskCard` bisa dibuka ke detail tugas.
  - `Dashboard` error state sekarang tetap punya jalur retry lewat pull-to-refresh, tidak lagi memutus user di layar statis.
- Bug detail tugas yang saya fix:
  - detail tugas sekarang guarded oleh auth state; jika sesi tidak valid, route tidak lagi menampilkan popup “Tugas tidak ditemukan”.
  - state error query di detail tugas sekarang dibedakan dari “task not found”, lengkap dengan retry CTA.
  - tinggi modal detail tugas sekarang dihitung dari tinggi window nyata, bukan konstanta hardcoded.
- Bug runtime/splash yang saya fix:
  - animasi dot di `AppSplashScreen` sekarang berhenti bersih saat unmount, jadi tidak lagi meninggalkan chain animasi yang terus hidup di background.
- Bug absensi yang saya fix:
  - event absensi tanpa `timeduration` tidak lagi tersangkut selamanya di status `available`; setelah lewat hari lokalnya, status akan jatuh ke `closed` sehingga `Riwayat` bisa menangkapnya.
  - dedupe key absensi harian sekarang memakai tanggal lokal, bukan `toISOString()` UTC.
- Risiko sisa yang belum saya ubah di batch ini:
  - setting `notifyTaskOpen` masih lokal-only; schema `user_settings` backend belum punya kolomnya, jadi saya sengaja tidak memaksa sync agar tidak merusak payload server.
  - dedupe notifikasi absensi harian masih volatile per lifecycle app; restart app di hari yang sama masih bisa mengulang notifikasi open/closing.

## Review Addendum (Calendar Range Follow-up - 2026-04-27)

- Gap kalender yang tersisa dari audit sebelumnya sekarang sudah ditutup. Query `calendar-events` tidak lagi selalu memakai rentang tetap sekitar “hari ini”.
- `getCalendarEvents()` sekarang menerima `CalendarQueryRange`, hook `useCalendarEventsQuery()` menjadikan range bagian dari query key, dan screen `Kalender` menghitung range dari bulan yang sedang dilihat user.
- `onMonthChange` dan `onDayPress` sekarang ikut menggeser `visibleMonth`, jadi saat user berpindah bulan, fetch server ikut berpindah ke bulan itu dengan padding beberapa hari di kiri/kanan.
- `InitialDataGate` juga ikut memakai default calendar range yang sama, jadi preload awal dan query screen tidak lagi punya key kalender yang berbeda untuk bulan sekarang.

## Review Addendum (Persist Notification Dedupe - 2026-04-27)

- Dedupe notifikasi tidak lagi hanya hidup di `useRef(new Set())` per komponen. Saya tambahkan store persist `notificationDedupeStore` berbasis AsyncStorage untuk menyimpan key notifikasi yang sudah pernah dikirim.
- `TaskNotificationSync` sekarang memakai dedupe key yang stabil (`task-open` dan `task-closing` berbasis task id + timestamp penting), lalu memeriksa key itu dari store persist sebelum mengirim notifikasi lagi.
- `AttendanceNotificationSync` sekarang juga memakai store persist yang sama, sehingga force-close lalu buka app lagi pada hari yang sama tidak lagi otomatis mengirim ulang notifikasi `attendance_open` atau `attendance_closing` untuk event yang sama.
- Dedupe store juga punya pruning ringan berbasis umur key agar storage tidak tumbuh terus tanpa batas.

## Plan (Persist Remote Task-Open Notification Setting - 2026-04-27)

- [x] 1. Audit jalur `notifyTaskOpen` di mobile, repository Supabase, dan schema backend agar gap sync-nya jelas
- [x] 2. Implementasikan persistence penuh: schema/migration, save payload, dan hydrate settings dari backend saat sesi aktif
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu dokumentasikan hasil dan commit

## Review Addendum (Persist Remote Task-Open Notification Setting - 2026-04-27)

- Gap `notifyTaskOpen` yang tadinya lokal-only sekarang ditutup end-to-end.
- Mobile:
  - payload `saveUserSettings()` sekarang ikut mengirim `notifyTaskOpen`
  - repository punya `loadUserSettings()` untuk membaca settings dari backend
  - `settingsStore` punya `applyRemoteSettings()` agar state lokal bisa dihydrate dari server
  - `AppBootstrap` sekarang menarik settings remote saat sesi authenticated aktif dan `appUserId` tersedia
- Backend/schema:
  - `user_settings` sekarang punya kolom `notify_task_open boolean not null default true`
  - saya tambahkan migration incremental `20260427_0002_add_notify_task_open.sql`
  - file init schema juga diselaraskan agar bootstrap database baru tidak tertinggal
- Dampak:
  - setting `Tugas dibuka` sekarang tidak hanya tersimpan lokal di device
  - setelah login di device lain, install ulang, atau restore sesi yang sudah punya `appUserId`, app bisa memuat lagi preferensi yang sama dari backend

## Plan (Add Manual APK + EAS Update Flow - 2026-04-27)

- [x] 1. Audit fondasi update yang sudah ada (`expo-updates`, config EAS, env manifest APK, dan helper runtime) lalu pastikan scope implementasinya jelas
- [x] 2. Implementasikan checker global yang memprioritaskan update APK manual di Android, lalu fallback ke EAS Update untuk patch JS
- [x] 3. Verifikasi dengan `typecheck`, `lint`, dan config sanity, lalu dokumentasikan review hasil dan commit perubahan

## Review Addendum (Add Manual APK + EAS Update Flow - 2026-04-27)

- Fondasi update sekarang aktif di dua jalur:
  - binary/manual APK update untuk distribusi APK langsung
  - EAS Update untuk patch JS kecil yang bisa diambil tanpa install APK baru
- Konfigurasi Expo/EAS:
  - `expo-updates` sudah ditambahkan ke dependency mobile
  - `app.json` sekarang memakai `runtimeVersion.policy = appVersion` dan `updates.url` ke project Expo yang aktif
  - `eas.json` sekarang punya channel `development`, `preview`, dan `production` agar publish EAS Update tidak tercampur antar build profile
- Runtime checker:
  - komponen global `AppUpdateCoordinator` sekarang hidup di root layout
  - checker menunggu boot app stabil dulu, lalu memprioritaskan manifest APK manual di Android
  - jika tidak ada binary update manual, checker baru mencoba EAS Update dan mengunduh patch JS agar siap dipasang
  - prompt update memakai dialog app yang konsisten, termasuk tombol aksi sekunder dan guard untuk update wajib
- Konfigurasi manifest APK manual:
  - env baru `EXPO_PUBLIC_UPDATE_MANIFEST_URL` dipakai untuk URL manifest JSON update APK
  - format JSON yang didukung:
    - flat: `{ "version": "1.0.1", "apkUrl": "https://...", "title": "...", "notes": "...", "mandatory": false }`
    - nested Android: `{ "android": { "version": "1.0.1", "apkUrl": "https://..." } }`
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Simplify User-Facing Save Messages - 2026-04-27)

- [x] 1. Audit copy user-facing di alur simpan pengaturan dan tandai kalimat yang terlalu teknis
- [x] 2. Sederhanakan pesan menjadi bahasa yang mudah dipahami tanpa istilah server/sinkronisasi
- [x] 3. Verifikasi, dokumentasikan hasil, lalu commit dan push

## Review Addendum (Simplify User-Facing Save Messages - 2026-04-27)

- Copy di alur simpan pengaturan sekarang tidak lagi menampilkan istilah teknis seperti `server`, `sinkron`, `perangkat`, atau status parsial yang membingungkan user.
- Semua jalur save yang sebelumnya memunculkan:
  - `Tersimpan di perangkat`
  - `Tersimpan sebagian di server`
  - penjelasan sinkronisasi teknis
  sekarang dipadatkan menjadi satu hasil yang mudah dipahami:
  - `Tersimpan`
  - `Pengaturan berhasil disimpan.`
- Penjelasan bantuan `Mata Kuliah Dipantau` juga disederhanakan agar lebih mudah dimengerti user non-teknis.
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Audit User-Facing Copy Across App - 2026-04-27)

- [x] 1. Audit dialog, error state, loading state, dan pesan penting lain yang masih memakai istilah teknis
- [x] 2. Sederhanakan copy menjadi bahasa yang lebih mudah dipahami user awam tanpa mengubah alur aplikasi
- [x] 3. Verifikasi, dokumentasikan hasil, lalu commit dan push

## Review Addendum (Audit User-Facing Copy Across App - 2026-04-27)

- Audit lanjutan difokuskan ke sumber copy yang paling sering muncul ke user:
  - error umum di `mobile/lib/moodle/errors.ts`
  - dialog update di `mobile/components/app/AppUpdateCoordinator.tsx`
  - pesan login/maintenance di `mobile/app/login.tsx`
  - loading dan empty state riwayat absensi di `mobile/app/(tabs)/attendance.tsx`
  - pesan sesi berakhir di `mobile/lib/stores/authStore.ts`
- Istilah teknis yang diringkas mencakup:
  - `maintenance` -> `sedang diperbarui`
  - `kredensial` -> `NIM, password, dan koneksi internet`
  - `sesi berakhir` -> `silakan login lagi`
  - `APK` / `memuat ulang aplikasi` -> kalimat update yang lebih sederhana
  - `terdeteksi di aplikasi` -> `waktunya sudah lewat`
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Polish Microcopy for Login, Update, and Empty States - 2026-04-27)

- [x] 1. Audit mikrocopy di login, update flow, dan empty state tab utama; tulis plan di `tasks/todo.md`
- [x] 2. Rapikan copy agar lebih seragam, sederhana, dan konsisten antar layar tanpa ubah alur fungsi
- [x] 3. Verifikasi, dokumentasikan hasil/lesson, lalu commit dan push

## Review Addendum (Polish Microcopy for Login, Update, and Empty States - 2026-04-27)

- Fokus audit lanjutan:
  - loading dan empty state di `Tugas`, `Dashboard`, `Kalender`, `Absensi`, dan `Detail Tugas`
  - loading default shared di `components/app/LoadingView.tsx` dan `components/Redesign/LoadingView.tsx`
- Pola copy yang diseragamkan:
  - loading: `Memuat...` / `Menyiapkan...`
  - error state: `... belum bisa ditampilkan`
  - empty state: `Belum ada...`
  - penjelasan: singkat, langsung, tanpa istilah internal
- Contoh hasil:
  - `Memuat data SUNAN...` -> `Memuat data...`
  - `Daftar tugas belum tersedia` -> `Tugas belum bisa ditampilkan`
  - `Menyelaraskan status tugas...` -> `Menyiapkan tugas...`
  - `Tidak ada deadline` -> `Belum ada deadline`
  - `Tidak ada deskripsi tambahan dari dosen.` -> `Belum ada deskripsi tambahan.`
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Polish Notification and Detail Microcopy - 2026-04-27)

- [x] 1. Audit copy di notifikasi, popup detail tugas, dan dialog update agar nada bahasanya tetap seragam
- [x] 2. Rapikan judul dan isi pesan menjadi lebih alami dan lebih mudah dipahami user
- [x] 3. Verifikasi, dokumentasikan hasil, lalu commit dan push

## Review Addendum (Polish Notification and Detail Microcopy - 2026-04-27)

- Fokus audit:
  - judul dan isi notifikasi di `mobile/lib/notifications/index.ts`
  - copy notifikasi realtime di `mobile/components/app/TaskNotificationSync.tsx` dan `mobile/components/app/AttendanceNotificationSync.tsx`
  - dialog update di `mobile/components/app/AppUpdateCoordinator.tsx`
  - header popup di `mobile/app/task/[id].tsx`
- Perubahan utama:
  - `deadline besok` / `deadline hari ini` dirapikan jadi `berakhir besok` / `berakhir hari ini`
  - `Tugas/Quiz ...` dipadatkan jadi `Tugas ...`
  - notifikasi absensi dan tugas tidak lagi memakai kalimat terlalu ramai seperti `segera submit sebelum terlambat`
  - dialog update pakai judul yang lebih sederhana seperti `Versi baru tersedia` dan `Belum bisa dibuka`
  - header popup detail tugas diselaraskan jadi `RINGKASAN` + `Detail Tugas`
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`
  - `npx expo config --json`

## Plan (Complete Manual APK Update Setup Docs - 2026-04-27)

- [x] 1. Audit bagian yang masih kurang untuk update APK manual setelah checker runtime aktif
- [x] 2. Tambahkan template manifest JSON dan dokumentasi hosting/config yang dibutuhkan user
- [x] 3. Verifikasi akhir, lalu dokumentasikan hasil dan commit perubahan

## Review Addendum (Complete Manual APK Update Setup Docs - 2026-04-27)

- Jalur update APK manual sekarang tidak hanya siap di runtime, tetapi juga sudah punya artefak setup yang bisa langsung dipakai user.
- `mobile/update-manifest.example.json` sekarang menjadi template manifest APK manual yang valid untuk checker app.
- `tasks/app-update-setup.md` sekarang menjelaskan:
  - perbedaan jalur APK manual vs EAS Update
  - format manifest JSON yang didukung
  - tempat aman untuk hosting JSON dan APK
  - cara mengisi `EXPO_PUBLIC_UPDATE_MANIFEST_URL`
  - urutan rilis update APK manual dan publish EAS Update
- `README.md` dan `.env.example` juga diselaraskan supaya tidak lagi menyesatkan user mengisi URL `u.expo.dev` ke variabel manifest APK manual.
- Verifikasi ulang lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Publish Free GitHub APK Update Feed - 2026-04-27)

- [x] 1. Audit artefak APK dan status repo GitHub yang akan dipakai untuk distribusi publik gratis
- [x] 2. Buat repo publik distribusi terpisah, unggah APK release, lalu publikasikan `update.json` yang sesuai dengan checker app
- [x] 3. Arahkan `.env` lokal ke manifest publik, verifikasi URL, lalu dokumentasikan hasilnya

## Review Addendum (Publish Free GitHub APK Update Feed - 2026-04-27)

- Repo source `Zi-exa/sunan-notifier-mobile` memang masih private, jadi saya tidak memakainya langsung untuk raw manifest/update publik.
- Saya buat repo publik terpisah untuk distribusi gratis:
  - `https://github.com/Zi-exa/sunan-notifier-releases`
- Saya upload feed awal ke repo itu:
  - `update.json` publik di `https://raw.githubusercontent.com/Zi-exa/sunan-notifier-releases/main/update.json`
  - release tag `v1.0.0` dengan asset `app-release.apk`
- `.env` lokal mobile sekarang sudah diarahkan ke raw manifest publik itu, jadi checker APK manual bisa langsung bekerja pada runtime lokal Anda.
- Verifikasi akses:
  - manifest raw URL membalas `200`
  - asset APK release membalas redirect `302`, yang menandakan file release tersedia di GitHub

## Plan (Stabilize Local APK Build After Update Feed Setup - 2026-04-27)

- [x] 1. Kumpulkan log build lokal Android yang benar-benar menunjukkan titik macet, bukan hanya timeout kosong
- [x] 2. Identifikasi apakah hang berasal dari task Gradle/Metro/toolchain atau perubahan project terbaru, lalu perbaiki bila sumbernya bisa dikendalikan dari repo
- [x] 3. Jika build kembali stabil, refresh artefak release publik dan dokumentasikan hasilnya

## Review Addendum (Stabilize Local APK Build After Update Feed Setup - 2026-04-27)

- Timeout build yang saya lihat sebelumnya ternyata bukan hang Gradle di project, tetapi akibat cara saya menjalankan build lewat wrapper/logging background yang tidak menutup proses dengan baik.
- Build release Android yang dijalankan langsung dengan env Java/Android yang benar berhasil normal:
  - `gradlew.bat app:assembleRelease --console=plain --no-daemon`
  - hasil: `BUILD SUCCESSFUL in 1m 22s`
- Saya bump versi mobile dari `1.0.0` ke `1.0.1` agar feed update manual benar-benar memicu upgrade untuk user yang masih memasang APK `1.0.0`.
- APK baru berhasil dibuild di:
  - `mobile/android/app/build/outputs/apk/release/app-release.apk`
- Feed GitHub publik juga sudah di-refresh:
  - `update.json` sekarang menunjuk ke release `v1.0.1`
  - release aktif: `https://github.com/Zi-exa/sunan-notifier-releases/releases/tag/v1.0.1`

## Plan (Fix Settings Server Sync Fallback - 2026-04-27)

- [x] 1. Audit jalur save settings, `appUserId`, dan schema `user_settings` untuk menemukan kenapa save jatuh ke status lokal-only
- [x] 2. Perbaiki alur sinkronisasi agar bisa recovery jika `appUserId` belum tersimpan dan fallback elegan jika backend masih schema lama
- [x] 3. Verifikasi dengan `typecheck` dan `lint`, lalu dokumentasikan hasil dan commit

## Review Addendum (Fix Settings Server Sync Fallback - 2026-04-27)

- Akar masalahnya ada di dua jalur:
  - save settings ke Supabase gagal total jika backend `user_settings` masih schema lama dan belum punya kolom `notify_task_open`
  - app tidak punya recovery on-demand jika `appUserId` gagal tersimpan saat login pertama, jadi jalur sinkron server bisa buntu sampai user login ulang
- Perbaikan di mobile:
  - `mobile/lib/supabase/repositories.ts` sekarang fallback kompatibel:
    - save settings mencoba payload baru dulu
    - jika server menolak karena kolom `notify_task_open` belum ada, save diulang tanpa kolom itu
    - load remote settings juga fallback ke select schema lama agar sync startup tidak pecah
  - `mobile/lib/stores/settingsStore.ts` sekarang tidak menimpa `notifyTaskOpen` lokal jika backend lama belum mengirim field itu
  - `mobile/lib/stores/authStore.ts` sekarang punya `setAppUserId()` agar hasil `syncUserProfile()` bisa dipersist ke sesi aktif tanpa memaksa login ulang
  - `mobile/app/(tabs)/settings.tsx` sekarang mencoba memulihkan `appUserId` lewat `syncUserProfile()` sebelum menyerah ke mode lokal-only, dan dialog hasil save dibedakan antara:
    - sinkron penuh
    - sinkron server sebagian karena schema lama
    - hanya tersimpan di perangkat karena profil app/server belum siap
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Polish Remaining Status and Modal Copy - 2026-04-27)

- [x] 1. Audit sisa copy user-facing di status tugas, filter, legend kalender, dan modal tambahan yang masih memakai istilah teknis
- [x] 2. Sederhanakan istilah tersebut tanpa mengubah alur atau fungsi aplikasi
- [x] 3. Verifikasi, dokumentasikan hasil, lalu commit dan push

## Review Addendum (Polish Remaining Status and Modal Copy - 2026-04-27)

- Audit lanjutan menemukan istilah teknis yang masih lolos di area yang sering dilihat user:
  - status dan filter tugas seperti `Sudah Submit` dan `Belum Terverifikasi`
  - istilah campuran seperti `Quiz`, `Pending`, dan `Submit`
  - modal lama yang masih menampilkan daftar sprint internal
- Perubahan utama yang saya rapikan:
  - status/filter tugas sekarang memakai bahasa yang lebih sederhana seperti `Sudah Dikumpulkan` dan `Masih Dicek`
  - istilah `Quiz` saya seragamkan menjadi `Kuis`
  - legend kalender sekarang full Bahasa Indonesia
  - hero dashboard dipendekkan agar lebih natural
  - modal tambahan sekarang menampilkan ringkasan fungsi aplikasi, bukan milestone pengembangan internal
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Add Attendance Completed Label - 2026-04-27)

- [x] 1. Audit sumber data absensi untuk memastikan apakah status hadir user bisa diambil akurat dari SUNAN
- [x] 2. Tambahkan label `Sudah Absen` dengan jalur data yang aman dan fallback yang tidak merusak daftar absensi bila server menolak akses
- [x] 3. Verifikasi, dokumentasikan hasil, lalu commit dan push

## Review Addendum (Add Attendance Completed Label - 2026-04-27)

- Audit menemukan bahwa data absensi utama app selama ini hanya berasal dari event kalender dan upcoming view, jadi tidak ada flag bawaan yang mengatakan user sudah mengisi absensi.
- Plugin attendance Moodle ternyata punya web service resmi `mod_attendance_get_sessions` dan `attendance_log` per session, jadi saya pakai jalur itu sebagai sumber akurat bila SUNAN mengizinkannya.
- Perubahan utama:
  - `AttendanceItem` sekarang bisa membawa `attendanceInstanceId` dan `isMarked`
  - mapper absensi dari kalender sekarang menyimpan `event.instance` sebagai identitas instance attendance
  - query absensi sekarang mencoba mengambil daftar session per instance attendance, lalu mencocokkan session berdasarkan waktu mulai/durasi dan menandai `isMarked` jika `attendance_log` sudah berisi user aktif
  - UI card absensi sekarang menampilkan badge `Sudah Absen` bila status itu berhasil terdeteksi
- Fallback aman:
  - jika SUNAN menolak akses ke web service session attendance untuk role mahasiswa, daftar absensi tetap berjalan normal tanpa logout atau error tambahan
  - dalam kondisi itu badge `Sudah Absen` memang tidak tampil, karena app memilih tidak menebak status hadir user
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Add Attendance Web Report Fallback - 2026-04-27)

- [x] 1. Audit jalur autentikasi dan halaman attendance report SUNAN untuk menemukan fallback yang aman saat web service attendance tidak bisa diakses mahasiswa
- [x] 2. Implementasikan fallback best-effort yang mencoba membaca status hadir user dari halaman web SUNAN tanpa merusak flow absensi utama
- [x] 3. Verifikasi, dokumentasikan hasil, lalu commit dan push

## Review Addendum (Add Attendance Web Report Fallback - 2026-04-27)

- Audit plugin attendance Moodle menunjukkan `mod_attendance_get_session(s)` memang membawa `attendance_log` lengkap, tetapi capability-nya diarahkan ke dosen/pengambil absensi, jadi role mahasiswa sangat mungkin ditolak oleh SUNAN.
- Screenshot user membuktikan laporan kehadiran sendiri tetap tersedia lewat halaman web `mod/attendance/view.php?id=<cmid>`, jadi fallback yang paling aman adalah membaca laporan web itu, bukan menebak dari event kalender.
- Perubahan utama di mobile:
  - `client.ts` sekarang mencoba jalur attendance API lebih dulu seperti sebelumnya
  - jika masih ada sesi yang belum bisa ditandai dan `quickLink` attendance tersedia, app membaca kredensial SUNAN tersimpan, membangun sesi web, lalu mengambil halaman `view.php?id=<cmid>&view=5`
  - tabel laporan absensi dari HTML itu diparse untuk mengambil waktu sesi + status seperti `Present`, `Late`, `Absent`, `Excused`
  - hasilnya dipetakan ke badge yang lebih spesifik seperti `Hadir`, `Terlambat`, `Izin`, atau `Tidak Hadir`
- UI card absensi sekarang mendukung label mark yang lebih informatif, jadi jalur API dan jalur web fallback sama-sama masuk ke badge yang konsisten.
- Fallback aman:
  - kalau login web gagal, HTML SUNAN berubah, atau halaman report tidak bisa dibaca, daftar absensi utama tetap berjalan normal
  - app tidak mengubah flow absensi user dan tidak mencoba submit apa pun ke SUNAN
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Propagate Attendance Labels To History Filter - 2026-04-27)

- [x] 1. Audit filter absensi dan history store untuk menemukan kenapa label kehadiran tidak ikut muncul konsisten di `Semua` dan `Riwayat`
- [x] 2. Pindahkan enrichment status ke layer gabungan query + history agar session lama juga ikut ter-update dari report web
- [x] 3. Verifikasi, dokumentasikan hasil, lalu commit

## Review Addendum (Propagate Attendance Labels To History Filter - 2026-04-27)

- Akar masalahnya bukan di filter `Riwayat` sendiri, tetapi di titik enrichment:
  - fallback web report sebelumnya hanya dijalankan untuk sesi yang ikut query bulan aktif
  - item `Riwayat` banyak berasal dari `attendanceHistoryStore`, jadi sesi lama tidak ikut disentuh lagi oleh fallback itu
- Perbaikan:
  - `getAttendanceSessions()` sekarang fokus mengembalikan sesi hasil API + kalender
  - helper baru `hydrateAttendanceMarksFromWebReports()` dipindah ke layer yang bisa menerima daftar sesi gabungan
  - `useAttendanceSessionsQuery()` sekarang menjalankan enrichment web report setelah sesi baru digabung dengan history user
- Dampak perilaku:
  - badge status dari halaman report seperti `Hadir`, `Terlambat`, `Izin`, atau `Tidak Hadir` sekarang seharusnya bisa muncul di `Semua` maupun `Riwayat`
  - selama session attendance lama itu masih tersimpan di history app dan report web SUNAN masih membawanya
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Build Attendance History From Web Report Rows - 2026-04-27)

- [x] 1. Audit identity/merge rules untuk sesi absensi agar row laporan web bisa dipadankan dengan sesi kalender yang sama
- [x] 2. Implementasikan pembentukan item `Riwayat` baru dari report web SUNAN bila sesi tidak pernah tertangkap saat upcoming/open
- [x] 3. Verifikasi, dokumentasikan hasil, update lesson, lalu commit dan push

## Review Addendum (Build Attendance History From Web Report Rows - 2026-04-27)

- Akar gap yang tersisa ada di dua tempat:
  - key merge/history masih mengutamakan `eventId`, jadi sesi sintetis dari report web dan sesi asli dari kalender bisa dianggap item berbeda
  - fallback web report hanya memperkaya item yang sudah ada, belum membuat item riwayat baru untuk row report yang tidak punya pasangan dari source absensi utama
- Perbaikan:
  - key sesi absensi sekarang berbasis `quickLink + startsAt` bila tersedia, lalu fallback ke `attendanceInstanceId + startsAt`; baru setelah itu `eventId`
  - aturan key yang sama dipakai di merge absensi utama dan history store, jadi sesi sintetis dan sesi asli dengan waktu yang sama bisa bertemu di item yang sama
  - fallback report web sekarang bukan cuma memberi badge, tetapi juga bisa membuat item history sintetis dari row laporan SUNAN yang belum pernah tertangkap saat upcoming/open
- Dampak perilaku:
  - sesi yang pagi tadi sudah muncul sebagai `Present/Hadir` di laporan SUNAN punya peluang masuk ke `Riwayat`, selama app masih punya satu exemplar module/quickLink untuk attendance tersebut
  - `Semua` dan `Riwayat` sekarang sama-sama bisa menampilkan hasil report web, bukan hanya sesi query bulan aktif
- Batas yang masih ada:
  - jika sebuah module attendance sama sekali tidak pernah punya item yang berhasil masuk ke app, fallback ini belum punya anchor metadata untuk membangun item history-nya
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Fix Tabs Header Safe Area Collision - 2026-04-27)

- [x] 1. Audit stack header and edge-to-edge configuration to find why the tabs header ignores the Android top inset
- [x] 2. Apply the minimal native-stack safe-area fix so the tabs header always sits below the device status bar
- [x] 3. Verify with typecheck/lint, document the result, then commit and push

## Review Addendum (Fix Tabs Header Safe Area Collision - 2026-04-27)

- Akar masalahnya ada di kombinasi `android.edgeToEdgeEnabled=true` dan header native stack root:
  - di device tertentu, header tabs bisa dirender seolah status bar tidak translucent
  - akibatnya judul seperti `Absensi` terlihat masuk ke area jam/sinyal HP
- Perbaikan minimal:
  - `mobile/app/_layout.tsx` sekarang memaksa `statusBarTranslucent: true` di `Stack.screenOptions`
  - dengan itu native stack menghitung top inset header dengan benar untuk layar yang memakai header bawaan
- Dampak:
  - header tab utama seperti `Dashboard`, `Tugas`, `Absensi`, `Kalender`, dan `Settings` harus turun di bawah status bar pada device Android edge-to-edge
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Replace Native Tabs Header And Guard Expo Keep Awake - 2026-04-27)

- [x] 1. Replace the unstable native `(tabs)` stack header with a shared in-screen header that uses safe-area insets directly
- [x] 2. Guard Expo Go development runtime from the `expo-keep-awake` activation error with a local no-op shim
- [x] 3. Verify with typecheck/lint, document the result, then commit and push

## Review Addendum (Replace Native Tabs Header And Guard Expo Keep Awake - 2026-04-27)

- Root cause update:
  - the previous native-stack header tweak did not solve the overlap on the real device, so the unstable piece was the native `(tabs)` header itself under Android edge-to-edge
  - Expo Go also surfaced a separate runtime problem: Expo's dev wrapper tried to call `expo-keep-awake`, which failed on this device before the app could be used normally
- Perbaikan:
  - root stack header untuk `(tabs)` dimatikan, lalu setiap tab utama sekarang memakai header custom shared yang membaca safe-area inset langsung dari `react-native-safe-area-context`
  - header baru dipasang di `Dashboard`, `Tugas`, `Absensi`, `Kalender`, dan `Pengaturan`, jadi posisi judul tidak lagi bergantung pada perhitungan inset native-stack
  - Metro sekarang mengarahkan import `expo-keep-awake` ke shim no-op lokal agar Expo Go tidak lagi memunculkan error `Unable to activate keep awake`
- Dampak:
  - header tab utama harus tampil di bawah status bar secara konsisten, termasuk di Expo Go
  - error dev runtime `keep awake` tidak lagi memblok app saat dibuka untuk testing
- Verifikasi lulus:
  - `npm run typecheck`
  - `npm run lint`

## Plan (Fix Metro Start After Keep Awake Shim - 2026-04-27)

- [x] 1. Reproduce the `npm run start:tunnel:clear` crash and inspect whether the new Metro resolver shim is the source
- [x] 2. Add a safe Expo start fallback so the tunnel command recovers to LAN when Ngrok fails with the known `body` crash
- [x] 3. Verify Metro startup, document the regression and fix, then commit and push

## Review Addendum (Fix Metro Start After Keep Awake Shim - 2026-04-27)

- Audit showed the `Cannot read properties of undefined (reading 'body')` crash was specific to `expo start --tunnel`, not the app bundle itself:
  - `expo start --lan -c` booted Metro normally
  - the user-facing problem was that the existing tunnel command had no recovery path when Expo/Ngrok failed
- Perbaikan:
  - `mobile/scripts/start-expo.js` now runs the local Expo CLI directly through `node <expo-cli> start ...`
  - this avoids unstable `npx.cmd` spawning from a Node wrapper on Windows
  - `start:tunnel` and `start:tunnel:clear` in `mobile/package.json` now go through that wrapper
  - if tunnel startup hits the known Ngrok `body` crash, the wrapper automatically retries with `--lan`
- Verification:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run start:tunnel:clear` now starts Expo successfully on this machine

## Plan (Restore QR Output In Expo Start Wrapper - 2026-04-27)

- [x] 1. Adjust the Expo start wrapper so the first run still detects tunnel failure without hiding Expo's interactive QR output
- [x] 2. Keep the tunnel-to-LAN fallback, but let the fallback LAN process own the terminal fully so QR and prompts render normally
- [ ] 3. Verify the wrapper script syntax/behavior, document the regression, then commit and push

## Review Addendum (Restore QR Output In Expo Start Wrapper - 2026-04-27)

- Akar regresinya ada di stdio wrapper:
  - wrapper sebelumnya mem-pipe `stdout` Expo ke process Node sendiri
  - Expo lalu tidak melihat terminal sebagai TTY interaktif, sehingga QR dan UI interaktif tidak muncul walau Metro sebenarnya hidup
- Perbaikan:
  - run pertama sekarang memakai `stdout: inherit` dan hanya menangkap `stderr` saat mode tunnel
  - dengan itu Expo tetap bisa merender QR/prompt di terminal, sementara wrapper masih bisa mendeteksi crash Ngrok dari `stderr`
  - bila tunnel gagal, run kedua `--lan` memakai `stdio: inherit` penuh agar proses fallback sepenuhnya interaktif

## Plan (Publish Production EAS Update For User-Facing Fixes - 2026-04-27)

- [x] 1. Verify the current runtime/channel assumptions so the published update targets installed `1.0.1` users safely
- [x] 2. Publish an EAS Update on the `production` branch for the recent user-facing JS/UI fixes
- [x] 3. Record the release result in task notes, then report the publish details back to the user

## Review Addendum (Publish Production EAS Update For User-Facing Fixes - 2026-04-27)

- Channel/runtime audit confirmed the installed public app is still on runtime `1.0.1`, so the recent JS/UI fixes are safe to ship through `EAS Update` without a new APK.
- Published to branch `production` with message:
  - `Perbaikan absensi, header tab, dan stabilitas UI`
- Publish result:
  - update group ID: `2a8bce0f-9bdd-4830-9698-135b4645c08e`
  - Android update ID: `019dcfc8-dc65-76c9-bafe-edd9d535bbe2`
  - iOS update ID: `019dcfc8-dc65-7792-837f-4665d5fd64bd`
  - dashboard: `https://expo.dev/accounts/azhurel/projects/sunan-notifier/updates/2a8bce0f-9bdd-4830-9698-135b4645c08e`
- User effect:
  - installed `1.0.1` users should receive the in-app EAS update prompt on next app launch when online, as long as the manual APK checker does not override it with a newer binary update first.

## Plan (Verify In-App Update Prompt Visibility - 2026-04-27)

- [x] 1. Audit the update coordinator flow to confirm whether installed `1.0.1` users will hit the EAS prompt or get short-circuited by the manual APK checker
- [x] 2. Verify the live manual update manifest and local Expo config/runtime assumptions used by the prompt logic
- [ ] 3. Document the result, including any gating conditions the user must satisfy to see the prompt

## Plan (Fix EAS Update Prompt In Local Release APK - 2026-04-27)

- [x] 1. Fix the Expo app config so locally generated preview/production binaries embed the correct `expo-updates` enabled flag and channel request headers
- [x] 2. Regenerate the Android project for the production profile and verify the release manifest/runtime metadata now matches `1.0.1` + `production`
- [x] 3. Run verification, document the root cause and fix, then commit and push both repos

## Review Addendum (Verify In-App Update Prompt Visibility - 2026-04-27)

- Audit result:
  - the manual APK manifest at `EXPO_PUBLIC_UPDATE_MANIFEST_URL` currently reports version `1.0.1`, which matches the installed public APK version, so the APK updater path correctly stays silent
  - `AppUpdateCoordinator` only checks `expo-updates` after the manual APK path returns no newer binary
  - `fetchAvailableEasUpdateAsync()` is intentionally disabled in Expo Go and other dev runtimes, so the EAS prompt never appears there by design
- Root cause:
  - the locally built Android binary had stale native metadata from an old generated `android/` folder
  - `android/app/src/main/AndroidManifest.xml` embedded `expo.modules.updates.ENABLED=false`
  - no `expo-channel-name` request header was embedded in the binary, so the production branch update could not be targeted reliably even though it had already been published
- User impact:
  - the already-installed old APK cannot receive the published EAS update; it needs one fresh APK install built from the corrected native config first

## Review Addendum (Fix EAS Update Prompt In Local Release APK - 2026-04-27)

- Fix applied in source of truth:
  - `mobile/app.config.js` now explicitly sets `updates.enabled=true` and injects `updates.requestHeaders['expo-channel-name']` from `EAS_BUILD_PROFILE`
  - `mobile/package.json` local release scripts now force a production prebuild before Gradle, so they stop reusing stale `android/` metadata
- Verification after regeneration:
  - production Expo config resolves to `updates.enabled=true` and `requestHeaders.expo-channel-name=production`
  - regenerated `android/app/src/main/AndroidManifest.xml` now contains:
    - `expo.modules.updates.ENABLED=true`
    - `expo.modules.updates.EXPO_UPDATE_URL=https://u.expo.dev/eb508cc1-ec67-415f-a234-bb2cdf068286`
    - `expo.modules.updates.UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY={"expo-channel-name":"production"}`
  - regenerated Android resources now contain `expo_runtime_version=1.0.1`
  - `android/app/build.gradle` now resolves to `versionName "1.0.1"`
- Release verification:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run prebuild:android:production`
  - `gradlew.bat app:assembleRelease` with explicit `JAVA_HOME` and Android SDK env vars
  - fresh APK output: `mobile/android/app/build/outputs/apk/release/app-release.apk` at `2026-04-28 00:03:43`
- Final user condition:
  - Expo Go will still never show the EAS prompt
  - a fresh production APK built after this fix should be able to receive the already-published EAS update group `2a8bce0f-9bdd-4830-9698-135b4645c08e`

## Plan (Prepare Fresh APK And Publish EAS Update Test - 2026-04-28)

- [x] 1. Verify the freshly built local APK is the post-fix binary that embeds `expo-updates` for runtime `1.0.1`
- [x] 2. Publish a new production EAS update test so the corrected APK has a promptable update to fetch
- [x] 3. Document the exact install/test path for the user, then commit and push the task notes

## Review Addendum (Prepare Fresh APK And Publish EAS Update Test - 2026-04-28)

- Baseline APK verification:
  - fresh local release APK exists at `mobile/android/app/build/outputs/apk/release/app-release.apk`
  - file size/time after rebuild: `80307673` bytes at `2026-04-28 00:03:43`
  - generated Android manifest for that APK confirms:
    - `expo.modules.updates.ENABLED=true`
    - `expo.modules.updates.EXPO_RUNTIME_VERSION=@string/expo_runtime_version`
    - `expo.modules.updates.UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY={"expo-channel-name":"production"}`
- Published a dedicated production EAS update test on top of the corrected binary:
  - message: `Tes update in-app setelah perbaikan APK`
  - update group ID: `4e66c8d0-89f9-488a-848f-5adf922bc129`
  - Android update ID: `019dcfeb-ab78-7837-9cbe-f79427f1905f`
  - iOS update ID: `019dcfeb-ab78-7484-9230-5ee0ee6e0ab1`
  - dashboard: `https://expo.dev/accounts/azhurel/projects/sunan-notifier/updates/4e66c8d0-89f9-488a-848f-5adf922bc129`
- Exact user test path:
  - uninstall APK lama bila perlu
  - install APK baru hasil build `2026-04-28 00:03:43`
  - buka app saat online
  - karena manifest APK manual masih di versi `1.0.1`, jalur APK updater akan diam lalu app lanjut mengecek EAS
  - jika `expo-updates` sudah aktif benar di binary, dialog `Versi baru siap dipakai` harus muncul
- Known non-test paths:
  - Expo Go tetap tidak akan menampilkan prompt EAS
  - APK lama yang dibuild sebelum fix ini tetap tidak akan bisa menerima update EAS
