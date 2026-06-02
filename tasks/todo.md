# Todo

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
