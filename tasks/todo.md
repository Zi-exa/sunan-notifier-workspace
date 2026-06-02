# Todo

## 2026-06-02 - Perbaikan notifikasi tugas dan absensi

- [x] Audit alur notifikasi lokal dan backend yang aktif di aplikasi.
- [x] Perbaiki scheduling lokal agar notifikasi tidak baru muncul saat app dibuka.
- [x] Verifikasi lint dan typecheck setelah perubahan.
- [x] Tulis ringkasan hasil review.

## Review

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
