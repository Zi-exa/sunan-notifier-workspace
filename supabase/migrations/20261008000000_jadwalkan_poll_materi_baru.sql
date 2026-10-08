-- Cron: polling materi baru SUNAN setiap 6 jam.
-- Idempotent: aman dijalankan ulang via `npx supabase db push`.

select cron.unschedule('poll-materi-baru-every-6h')
where exists (select 1 from cron.job where jobname = 'poll-materi-baru-every-6h');

select cron.schedule(
  'poll-materi-baru-every-6h',
  '13 */6 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/poll-materi-baru',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer '
        || (select decrypted_secret from vault.decrypted_secrets where name = 'function_auth_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
