-- Rename the operational schema without copying data. PostgreSQL keeps
-- foreign keys, RLS, privileges, and sequence ownership attached by object ID.

alter table public.app_users rename to tabel_mahasiswa;
alter table public.user_settings rename to tabel_pengaturan_mahasiswa;
alter table public.user_devices rename to tabel_perangkat_mahasiswa;
alter table public.task_snapshots rename to tabel_snapshot_tugas;
alter table public.notification_queue rename to tabel_antrian_notifikasi;
alter table public.polling_runs rename to tabel_riwayat_sinkronisasi;

alter table public.tabel_mahasiswa
  rename column moodle_user_id to id_pengguna_moodle;
alter table public.tabel_mahasiswa
  rename column fullname to nama_lengkap;
alter table public.tabel_mahasiswa
  rename column moodle_token to token_moodle;
alter table public.tabel_mahasiswa
  rename column token_updated_at to token_diperbarui_pada;
alter table public.tabel_mahasiswa
  rename column created_at to dibuat_pada;
alter table public.tabel_mahasiswa
  rename column updated_at to diperbarui_pada;

alter table public.tabel_pengaturan_mahasiswa
  rename column app_user_id to id_mahasiswa;
alter table public.tabel_pengaturan_mahasiswa
  rename column notify_new_task to notifikasi_tugas_baru;
alter table public.tabel_pengaturan_mahasiswa
  rename column notify_deadline_h1 to notifikasi_deadline_h1;
alter table public.tabel_pengaturan_mahasiswa
  rename column notify_deadline_today to notifikasi_deadline_hari_ini;
alter table public.tabel_pengaturan_mahasiswa
  rename column notify_task_open to notifikasi_tugas_dibuka;
alter table public.tabel_pengaturan_mahasiswa
  rename column notify_attendance to notifikasi_absensi;
alter table public.tabel_pengaturan_mahasiswa
  rename column poll_interval_minutes to interval_sinkronisasi_menit;
alter table public.tabel_pengaturan_mahasiswa
  rename column dnd_start to jangan_ganggu_mulai;
alter table public.tabel_pengaturan_mahasiswa
  rename column dnd_end to jangan_ganggu_selesai;
alter table public.tabel_pengaturan_mahasiswa
  rename column monitored_course_ids to id_mata_kuliah_dipantau;
alter table public.tabel_pengaturan_mahasiswa
  rename column created_at to dibuat_pada;
alter table public.tabel_pengaturan_mahasiswa
  rename column updated_at to diperbarui_pada;

alter table public.tabel_perangkat_mahasiswa
  rename column app_user_id to id_mahasiswa;
alter table public.tabel_perangkat_mahasiswa
  rename column expo_push_token to token_perangkat;
alter table public.tabel_perangkat_mahasiswa
  rename column device_key to kunci_perangkat;
alter table public.tabel_perangkat_mahasiswa
  rename column platform to platform_perangkat;
alter table public.tabel_perangkat_mahasiswa
  rename column active to aktif;
alter table public.tabel_perangkat_mahasiswa
  rename column last_seen_at to terakhir_aktif_pada;
alter table public.tabel_perangkat_mahasiswa
  rename column created_at to dibuat_pada;
alter table public.tabel_perangkat_mahasiswa
  rename column updated_at to diperbarui_pada;

alter table public.tabel_snapshot_tugas
  rename column app_user_id to id_mahasiswa;
alter table public.tabel_snapshot_tugas
  rename column assignment_id to id_tugas;
alter table public.tabel_snapshot_tugas
  rename column due_at to batas_waktu;
alter table public.tabel_snapshot_tugas
  rename column payload_hash to hash_data;
alter table public.tabel_snapshot_tugas
  rename column payload to isi_data;
alter table public.tabel_snapshot_tugas
  rename column created_at to dibuat_pada;
alter table public.tabel_snapshot_tugas
  rename column updated_at to diperbarui_pada;

alter table public.tabel_antrian_notifikasi
  rename column app_user_id to id_mahasiswa;
alter table public.tabel_antrian_notifikasi
  rename column notification_type to jenis_notifikasi;
alter table public.tabel_antrian_notifikasi
  rename column title to judul_notifikasi;
alter table public.tabel_antrian_notifikasi
  rename column body to isi_notifikasi;
alter table public.tabel_antrian_notifikasi
  rename column payload to isi_data;
alter table public.tabel_antrian_notifikasi
  rename column dedupe_key to kunci_anti_duplikat;
alter table public.tabel_antrian_notifikasi
  rename column schedule_at to jadwal_kirim;
alter table public.tabel_antrian_notifikasi
  rename column sent_at to dikirim_pada;
alter table public.tabel_antrian_notifikasi
  rename column failed_reason to alasan_gagal;
alter table public.tabel_antrian_notifikasi
  rename column created_at to dibuat_pada;

alter table public.tabel_riwayat_sinkronisasi
  rename column started_at to dimulai_pada;
alter table public.tabel_riwayat_sinkronisasi
  rename column completed_at to selesai_pada;
alter table public.tabel_riwayat_sinkronisasi
  rename column details to detail_sinkronisasi;
alter table public.tabel_riwayat_sinkronisasi
  rename column notes to catatan;

alter table public.tabel_mahasiswa
  rename constraint app_users_pkey to tabel_mahasiswa_pkey;
alter table public.tabel_mahasiswa
  rename constraint app_users_moodle_user_id_key to tabel_mahasiswa_id_pengguna_moodle_key;
alter table public.tabel_mahasiswa
  rename constraint app_users_nim_key to tabel_mahasiswa_nim_key;

alter table public.tabel_pengaturan_mahasiswa
  rename constraint user_settings_pkey to tabel_pengaturan_mahasiswa_pkey;
alter table public.tabel_pengaturan_mahasiswa
  rename constraint user_settings_app_user_id_fkey to tabel_pengaturan_mahasiswa_id_mahasiswa_fkey;
alter table public.tabel_pengaturan_mahasiswa
  rename constraint user_settings_poll_interval_minutes_check to tabel_pengaturan_mahasiswa_interval_sinkronisasi_check;

alter table public.tabel_perangkat_mahasiswa
  rename constraint user_devices_pkey to tabel_perangkat_mahasiswa_pkey;
alter table public.tabel_perangkat_mahasiswa
  rename constraint user_devices_app_user_id_fkey to tabel_perangkat_mahasiswa_id_mahasiswa_fkey;
alter table public.tabel_perangkat_mahasiswa
  rename constraint user_devices_expo_push_token_key to tabel_perangkat_mahasiswa_token_perangkat_key;

alter table public.tabel_snapshot_tugas
  rename constraint task_snapshots_pkey to tabel_snapshot_tugas_pkey;
alter table public.tabel_snapshot_tugas
  rename constraint task_snapshots_app_user_id_fkey to tabel_snapshot_tugas_id_mahasiswa_fkey;
alter table public.tabel_snapshot_tugas
  rename constraint task_snapshots_app_user_id_assignment_id_key to tabel_snapshot_tugas_id_mahasiswa_id_tugas_key;

alter table public.tabel_antrian_notifikasi
  rename constraint notification_queue_pkey to tabel_antrian_notifikasi_pkey;
alter table public.tabel_antrian_notifikasi
  rename constraint notification_queue_app_user_id_fkey to tabel_antrian_notifikasi_id_mahasiswa_fkey;
alter table public.tabel_antrian_notifikasi
  rename constraint notification_queue_notification_type_check to tabel_antrian_notifikasi_jenis_notifikasi_check;

alter table public.tabel_riwayat_sinkronisasi
  rename constraint polling_runs_pkey to tabel_riwayat_sinkronisasi_pkey;

alter index public.idx_user_devices_app_user_id
  rename to idx_perangkat_mahasiswa_id_mahasiswa;
alter index public.idx_user_devices_active_user
  rename to idx_perangkat_mahasiswa_aktif;
alter index public.uq_user_devices_app_user_device_key
  rename to uq_perangkat_mahasiswa_id_kunci;
alter index public.uq_user_devices_active_device_key
  rename to uq_perangkat_mahasiswa_kunci_aktif;
alter index public.idx_task_snapshots_user
  rename to idx_snapshot_tugas_id_mahasiswa;
alter index public.idx_task_snapshots_due
  rename to idx_snapshot_tugas_batas_waktu;
alter index public.idx_notification_queue_schedule
  rename to idx_antrian_notifikasi_jadwal;
alter index public.idx_notification_queue_user
  rename to idx_antrian_notifikasi_id_mahasiswa;
alter index public.uq_notification_queue_dedupe_key
  rename to uq_antrian_notifikasi_anti_duplikat;

alter sequence public.task_snapshots_id_seq
  rename to tabel_snapshot_tugas_id_seq;
alter sequence public.notification_queue_id_seq
  rename to tabel_antrian_notifikasi_id_seq;
alter sequence public.polling_runs_id_seq
  rename to tabel_riwayat_sinkronisasi_id_seq;

alter function public.set_updated_at()
  rename to atur_waktu_diperbarui;

create or replace function public.atur_waktu_diperbarui()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.diperbarui_pada = now();
  return new;
end;
$$;

alter trigger tg_app_users_updated_at
  on public.tabel_mahasiswa
  rename to tg_mahasiswa_diperbarui_pada;
alter trigger tg_user_settings_updated_at
  on public.tabel_pengaturan_mahasiswa
  rename to tg_pengaturan_mahasiswa_diperbarui_pada;
alter trigger tg_user_devices_updated_at
  on public.tabel_perangkat_mahasiswa
  rename to tg_perangkat_mahasiswa_diperbarui_pada;
alter trigger tg_task_snapshots_updated_at
  on public.tabel_snapshot_tugas
  rename to tg_snapshot_tugas_diperbarui_pada;

comment on table public.tabel_mahasiswa is 'Data akun mahasiswa SUNAN yang dipakai untuk sinkronisasi.';
comment on table public.tabel_pengaturan_mahasiswa is 'Pengaturan notifikasi dan sinkronisasi setiap mahasiswa.';
comment on table public.tabel_perangkat_mahasiswa is 'Perangkat mahasiswa yang dapat menerima push notification.';
comment on table public.tabel_snapshot_tugas is 'Snapshot tugas terakhir yang diambil dari SUNAN.';
comment on table public.tabel_antrian_notifikasi is 'Antrian push notification yang menunggu dikirim.';
comment on table public.tabel_riwayat_sinkronisasi is 'Riwayat eksekusi sinkronisasi data SUNAN.';
