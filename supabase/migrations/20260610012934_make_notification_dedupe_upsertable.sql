drop index if exists public.uq_antrian_notifikasi_anti_duplikat;

create unique index uq_antrian_notifikasi_anti_duplikat
  on public.tabel_antrian_notifikasi (kunci_anti_duplikat);
