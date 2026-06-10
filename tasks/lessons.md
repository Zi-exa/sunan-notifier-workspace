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
- Untuk form login mobile, jangan mengandalkan `KeyboardAvoidingView` iOS saja. Field bawah seperti password perlu behavior Android dan scroll eksplisit saat fokus agar tidak tertutup keyboard.
- Jika dua backend job bisa membuat event notifikasi yang sama, dedupe key harus canonical lintas job. Prefix per-function seperti `daily-*` vs `today-*` tetap akan lolos unique index dan membuat notifikasi dobel.

## 2026-06-05

- Kalau HP pernah dipakai login akun lain, cek dua sumber nyangkut: row device/token di backend dan scheduled local notifications di perangkat. Membersihkan backend saja tidak menghapus notifikasi lokal yang sudah dijadwalkan.

## 2026-06-10

- Setelah mengubah schema atau scheduler notifikasi, jangan cukup memverifikasi jumlah event yang terdeteksi. Pastikan setiap jenis notifikasi benar-benar menghasilkan row antrean dan lakukan uji delivery ke jenis token perangkat yang aktif.
- Jangan memakai opsi `onConflict` dan `ignoreDuplicates` pada `.insert()` Supabase. Gunakan `.upsert()`; jika tidak, satu dedupe key lama dapat menggagalkan seluruh batch notifikasi baru. Error insert antrean tidak boleh ditelan.
