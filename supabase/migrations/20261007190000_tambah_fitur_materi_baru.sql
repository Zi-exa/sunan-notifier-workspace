-- Migrasi: fitur "Materi Baru"
-- Deteksi modul/materi baru di course SUNAN via core_course_get_contents.
--
-- Cara pakai: taruh file ini di supabase/migrations/, lalu:
--   npx supabase db push

-- 1. Toggle pengaturan (default ON, user bisa matikan di Pengaturan aplikasi)
alter table public.tabel_pengaturan_mahasiswa
  add column if not exists notifikasi_materi_baru boolean not null default true;

-- 2. Tabel snapshot materi (pola sama seperti tabel_snapshot_tugas)
create table if not exists public.tabel_snapshot_materi (
  id bigserial primary key,
  id_mahasiswa uuid not null references public.tabel_mahasiswa(id) on delete cascade,
  id_modul bigint not null,                 -- course module id dari Moodle (unik global)
  id_mata_kuliah bigint not null,
  nama_mata_kuliah text not null,
  nama_modul text not null,
  jenis_modul text not null,                -- resource, url, page, book, folder, ...
  tautan_modul text,                        -- url view.php modul (deep link)
  hash_data text not null,                  -- SHA-256 dari isi snapshot (untuk diff)
  isi_data jsonb not null,                  -- snapshot lengkap modul
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now(),
  unique (id_mahasiswa, id_modul)
);

create index if not exists idx_snapshot_materi_id_mahasiswa
  on public.tabel_snapshot_materi (id_mahasiswa);

create index if not exists idx_snapshot_materi_matkul
  on public.tabel_snapshot_materi (id_mahasiswa, id_mata_kuliah);

drop trigger if exists tg_snapshot_materi_diperbarui_pada on public.tabel_snapshot_materi;
create trigger tg_snapshot_materi_diperbarui_pada
  before update on public.tabel_snapshot_materi
  for each row execute function public.atur_waktu_diperbarui();

-- RLS aktif, tanpa policy untuk anon/authenticated (deny by default).
-- Akses hanya via service role dari Edge Function, sama seperti tabel snapshot lain.
alter table public.tabel_snapshot_materi enable row level security;

comment on table public.tabel_snapshot_materi is
  'Snapshot modul/materi course terakhir yang diambil dari SUNAN (fitur Materi Baru).';

-- 3. Tambah jenis notifikasi 'materi_baru' ke check constraint
alter table public.tabel_antrian_notifikasi
  drop constraint if exists tabel_antrian_notifikasi_jenis_notifikasi_check;

alter table public.tabel_antrian_notifikasi
  add constraint tabel_antrian_notifikasi_jenis_notifikasi_check
  -- PENTING: daftar ini harus mencakup SEMUA tipe yang dipakai edge function lain.
  -- 'attendance_h1' dan 'attendance_preopen' dipakai poll-sunan-data
  -- (lihat migrasi 20260610011933) — jangan sampai hilang dari sini.
  check (jenis_notifikasi in (
    'new_task',
    'deadline_h1',
    'deadline_today',
    'task_open',
    'task_closing',
    'attendance_h1',
    'attendance_preopen',
    'attendance_open',
    'attendance_closing',
    'materi_baru'
  ));
