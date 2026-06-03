# Lessons

## 2026-06-02

- Gejala "notifikasi baru muncul saat app dibuka" perlu dicek dari dua sisi sekaligus: scheduling lokal dan delivery backend. Jangan menganggap satu jalur saja sebagai akar masalah.
- Untuk notifikasi berbasis waktu, hindari logika yang hanya mengirim saat query refresh menemukan event yang sudah aktif; jadwalkan saat event masih di masa depan dan sisakan immediate fallback hanya sebagai recovery.
- Kalau user akhirnya memilih solusi yang lebih sederhana, rollback arah over-engineered secepat mungkin. Jangan pertahankan varian/build split kalau kebutuhan nyatanya hanya mengubah APK utama.
- Kalau menambah pertanyaan pilihan di UI, selesai berarti benar-benar selesai: setelah user memilih, prompt harus hilang dan affordance berikutnya hanya muncul pada konteks yang user minta.

## 2026-06-03

- Kalau notifikasi muncul dobel, cek gabungan jalur lokal, push backend, dan token perangkat lama. Dedupe di client saja tidak cukup kalau backend masih punya lebih dari satu token aktif atau local scheduler masih overlap dengan remote push.

## 2026-06-04

- Prompt pilihan user di login jangan muncul sebelum aksi utama dimulai. Untuk pilihan seperti simpan akun, gate dari tombol submit lebih nyaman daripada menampilkan pertanyaan di render awal halaman.
