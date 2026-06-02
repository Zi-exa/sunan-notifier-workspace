# Lessons

## 2026-06-02

- Gejala "notifikasi baru muncul saat app dibuka" perlu dicek dari dua sisi sekaligus: scheduling lokal dan delivery backend. Jangan menganggap satu jalur saja sebagai akar masalah.
- Untuk notifikasi berbasis waktu, hindari logika yang hanya mengirim saat query refresh menemukan event yang sudah aktif; jadwalkan saat event masih di masa depan dan sisakan immediate fallback hanya sebagai recovery.
