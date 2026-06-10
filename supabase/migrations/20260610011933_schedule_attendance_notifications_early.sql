alter table public.tabel_antrian_notifikasi
drop constraint if exists tabel_antrian_notifikasi_jenis_notifikasi_check;

alter table public.tabel_antrian_notifikasi
add constraint tabel_antrian_notifikasi_jenis_notifikasi_check
check (
  jenis_notifikasi in (
    'new_task',
    'deadline_h1',
    'deadline_today',
    'task_open',
    'task_closing',
    'attendance_h1',
    'attendance_preopen',
    'attendance_open',
    'attendance_closing'
  )
);
