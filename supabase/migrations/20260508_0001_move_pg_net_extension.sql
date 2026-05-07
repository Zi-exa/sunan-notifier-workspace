create schema if not exists extensions;

do $$
begin
  begin
    if exists (select 1 from net.http_request_queue limit 1) then
      raise exception 'net.http_request_queue masih berisi request. Coba lagi setelah antrean pg_net kosong.';
    end if;
  exception
    when undefined_table then
      null;
  end;
end;
$$;

drop extension if exists pg_net;
create extension if not exists pg_net schema extensions;
