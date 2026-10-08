-- Quiet hours are opt-in so existing users keep their current notification behavior.
alter table public.tabel_pengaturan_mahasiswa
  add column if not exists jam_diam_aktif boolean not null default false;

alter table public.tabel_antrian_notifikasi
  add column if not exists jumlah_percobaan integer not null default 0,
  add column if not exists coba_lagi_pada timestamptz,
  add column if not exists gagal_permanen_pada timestamptz;

alter table public.tabel_antrian_notifikasi
  drop constraint if exists tabel_antrian_notifikasi_jumlah_percobaan_check;

alter table public.tabel_antrian_notifikasi
  add constraint tabel_antrian_notifikasi_jumlah_percobaan_check
  check (jumlah_percobaan >= 0);

-- Before this migration, any populated alasan_gagal was terminal. Keep that
-- historical behavior; only failures recorded by the new sender are retried.
update public.tabel_antrian_notifikasi
set jumlah_percobaan = greatest(jumlah_percobaan, 5),
    gagal_permanen_pada = coalesce(gagal_permanen_pada, now())
where alasan_gagal is not null
  and dikirim_pada is null
  and gagal_permanen_pada is null;

drop index if exists public.idx_antrian_notifikasi_siap_diproses;

create index if not exists idx_antrian_notifikasi_siap_diproses
  on public.tabel_antrian_notifikasi (coalesce(coba_lagi_pada, jadwal_kirim), diproses_pada)
  where dikirim_pada is null and gagal_permanen_pada is null;

create or replace function public.klaim_antrian_notifikasi(p_batas integer default 100)
returns setof public.tabel_antrian_notifikasi
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  with kandidat as (
    select antrean.id
    from public.tabel_antrian_notifikasi as antrean
    where antrean.dikirim_pada is null
      and antrean.gagal_permanen_pada is null
      and coalesce(antrean.coba_lagi_pada, antrean.jadwal_kirim) <= now()
      and (
        antrean.diproses_pada is null
        or antrean.diproses_pada < now() - interval '5 minutes'
      )
    order by coalesce(antrean.coba_lagi_pada, antrean.jadwal_kirim) asc
    for update skip locked
    limit greatest(1, least(coalesce(p_batas, 100), 100))
  )
  update public.tabel_antrian_notifikasi as antrean
  set diproses_pada = now()
  from kandidat
  where antrean.id = kandidat.id
  returning antrean.*;
end;
$$;

revoke all on function public.klaim_antrian_notifikasi(integer) from public;
revoke all on function public.klaim_antrian_notifikasi(integer) from anon;
revoke all on function public.klaim_antrian_notifikasi(integer) from authenticated;
grant execute on function public.klaim_antrian_notifikasi(integer) to service_role;
