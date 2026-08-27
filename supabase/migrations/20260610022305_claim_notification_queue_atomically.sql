alter table public.tabel_antrian_notifikasi
add column if not exists diproses_pada timestamptz;

create index if not exists idx_antrian_notifikasi_siap_diproses
  on public.tabel_antrian_notifikasi (jadwal_kirim, diproses_pada)
  where dikirim_pada is null and alasan_gagal is null;

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
      and antrean.alasan_gagal is null
      and antrean.jadwal_kirim <= now()
      and (
        antrean.diproses_pada is null
        or antrean.diproses_pada < now() - interval '5 minutes'
      )
    order by antrean.jadwal_kirim asc
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
