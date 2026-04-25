# SUNAN NOTIFIER
**Product Requirements Document**

Sistem Notifikasi Tugas & Absensi SUNAN UMK

Universitas Muria Kudus | April 2026

Muhammad Zahirul Khabsi | NIM: 202351207

---

## 1. Overview

SUNAN Notifier adalah aplikasi mobile (React Native + Expo) yang terhubung ke SUNAN UMK melalui Moodle Web Services API. Aplikasi memberikan push notification otomatis ke HP mahasiswa ketika ada tugas baru, deadline mendekat, atau absensi dibuka.

Moodle Web Services di `sunan.umk.ac.id` telah dikonfirmasi aktif dengan service `moodle_mobile_app`. API mendukung penuh `mod_assign` (tugas), `core_calendar` (deadline), dan `core_enrol` (daftar matkul).

---

## 2. Tujuan Produk

- Notifikasi otomatis ketika ada tugas baru dari dosen
- Notifikasi H-1 dan H-hari deadline tugas
- Notifikasi ketika absensi dibuka di SUNAN
- Semua notifikasi bisa dikustomisasi (toggle, interval, jam diam)
- Berjalan di background tanpa perlu buka SUNAN manual

---

## 3. Tech Stack

### 3.1 Mobile App

| Teknologi | Kegunaan |
|---|---|
| React Native + Expo | Framework utama, satu kodebase Android & iOS |
| Expo Notifications | Push notification ke HP |
| Expo SecureStore | Simpan token Moodle dengan aman di HP |
| React Query | Fetching & caching data API |
| Zustand | State management ringan |

### 3.2 Backend Serverless

| Teknologi | Kegunaan |
|---|---|
| Supabase | Database PostgreSQL + Edge Functions (gratis) |
| Supabase pg_cron | Scheduler polling SUNAN setiap 15 menit |
| Firebase Cloud Messaging (FCM) | Delivery push notification ke Android (gratis) |

### 3.3 Integrasi SUNAN

- **Moodle Web Services REST API** — sudah dikonfirmasi aktif
- **Service:** `moodle_mobile_app` — token berhasil didapat
- **Auth:** token-based, disimpan aman di Supabase per user

---

## 4. Alur Kerja Sistem

1. User login di app dengan NIM + password portal UMK
2. App request token ke `token.php` SUNAN
3. Token disimpan di Supabase (server) dan SecureStore (HP)
4. Supabase Edge Function jalan setiap 15 menit via cron
5. Edge Function panggil API SUNAN: ambil tugas, deadline, absensi
6. Bandingkan hasil dengan snapshot sebelumnya di database
7. Jika ada perubahan, kirim push notification via FCM ke HP user
8. User tap notifikasi, app buka langsung ke detail tugas

### API SUNAN yang Digunakan

| Fungsi API | Kegunaan | Data yang Diambil |
|---|---|---|
| `mod_assign_get_assignments` | Ambil daftar tugas semua matkul | Nama tugas, deadline, status submit |
| `core_calendar_get_action_events_by_courses` | Ambil semua deadline dari kalender | Semua deadline matkul aktif |
| `core_enrol_get_users_courses` | Ambil daftar matkul yang diikuti | ID dan nama matkul semester ini |
| `mod_assign_get_submission_status` | Cek status submit tiap tugas | Sudah/belum submit, waktu submit |
| `core_webservice_get_site_info` | Validasi token & ambil info user | UserID, nama, matkul terdaftar |

---

## 5. Fitur Aplikasi

### 5.1 Autentikasi
- Login dengan NIM + password portal akademik UMK
- Token Moodle disimpan aman di SecureStore dan Supabase
- Auto-refresh token jika expired, auto-login ulang jika perlu

### 5.2 Notifikasi Tugas
- Notif langsung ketika tugas baru di-post dosen
- Notif pengingat H-1 sebelum deadline
- Notif pengingat H-hari deadline (pagi pukul 07.00)
- Badge count di icon app = jumlah tugas belum dikerjakan

### 5.3 Notifikasi Absensi
- Notif ketika absensi dibuka oleh dosen
- Notif jika absensi belum diisi dan akan segera tutup

### 5.4 Dashboard
- Daftar tugas upcoming diurutkan by deadline terdekat
- Status tiap tugas: belum dikerjakan / sudah submit / terlambat
- Kalender mini showing semua deadline bulan ini
- Quick link ke SUNAN untuk buka langsung tugas di browser

### 5.5 Pengaturan
- Toggle on/off per jenis notifikasi (tugas baru, deadline, absensi)
- Pilih interval polling: 15 menit / 30 menit / 1 jam
- Jam diam (do not disturb) atur sendiri, misal 22.00 - 07.00
- Pilih matkul mana yang mau dimonitor

---

## 6. Estimasi Timeline

| Sprint | Durasi | Deliverable |
|---|---|---|
| Sprint 1 | Minggu 1-2 | App bisa login ke SUNAN dan ambil daftar matkul |
| Sprint 2 | Minggu 3-4 | Notif tugas baru aktif, dashboard tugas tampil di app |
| Sprint 3 | Minggu 5-6 | Scheduler aktif, reminder H-1 dan H-hari berjalan otomatis |
| Sprint 4 | Minggu 7-8 | App siap pakai, APK bisa di-install di Android tanpa Play Store |

> Lihat detail task per sprint di file **`sunan-notifier-tasklist.md`**

---

## 7. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Token Moodle expired | Auto re-login dan refresh token otomatis |
| SUNAN down / maintenance | Retry logic, notif error ke user |
| API rate limiting | Interval polling minimum 15 menit |
| Ganti password portal | App deteksi invalid login dan minta login ulang |
| Perubahan Moodle versi | Moodle 3.8 stabil, API tidak berubah mendadak |

---

## 8. Estimasi Biaya

| Komponen | Biaya |
|---|---|
| Supabase Free Tier (database + edge functions) | Rp 0 |
| Firebase FCM (push notification) | Rp 0 |
| React Native + Expo | Rp 0 |
| Distribusi APK langsung (sideload) | Rp 0 |
| Google Play Store (opsional, jika mau publish) | ~Rp 400.000 sekali seumur hidup |

**Total biaya untuk penggunaan pribadi: Rp 0**

---

*SUNAN Notifier | PRD v1.0 | April 2026 | Muhammad Zahirul Khabsi | 202351207*
