# SUNAN NOTIFIER — Task List

Muhammad Zahirul Khabsi | NIM: 202351207 | April 2026

---

## Sprint 1 — Setup & Fondasi (Minggu 1-2)

| ID | Task | Prioritas | API / Teknologi | Effort | Status |
|---|---|---|---|---|---|
| T-01 | Setup project Expo + React Native + TypeScript | 🔴 High | Expo CLI | 1 hari | [ ] To Do |
| T-02 | Setup Supabase project + skema database | 🔴 High | Supabase | 1 hari | [ ] To Do |
| T-03 | Setup Firebase project + konfigurasi FCM | 🔴 High | Firebase Console | 1 hari | [ ] To Do |
| T-04 | Buat screen Login (input NIM + password) | 🔴 High | React Native UI | 1 hari | [ ] To Do |
| T-05 | Integrasi token.php — request & simpan token Moodle | 🔴 High | token.php + SecureStore | 1 hari | [ ] To Do |
| T-06 | Fetch & simpan daftar matkul aktif user | 🔴 High | core_enrol_get_users_courses | 0.5 hari | [ ] To Do |
| T-07 | Setup navigasi app (tab bar + stack navigator) | 🟡 Medium | Expo Router | 0.5 hari | [ ] To Do |

**Total effort Sprint 1: ~7 hari**

---

## Sprint 2 — Fitur Tugas & Notifikasi (Minggu 3-4)

| ID | Task | Prioritas | API / Teknologi | Effort | Status |
|---|---|---|---|---|---|
| T-08 | Fetch semua tugas dari semua matkul | 🔴 High | mod_assign_get_assignments | 1 hari | [ ] To Do |
| T-09 | Fetch deadline dari kalender Moodle | 🔴 High | core_calendar_get_action_events_by_courses | 1 hari | [ ] To Do |
| T-10 | Cek status submit tiap tugas | 🔴 High | mod_assign_get_submission_status | 1 hari | [ ] To Do |
| T-11 | Simpan snapshot tugas ke Supabase DB | 🔴 High | Supabase PostgreSQL | 1 hari | [ ] To Do |
| T-12 | Logic diff: deteksi tugas baru vs snapshot lama | 🔴 High | Supabase Edge Function | 1 hari | [ ] To Do |
| T-13 | Kirim push notif tugas baru via FCM | 🔴 High | FCM + Edge Function | 1 hari | [ ] To Do |
| T-14 | Buat screen Daftar Tugas (list + status warna) | 🟡 Medium | React Native UI | 1 hari | [ ] To Do |
| T-15 | Sort tugas by deadline terdekat | 🟡 Medium | Frontend logic | 0.5 hari | [ ] To Do |

**Total effort Sprint 2: ~7.5 hari**

---

## Sprint 3 — Scheduler & Reminder (Minggu 5-6)

| ID | Task | Prioritas | API / Teknologi | Effort | Status |
|---|---|---|---|---|---|
| T-16 | Setup Supabase cron job (setiap 15 menit) | 🔴 High | Supabase pg_cron | 1 hari | [ ] To Do |
| T-17 | Notif reminder H-1 sebelum deadline | 🔴 High | Scheduled Edge Function | 1 hari | [ ] To Do |
| T-18 | Notif reminder H-hari deadline pukul 07.00 | 🔴 High | Scheduled Edge Function | 1 hari | [ ] To Do |
| T-19 | Buat screen Kalender deadline | 🟡 Medium | react-native-calendars | 1 hari | [ ] To Do |
| T-20 | Badge count icon app (tugas belum dikerjakan) | 🟡 Medium | Expo Notifications | 0.5 hari | [ ] To Do |
| T-21 | Deep link: tap notif langsung buka detail tugas | 🟡 Medium | Expo Linking | 0.5 hari | [ ] To Do |

**Total effort Sprint 3: ~5 hari**

---

## Sprint 4 — Settings & Finalisasi (Minggu 7-8)

| ID | Task | Prioritas | API / Teknologi | Effort | Status |
|---|---|---|---|---|---|
| T-22 | Screen Settings: toggle jenis notifikasi | 🟡 Medium | Zustand + AsyncStorage | 1 hari | [ ] To Do |
| T-23 | Setting interval polling (15/30/60 menit) | 🟡 Medium | Supabase user config | 0.5 hari | [ ] To Do |
| T-24 | Setting jam diam (do not disturb) | 🟡 Medium | Expo Notifications | 0.5 hari | [ ] To Do |
| T-25 | Pilih matkul yang dimonitor | 🟢 Low | Supabase user preferences | 0.5 hari | [ ] To Do |
| T-26 | Error handling: token expired, mode offline | 🔴 High | React Query retry logic | 1 hari | [ ] To Do |
| T-27 | Testing end-to-end di device Android nyata | 🔴 High | Expo Go / APK | 2 hari | [ ] To Do |
| T-28 | Build APK untuk sideload (install langsung) | 🟡 Medium | EAS Build | 1 hari | [ ] To Do |

**Total effort Sprint 4: ~6.5 hari**

---

## Ringkasan

| Sprint | Task | High Priority | Effort |
|---|---|---|---|
| Sprint 1 | 7 task | 6 | ~7 hari |
| Sprint 2 | 8 task | 6 | ~7.5 hari |
| Sprint 3 | 6 task | 3 | ~5 hari |
| Sprint 4 | 7 task | 2 | ~6.5 hari |
| **Total** | **28 task** | **17** | **~26 hari** |

---

*SUNAN Notifier | Task List v1.0 | April 2026 | Muhammad Zahirul Khabsi | 202351207*
