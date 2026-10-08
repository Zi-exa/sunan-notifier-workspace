# Todo

## 2026-08-27 - Debug callgraph notifikasi

- [x] Baca callgraph notifikasi dan tentukan simpul yang berisiko.
- [x] Periksa log runtime `send-push` terbaru dan antrean notifikasi.
- [x] Perbaiki race condition pengambilan antrean dan error FCM OAuth clock skew.
- [x] Verifikasi database, fungsi backend, dan perilaku pengirim tanpa membuat spam notifikasi.
- [x] Dokumentasikan hasil, commit, dan push.

### Review

- Callgraph menempatkan risiko pada jalur `send-push -> tabel_antrian_notifikasi -> deliverPush -> FCM`, bukan di UI card atau navigation.
- `send-push` sekarang mengambil antrean lewat RPC atomik `klaim_antrian_notifikasi`, sehingga dua worker tidak bisa mengirim row yang sama bersamaan.
- FCM JWT sekarang dibuat dengan `iat` mundur 60 detik untuk menghindari error clock skew `JWT issued at future`.
- Android FCM diberi tag stabil `sunan-notification-{row.id}` agar retry FCM mengganti notifikasi yang sama, bukan menambah salinan baru.
- Verifikasi lulus: migrasi remote sudah ada, fungsi `send-push` ter-deploy, pemicu kosong menghasilkan `queued:0 sent:0 failed:0`, uji FCM palsu menghasilkan error token tidak valid, dan `supabase db lint --linked --level error` bersih.

## 2026-06-10 - Investigasi tes absensi terkirim ulang

- [x] Audit row antrean dan waktu pengiriman tes absensi.
- [x] Audit log pemanggilan `send-push` dan jumlah perangkat aktif.
- [x] Audit handler notifikasi mobile untuk presentasi ganda.
- [x] Terapkan perbaikan akar masalah dan verifikasi.
- [x] Dokumentasikan hasil, commit, dan push.

### Review

- Database hanya memiliki satu row `Tes Notifikasi Absensi` dan satu waktu pengiriman; aplikasi mobile tidak menjadwalkan ulang notifikasi tes tersebut.
- Celah duplikasi berada di `send-push`: dua eksekusi yang berdekatan dapat membaca row belum terkirim yang sama sebelum salah satunya menyimpan status akhir.
- Antrean sekarang diklaim atomik memakai `FOR UPDATE SKIP LOCKED`; claim kedaluwarsa setelah 5 menit agar row dapat dipulihkan jika worker berhenti.
- Uji claim membuktikan row yang sudah diklaim tidak diambil lagi. Tidak ada claim aktif yang tertinggal setelah verifikasi.

## 2026-06-10 - Verifikasi notifikasi tugas

- [x] Periksa antrean dan status pengiriman notifikasi tugas terbaru.
- [x] Pastikan akun menggunakan satu token FCM aktif.
- [x] Kirim satu notifikasi uji tugas dan periksa hasil pengirimannya.
- [x] Dokumentasikan hasil, commit, dan push.

### Review

- Akun menggunakan satu token FCM aktif; seluruh token Expo lama sudah nonaktif.
- Kegagalan notifikasi tugas lama berasal dari jalur Expo sebelum migrasi token FCM.
- Pengingat `task_closing` mendatang tetap terjadwal untuk 12 dan 17 Juni 2026.
- Uji `Tes Notifikasi Tugas` berhasil dikirim pada 10 Juni 2026 pukul 09.11 WIB tanpa error.

## 2026-06-10 - Perbaiki notifikasi absensi tidak muncul

- [x] Audit polling SUNAN, antrean absensi, cron pengiriman, dan perangkat aktif.
- [x] Identifikasi akar masalah notifikasi absensi.
- [x] Terapkan perbaikan minimal pada backend dan registrasi token Android.
- [x] Deploy dan uji pembentukan antrean memakai data SUNAN nyata.
- [x] Verifikasi typecheck, lint, migration, EAS Update, database, dan log runtime.
- [x] Tulis review hasil, commit, dan push perubahan.

### Review

- Polling sehat dan mendeteksi 5 event absensi masa depan, tetapi sebelumnya tidak pernah ada row `attendance_*`.
- Akar masalah antrean: `.insert()` mengabaikan opsi dedupe dan satu key lama menggagalkan seluruh batch. Fungsi sekarang memakai `.upsert()` dan error antrean tidak lagi ditelan.
- Index dedupe diubah dari partial unique menjadi full unique agar kompatibel dengan `ON CONFLICT`; nilai `NULL` tetap boleh berulang di PostgreSQL.
- Backend sekarang menjadwalkan absensi H-1, 1 jam sebelum buka, saat buka, dan 30 menit sebelum tutup sejak event pertama kali ditemukan.
- Uji polling nyata berhasil membuat 19 row absensi. Jadwal terdekat 10 Juni 2026: 12.00, 13.00, dan 15.00 WIB.
- Android sekarang memprioritaskan token FCM native karena delivery Expo token sebelumnya gagal mengambil kredensial FCM.
- EAS Update production `ff2782cf-c86a-4076-90a5-4b2d962324a4` sudah diterbitkan untuk runtime `1.0.1`.
- Aplikasi berhasil mendaftarkan token FCM native pada 10 Juni 2026 pukul 08.48 WIB; token Expo lama untuk akun yang sama sudah dinonaktifkan.
- Uji `Tes Notifikasi Absensi` berhasil dikirim melalui FCM pada 10 Juni 2026 pukul 08.59 WIB tanpa error.

## 2026-06-06 - Ubah nama tabel dan kolom Supabase ke Bahasa Indonesia

- [x] Audit seluruh referensi schema aktif di Edge Function dan aplikasi mobile.
- [x] Tetapkan mapping nama teknis snake_case sesuai format yang disetujui.
- [x] Buat migration atomik untuk rename tabel, kolom, sequence, constraint, index, dan trigger.
- [x] Update seluruh Edge Function dan dokumentasi teknis aktif.
- [x] Terapkan migration dan deploy fungsi backend terkait.
- [x] Verifikasi schema, data, RLS, function, typecheck, dan lint.
- [x] Commit dan push perubahan tanpa memasukkan file lama yang tidak terkait.

### Review

- Enam tabel operasional dan seluruh kolom teknis sudah memakai nama Bahasa Indonesia tanpa menyalin atau menghapus data.
- RLS tetap aktif dan dipaksa pada semua tabel; hanya `service_role` yang memiliki akses tabel langsung.
- Edge Function `mobile-data`, `poll-sunan-data`, `daily-reminder`, dan `send-push` sudah memakai schema baru dan berstatus aktif.
- Uji polling nyata selesai dengan status `completed`: 4 user diproses, 61 snapshot diperbarui, dan 7 event absensi terdeteksi.
- Verifikasi lulus: migration transaction test, `db push`, database advisors, query schema/data/grant, `npm run typecheck`, dan `npm run lint`.

## 2026-06-05 - Bersihkan notifikasi akun lama di device yang sama

- [x] Audit device/token aktif lintas akun di Supabase.
- [x] Fix backend agar token/device pindah ke akun login terbaru.
- [x] Tambahkan cleanup device saat logout.
- [x] Bersihkan jadwal notifikasi lokal saat akun aktif berubah.
- [x] Verifikasi typecheck, lint, migration, deploy, dan query device.
- [x] Tulis ringkasan review hasil perubahan.

## 2026-06-04 - Perbaiki dobel notifikasi deadline tugas

- [x] Audit sumber notifikasi deadline tugas lokal dan backend.
- [x] Samakan dedupe key deadline antara `poll-sunan-data` dan `daily-reminder`.
- [x] Cegah scheduler lokal deadline berjalan saat push backend masih sinkron.
- [x] Bersihkan antrean deadline lama yang dobel.
- [x] Verifikasi typecheck, lint, deploy function, dan query queue.
- [x] Tulis ringkasan review hasil perubahan.

## 2026-06-04 - Perbaiki keyboard menutup password login

- [x] Audit layout login saat keyboard Android muncul.
- [x] Tambahkan keyboard handling agar kolom password tetap terlihat.
- [x] Verifikasi lint dan typecheck.
- [x] Tulis ringkasan review hasil perubahan.

## 2026-06-04 - Tunda pertanyaan simpan akun login

- [x] Audit flow prompt simpan akun di halaman login.
- [x] Ubah prompt agar baru muncul setelah user menekan tombol Masuk SUNAN.
- [x] Pastikan sugest akun tersimpan tetap muncul hanya setelah kolom disentuh.
- [x] Verifikasi lint dan typecheck.
- [x] Tulis ringkasan review hasil perubahan.

## 2026-06-03 - Activity diagram aplikasi

- [x] Buat activity diagram Mermaid sederhana.
- [x] Render activity diagram ke PNG/SVG.
- [x] Verifikasi hasil render dan dokumentasikan review.

## 2026-06-03 - Perbaiki notifikasi dobel dan icon notifikasi

- [x] Audit jalur notifikasi lokal, push backend, dan konfigurasi icon Android.
- [x] Cegah overlap local notification dengan remote push untuk jenis yang sama.
- [x] Bersihkan token perangkat lama agar satu perangkat tidak menerima push dobel.
- [x] Tambahkan icon aplikasi untuk notifikasi Android.
- [x] Verifikasi lint, typecheck, dan deploy backend yang berubah.
- [x] Tulis ringkasan review hasil perubahan.

## 2026-06-03 - Sequence diagram aplikasi

- [x] Audit struktur aplikasi dan alur runtime utama.
- [x] Buat sequence diagram Mermaid berbasis kode.
- [x] Verifikasi diagram terhadap source dan dokumentasikan hasil review.

## 2026-06-03 - Sederhanakan sequence diagram

- [x] Catat koreksi keterbacaan diagram di lessons.
- [x] Sederhanakan sequence diagram agar mudah dibaca.
- [x] Render ulang PNG/SVG dan verifikasi hasil.

## 2026-06-02 - Tambah reminder absensi sebelum buka

- [x] Audit scheduler notifikasi absensi yang aktif saat ini.
- [x] Tambahkan reminder absensi H-1 dan 1 jam sebelum buka.
- [x] Pastikan tap notifikasi baru diarahkan ke filter absensi yang benar.
- [x] Verifikasi lint dan typecheck setelah perubahan.
- [x] Tulis ringkasan review hasil perubahan.

## 2026-06-02 - Rapikan flow simpan akun di login

- [x] Audit ulang flow pilihan simpan akun setelah koreksi user.
- [x] Ubah prompt agar hilang setelah user memilih Ya/Tidak.
- [x] Tampilkan sugest akun tersimpan hanya setelah kolom login disentuh.
- [x] Verifikasi lint dan typecheck setelah perubahan.
- [x] Tulis ringkasan review hasil perbaikan.

## 2026-06-02 - Pilihan simpan kredensial di login

- [x] Audit flow login dan penyimpanan kredensial yang aktif saat ini.
- [x] Ubah login agar simpan NIM/password menjadi pilihan eksplisit user.
- [x] Tampilkan sugest akun tersimpan hanya saat opsi simpan aktif.
- [x] Verifikasi lint dan typecheck setelah perubahan.
- [x] Tulis ringkasan review hasil perubahan.

## 2026-06-02 - Batalkan APK kedua, jadikan APK utama tanpa mark

- [x] Audit perubahan sementara dari percobaan varian APK kedua.
- [x] Rollback profile, package id, channel, dan script build untuk APK kedua.
- [x] Hilangkan mark dari APK utama di halaman Pengaturan.
- [x] Verifikasi lint dan typecheck setelah perubahan.
- [x] Tulis ringkasan review hasil rollback.

## 2026-06-02 - Perbaikan notifikasi tugas dan absensi

- [x] Audit alur notifikasi lokal dan backend yang aktif di aplikasi.
- [x] Perbaiki scheduling lokal agar notifikasi tidak baru muncul saat app dibuka.
- [x] Verifikasi lint dan typecheck setelah perubahan.
- [x] Tulis ringkasan hasil review.

## Review

- Notifikasi absen mata kuliah milik akun lain paling mungkin berasal dari jadwal notifikasi lokal yang tersisa di HP setelah akun teman pernah login, bukan dari device aktif Supabase saat ini.
- Perbaikan mobile:
  - jadwal notifikasi lokal SUNAN dibatalkan saat logout atau session expired.
  - app menyimpan owner jadwal notifikasi lokal; kalau akun aktif berubah, semua jadwal lokal lama dibatalkan dan dedupe notification direset.
  - `deactivate-device` dipanggil saat logout agar row device akun lama tidak tetap aktif di Supabase.
- Perbaikan backend:
  - `upsert-device` sekarang memakai konflik `expo_push_token`, sehingga token perangkat yang sama pindah ke akun login terbaru.
  - device key aktif dibuat unik lintas akun, dan row device lama dengan device key sama dinonaktifkan.
- Verifikasi:
  - `npm run typecheck`
  - `npm run lint`
  - `npx supabase db push`
  - `npx supabase functions deploy mobile-data`
  - query device key aktif lintas akun menghasilkan `rows: []`
  - index `uq_user_devices_active_device_key` terpasang
- Root cause dobel deadline tugas ada di backend: `poll-sunan-data` dan `daily-reminder` sama-sama membuat `deadline_h1`/`deadline_today`, tapi memakai `dedupe_key` berbeda (`h1/today-*` vs `daily-*`), sehingga unique index tidak menganggapnya duplikat.
- Perbaikan backend:
  - `poll-sunan-data` dan `daily-reminder` sekarang memakai format canonical yang sama: `deadline-h1-*` dan `deadline-today-*`.
  - Migration cleanup menghapus pending deadline dobel lama dan menormalisasi key yang tersisa.
- Perbaikan mobile:
  - local task notification sekarang tidak berjalan saat push backend masih `idle`, `syncing`, atau `ready`.
  - fallback lokal baru berjalan saat push benar-benar `unavailable` atau `error`.
- Verifikasi:
  - `npm run typecheck`
  - `npm run lint`
  - `npx supabase db push`
  - `npx supabase functions deploy poll-sunan-data`
  - `npx supabase functions deploy daily-reminder`
  - query pending duplicate deadline menghasilkan `rows: []`
  - query pending deadline key menunjukkan `old_keys: 0`
- Halaman login sekarang memakai `KeyboardAvoidingView` mode `height` di Android agar area form mengecil saat keyboard terbuka.
- Saat kolom password fokus di Android, ScrollView otomatis scroll ke bagian bawah form sehingga kolom password dan tombol login tidak tertutup keyboard.
- Perubahan ini JS-only, jadi bisa dikirim lewat EAS Update tanpa APK baru.
- Verifikasi:
  - `npm run typecheck`
  - `npm run lint`
- Prompt simpan akun di halaman login sekarang tidak muncul saat halaman pertama kali dibuka.
- Jika user belum pernah memilih preferensi simpan akun, tombol `Masuk ke SUNAN` menampilkan prompt terlebih dulu.
- Setelah user memilih `Ya` atau `Tidak`, login langsung dilanjutkan memakai pilihan tersebut.
- Sugest akun tersimpan tetap hanya muncul saat preferensi simpan akun aktif, ada akun tersimpan, dan user menyentuh kolom NIM/password.
- Verifikasi:
  - `npm run typecheck`
  - `npm run lint`
- Activity diagram aplikasi dibuat di `reports/activity_sunan_notifier.mmd`.
- Diagram activity menampilkan keputusan utama: session login, validasi login, aplikasi aktif/background, ada perubahan data SUNAN, dan jenis notifikasi yang dibuka.
- Render hasil activity diagram tersedia di:
  - `reports/diagram-activity.png`
  - `reports/diagram-activity.svg`
- Verifikasi:
  - `npx -y @mermaid-js/mermaid-cli -i reports\activity_sunan_notifier.mmd -o reports\diagram-activity.png`
  - `npx -y @mermaid-js/mermaid-cli -i reports\activity_sunan_notifier.mmd -o reports\diagram-activity.svg`
- Root cause dobel notifikasi paling mungkin berasal dari dua jalur aktif sekaligus: local notification yang dijadwalkan app dan remote push dari Supabase/FCM. Selain itu, token lama di `user_devices` bisa tetap aktif setelah token perangkat berubah.
- Perbaikan mobile:
  - jika push token sudah `ready`, local scheduler membatalkan jadwal untuk jenis yang sudah ditangani remote push (`new_task`, deadline, `task_open`, `task_closing`, `attendance_open`, `attendance_closing`).
  - reminder absensi lokal yang belum ada di backend (`attendance_h1`, `attendance_preopen`) tetap aktif.
  - jadwal lokal baru diberi identifier stabil agar lebih mudah dibatalkan dan tidak menumpuk.
- Perbaikan backend:
  - `user_devices` sekarang punya `device_key`.
  - `mobile-data` meng-upsert perangkat berdasarkan `app_user_id + device_key` dan menonaktifkan token legacy tanpa `device_key` untuk platform yang sama.
- Icon notifikasi Android ditambahkan lewat asset `notification-icon.png` dan konfigurasi `expo-notifications`. Perubahan icon butuh APK baru karena masuk native config.
- Verifikasi:
  - `npm run typecheck`
  - `npm run lint`
  - `npx expo config --json`
  - `npx supabase db push`
  - `npx supabase functions deploy mobile-data`
  - `npx supabase db query --linked ...` untuk memastikan kolom `device_key` sudah ada.
- Sequence diagram aplikasi dibuat di `reports/sequence_sunan_notifier.mmd`.
- Diagram disederhanakan agar mudah dibaca: 5 komponen utama, yaitu Mahasiswa, Aplikasi Mobile, SUNAN/Moodle API, Supabase Backend, dan Expo Push/FCM.
- Alur yang ditampilkan sekarang fokus pada login, pendaftaran device, pengambilan data SUNAN, polling backend 15 menit, pengiriman push notification, dan navigasi dari notifikasi.
- Render hasil diagram tersedia di:
  - `reports/diagram-sequence.png`
  - `reports/diagram-sequence.svg`
- Verifikasi:
  - `npx -y @mermaid-js/mermaid-cli -i reports\sequence_sunan_notifier.mmd -o reports\diagram-sequence.png`
  - `npx -y @mermaid-js/mermaid-cli -i reports\sequence_sunan_notifier.mmd -o reports\diagram-sequence.svg`
- Notifikasi absensi sekarang punya empat momen: H-1, 1 jam sebelum buka, saat dibuka, dan 30 menit sebelum ditutup.
- Reminder H-1 dan 1 jam sebelum buka ikut memakai toggle `Notifikasi Absensi` yang sama; belum ada toggle terpisah agar perubahan tetap sederhana.
- Tap notifikasi absensi H-1 dan 1 jam sebelum buka sekarang diarahkan ke tab `Absensi` dengan filter `Akan Datang`, sedangkan notifikasi buka/tutup tetap ke filter yang relevan.
- Verifikasi:
  - `npm run typecheck`
  - `npm run lint`
- Prompt pilihan simpan akun sekarang hanya tampil sampai user memilih `Ya` atau `Tidak`, lalu langsung hilang.
- Sugest akun tersimpan tidak muncul otomatis lagi; sekarang baru muncul setelah user menyentuh kolom NIM atau password.
- Preferensi simpan akun sekarang dipersist terpisah, jadi flow login berikutnya tetap konsisten dengan pilihan user.
- Verifikasi:
  - `npm run typecheck`
  - `npm run lint`
- Flow login tidak lagi mengisi NIM/password otomatis dari kredensial tersimpan.
- User sekarang memilih eksplisit apakah akun ingin disimpan di perangkat. Jika opsi dimatikan, kredensial tersimpan langsung dihapus dari perangkat.
- Sugest akun tersimpan hanya muncul saat opsi simpan aktif dan memang ada kredensial yang pernah disimpan.
- Verifikasi:
  - `npm run typecheck`
  - `npm run lint`
- Varian APK kedua dibatalkan atas arahan user. Jalur yang tersisa harus kembali sederhana: satu APK utama, tanpa mark di Pengaturan, tanpa pemisahan package/channel tambahan.
- Perubahan final yang dipertahankan hanya:
  - hapus mark proyek dari `Pengaturan > About` pada APK utama
  - kembalikan konfigurasi Expo/EAS ke satu jalur build utama
- Verifikasi rollback:
  - `npm run typecheck`
  - `npm run lint`
- Root cause utama ada di fallback lokal:
  - `new_task` menganggap semua tugas yang pertama kali terlihat app sebagai tugas baru, sehingga notifikasi bisa muncul massal saat app dibuka.
  - `task_open` belum dijadwalkan di muka; notifikasi baru dikirim saat app melihat tugas sudah dibuka.
  - `attendance_closing` juga belum dijadwalkan di muka; notifikasi baru dikirim saat app masuk ke jendela 30 menit terakhir.
- Perbaikan:
  - tambah baseline dedupe untuk tugas yang sudah ada agar tugas lama tidak diperlakukan sebagai tugas baru.
  - jadwalkan `task_open` langsung ke `openDate` ketika event masih di masa depan.
  - jadwalkan `attendance_closing` langsung ke `closesAt - 30 menit`.
  - sempitkan fallback immediate ke jendela recovery singkat agar app tidak memuntahkan notifikasi lama saat baru dibuka.
- Verifikasi:
  - `npm run typecheck`
  - `npm run lint`

## 2026-08-19 — Whole-Application Static Callgraph

- [x] Scope production runtime: Expo Router mobile app, reusable mobile components/hooks/stores, Moodle/Supabase/notification/update adapters, Android lifecycle, Supabase Edge Functions, SQL RPC/cron/database flows.
- [ ] Extract every runtime function/callback and resolve intra-module, imported, JSX-render, dependency, data/value, and error-path edges.
- [ ] Generate a single static Tailwind HTML artifact with a modern dark theme, overview process map, searchable/filterable detailed graph, node inspector, legend, and methodology/scope notes.
- [ ] Verify source coverage, node/edge integrity, HTML structure/JavaScript syntax, and browser rendering.

### Acceptance criteria

- Every authored production runtime source file is represented or explicitly listed as declaration-only/excluded.
- Function nodes carry source path/line, signature, role/category, and source excerpt where available.
- Edges distinguish direct calls, implicit JSX rendering, callback registration, data/value flow, dependencies, and failures/recovery.
- High-level mobile → Moodle/Supabase → database/queue → push → mobile process remains readable despite full-detail coverage.
- Artifact opens without a build step and remains usable as one HTML file.

## 2026-10-03 — Keandalan pengaturan dan notifikasi

- [x] Tetapkan kontrak jam diam: aktif opsional, zona waktu Asia/Jakarta, dan pengiriman ditunda sampai jam selesai.
- [x] Perbaiki UI pengaturan agar kegagalan sinkronisasi tidak ditampilkan sebagai sukses.
- [x] Simpan dan muat jam diam melalui aplikasi, Edge Function, dan skema Supabase.
- [x] Terapkan jam diam ke jalur push dan fallback notifikasi lokal.
- [x] Ubah antrean push menjadi retryable dengan backoff, batas percobaan, dan penanganan token perangkat tidak valid.
- [x] Tambahkan tes regresi untuk logika waktu/retry serta verifikasi typecheck, lint, dan migration SQL.

### Review

- Implementasi: jam diam WIB diterapkan untuk push dan fallback lokal; antrean push kini retry hingga lima percobaan dengan backoff 15/30/60/120 menit.
- Verifikasi lulus: `npm run test:notification-policy`, `npm run typecheck`, `npm run lint`, dan `npx deno check supabase/functions/mobile-data/index.ts supabase/functions/send-push/index.ts`.
- Supabase: `npx supabase db lint --linked --level error` tidak menemukan error schema; `npx supabase db push --dry-run` mengenali migrasi baru. Deploy/migrasi nyata belum dijalankan.

## 2026-10-03 — Aktivasi produksi notifikasi

- [x] Verifikasi target Supabase produksi. Kanal EAS belum dapat diverifikasi karena sesi Expo tidak tersedia.
- [x] Terapkan migrasi `20261003000000_add_quiet_hours_and_notification_retry.sql` ke Supabase produksi.
- [x] Deploy Edge Function `mobile-data` dan `send-push`.
- [x] Publikasikan update JavaScript mobile ke kanal EAS `production`.
- [x] Verifikasi status migrasi dan Functions produksi.

### Review

- Backend produksi aktif: migrasi `20261003000000` sudah tercatat; `mobile-data` v8 dan `send-push` v14 berstatus `ACTIVE`.
- `npx supabase db lint --linked --level error` lulus dan kolom retry terverifikasi ada di database produksi.
- Update Android dipublikasikan ke kanal `production` pada runtime `1.0.1`: grup `1abeb8b3-6a1e-452c-92ca-936349053291`, update Android `01a101c0-d84e-75b7-81a5-2882421e544c`.
- `npx eas channel:view production` mengonfirmasi kanal production menunjuk ke grup update baru.

## 2026-10-03 — Penyederhanaan kartu Dashboard

- [x] Audit kartu Dashboard dan identifikasi copy yang berulang atau terlalu panjang.
- [x] Ringkas copy menjadi judul, status utama, dan konteks singkat tanpa menghilangkan informasi penting.
- [x] Verifikasi tampilan Dashboard serta jalankan typecheck dan lint.

### Review

- Dashboard tidak lagi menampilkan eyebrow/subtitle hero yang berulang; hero kini fokus pada salam pengguna dan status aktif.
- Kartu tugas Dashboard menyembunyikan preview deskripsi, tetapi preview tetap tersedia pada halaman Tugas dan Kalender melalui prop `showPreview` default `true`.
- Copy state kosong/loading dipadatkan tanpa menghapus status penting.
- Verifikasi lulus: `npm run typecheck`, `npm run lint`, `git -C mobile diff --check`, dan `npx expo export --platform android`.
- Browser lokal tidak dapat diinisialisasi oleh lingkungan alat, sehingga pemeriksaan visual dilakukan melalui review diff dan bundling Android.

## 2026-10-03 — Rilis penyederhanaan Dashboard

- [x] Verifikasi sesi Expo, channel production, dan perubahan yang siap dirilis.
- [x] Publikasikan EAS Update Android ke channel `production`.
- [x] Verifikasi channel menunjuk ke grup update baru.

### Review

- `npm run typecheck`, `npm run lint`, dan `git diff --check` lulus sebelum rilis.
- Update Android dipublikasikan pada runtime `1.0.1`: grup `ba722005-5b9c-4797-b8a6-0abc6f5187ed`, update `01a101cc-a14b-7d18-87c6-81398772d5c2`.
- `npx eas channel:view production` mengonfirmasi channel production menunjuk ke grup baru dengan pesan `Sederhanakan kartu Dashboard`.

## 2026-10-03 — Sapaan Dashboard memakai nama

- [ ] Audit aliran data profil dari login hingga Dashboard untuk membedakan NIM dan nama.
- [ ] Perbaiki sapaan agar memakai nama profil dengan fallback yang aman.
- [ ] Verifikasi typecheck, lint, dan kasus fallback tanpa nama.

### Review

- Menunggu audit data profil dan implementasi.
