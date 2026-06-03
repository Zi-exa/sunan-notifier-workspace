# Todo

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

## 2026-06-03 - Perbaiki notifikasi dobel dan icon notifikasi

- [x] Audit jalur notifikasi lokal, push backend, dan konfigurasi icon Android.
- [x] Cegah overlap local notification dengan remote push untuk jenis yang sama.
- [x] Bersihkan token perangkat lama agar satu perangkat tidak menerima push dobel.
- [x] Tambahkan icon aplikasi untuk notifikasi Android.
- [x] Verifikasi lint, typecheck, dan deploy backend yang berubah.
- [x] Tulis ringkasan review hasil perubahan.

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
