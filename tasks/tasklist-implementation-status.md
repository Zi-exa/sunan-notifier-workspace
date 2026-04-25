# SUNAN Notifier - Status Implementasi vs Task List

Tanggal update: 2026-04-21

## Sprint 1

- T-01 Setup project Expo + React Native + TypeScript: Selesai
- T-02 Setup Supabase project + skema database: Selesai
- T-03 Setup Firebase project + konfigurasi FCM: Selesai (FCM HTTP v1 aktif via service account secret)
- T-04 Screen Login (NIM + password): Selesai
- T-05 Integrasi token.php + simpan token: Selesai
- T-06 Fetch daftar matkul aktif user: Selesai
- T-07 Setup navigasi tab + stack: Selesai

## Sprint 2

- T-08 Fetch semua tugas: Selesai
- T-09 Fetch deadline kalender Moodle: Selesai
- T-10 Cek status submit tiap tugas: Selesai
- T-11 Simpan snapshot tugas ke Supabase DB: Selesai
- T-12 Logic diff tugas baru vs snapshot lama: Selesai
- T-13 Kirim push notif tugas baru: Selesai
- T-14 Screen Daftar Tugas: Selesai
- T-15 Sort tugas by deadline: Selesai

## Sprint 3

- T-16 Supabase cron job 15 menit: Selesai
- T-17 Reminder H-1: Selesai
- T-18 Reminder H-hari 07.00: Selesai
- T-19 Screen Kalender deadline: Selesai
- T-20 Badge count icon app: Selesai
- T-21 Deep link dari notif ke detail tugas: Selesai

## Sprint 4

- T-22 Screen settings toggle notifikasi: Selesai
- T-23 Setting interval polling: Selesai
- T-24 Setting jam diam (DND): Selesai
- T-25 Pilih matkul dipantau: Selesai
- T-26 Error handling token expired/offline: Selesai
- T-27 Testing E2E di device Android nyata: Belum (checklist uji siap, eksekusi di device nyata masih pending)
- T-28 Build APK sideload (EAS): Selesai (build preview berhasil, APK siap diunduh)

## Ringkasan

- Selesai: 27 task
- Sebagian: 0 task
- Belum: 1 task

Task yang masih manual tergantung infrastruktur eksternal:
- Pengisian environment secrets production
- Uji real device Android untuk validasi end-to-end final

Dokumen eksekusi manual yang sudah disiapkan:
- tasks/provisioning-checklist.md
- tasks/e2e-android-checklist.md

## Update Tambahan

- Fitur absensi kini sudah lengkap di mobile app:
	- Tab khusus `Absensi` dengan filter status (`open`, `closing_soon`, `upcoming`, `closed`)
	- Ringkasan absensi aktif di Dashboard
	- Notifikasi lokal saat absensi dibuka dan saat akan ditutup
	- Deep link notifikasi absensi ke tab `Absensi` dengan filter otomatis
	- Kartu absensi target dari notifikasi kini diberi highlight visual agar langsung terlihat
- Peningkatan error handling T-26:
	- Error Moodle diklasifikasikan (`auth`, `offline`, `server`, `validation`) agar penanganan lebih presisi
	- Token invalid otomatis mengakhiri sesi dan mengarahkan user login ulang
	- Retry React Query kini adaptif berdasarkan jenis error (tidak retry untuk auth, retry lebih longgar untuk offline)
	- Pesan error offline di Dashboard/Tugas/Kalender/Absensi menjadi lebih informatif
- Template backend juga diperbarui untuk tipe notifikasi `attendance_closing`.
- Jalur push FCM backend berhasil dimigrasikan ke HTTP v1 menggunakan secret `FCM_SERVICE_ACCOUNT_JSON`.
- Verifikasi fungsi `send-push` sukses memproses queue; untuk token test invalid, respons gagal kini berasal dari Firebase (`registration token is not valid`), menandakan autentikasi FCM v1 sudah aktif.
- Build APK preview EAS berhasil selesai dengan build ID `fb1d0794-9e35-443a-bfe8-6264eb2ec0cf` dan artifact APK tersedia (`https://expo.dev/artifacts/eas/x1uLKMNt3stPZddQft8Yug.apk`).
