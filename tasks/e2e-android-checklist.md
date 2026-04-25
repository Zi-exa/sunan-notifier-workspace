# Android E2E Checklist (T-27)

Tanggal: 2026-04-21

Dokumen ini untuk eksekusi pengujian end-to-end di device Android nyata.

## 1) Prasyarat

- Device Android fisik
- Koneksi internet stabil
- Build app terpasang (Expo Go/dev client/APK)
- .env sudah terisi sesuai mode uji:
- Mode demo: EXPO_PUBLIC_USE_MOCK_DATA=true
- Mode real: EXPO_PUBLIC_USE_MOCK_DATA=false + kredensial SUNAN valid
- Notifikasi device diizinkan untuk app

## 2) Build yang Diuji

Isi sebelum test:
- Build type: dev client / preview APK / production APK
- Version: ...
- Commit/ref: ...
- Tester: ...
- Device: ...
- Android version: ...

## 3) Skenario Wajib

### A. Login dan Session
1. Login dengan kredensial valid.
2. Tutup app, buka lagi.
3. Pastikan session tetap aktif.
4. Logout.
5. Pastikan kembali ke layar login.

Kriteria lolos:
- Login sukses
- Session persist
- Logout menghapus session

### B. Dashboard dan Fetch Data
1. Buka tab Dashboard.
2. Tarik untuk refresh.
3. Pastikan KPI, tugas, dan absensi tampil.
4. Verifikasi identitas akun sesuai user login (bukan akun demo).
5. Pastikan teks "Mahasiswa SUNAN Demo" tidak muncul saat mode real.

Kriteria lolos:
- Data tampil tanpa crash
- Pull-to-refresh bekerja
- Identitas akun sesuai user yang login

### C. Tugas
1. Buka tab Tugas.
2. Uji filter: Semua/Pending/Submitted/Overdue.
3. Buka detail salah satu tugas.
4. Klik tombol Buka Tugas di SUNAN.

Kriteria lolos:
- Filter benar
- Routing detail benar
- Deep link ke SUNAN terbuka

### D. Kalender
1. Buka tab Kalender.
2. Pilih beberapa tanggal.
3. Verifikasi daftar deadline dan event berubah sesuai tanggal.

Kriteria lolos:
- Kalender interaktif normal
- Konten tanggal konsisten

### E. Absensi
1. Buka tab Absensi.
2. Uji filter status (all/open/closing_soon/upcoming/closed).
3. Buka link absensi dari kartu.

Kriteria lolos:
- Filter absensi benar
- Link absensi terbuka

### F. Notifikasi
1. Trigger notifikasi tugas/absensi (local atau backend queue).
2. Tap notifikasi tugas, cek terbuka ke detail tugas.
3. Tap notifikasi absensi, cek terbuka ke tab Absensi + filter otomatis.
4. Verifikasi kartu target notifikasi absensi ter-highlight.

Kriteria lolos:
- Deep link notifikasi berjalan
- Highlight target absensi muncul

### G. Error Handling (T-26)
1. Putuskan internet, lakukan refresh di Dashboard/Tugas/Kalender/Absensi.
2. Cek pesan offline muncul jelas.
3. Simulasikan token invalid/expired (jika memungkinkan).
4. Pastikan app kembali ke login saat sesi dianggap expired.

Kriteria lolos:
- Pesan offline informatif
- Session expired ditangani dengan redirect login

### H. Settings
1. Ubah toggle notifikasi.
2. Ubah interval polling.
3. Ubah jam diam.
4. Ubah matkul dipantau.
5. Sinkronkan setting ke Supabase (jika env aktif).

Kriteria lolos:
- Nilai setting tersimpan
- Sinkron berhasil saat Supabase aktif

## 4) Bukti Uji

Lampirkan:
- Screenshot per skenario penting
- Log error (jika ada)
- Video singkat untuk jalur notifikasi (opsional)

## 5) Defect Log

Format:
- ID
- Skenario
- Langkah reproduksi
- Expected
- Actual
- Severity
- Status

## 6) Exit Criteria T-27

T-27 dianggap selesai jika:
- Semua skenario wajib lolos atau ada workaround terdokumentasi
- Tidak ada defect blocker tersisa
- Bukti uji tersimpan
