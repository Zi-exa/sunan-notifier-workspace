create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- Store these once in Supabase Vault before relying on the jobs:
-- select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
-- select vault.create_secret('<FUNCTION_AUTH_KEY>', 'function_auth_key');
--
-- This replaces the older placeholder-based cron template so scheduled jobs do
-- not keep calling Edge Functions with the literal Bearer <FUNCTION_AUTH_KEY>.

select cron.unschedule('poll-sunan-data-every-15m')
where exists (select 1 from cron.job where jobname = 'poll-sunan-data-every-15m');

select cron.unschedule('send-push-every-15m')
where exists (select 1 from cron.job where jobname = 'send-push-every-15m');

select cron.unschedule('enqueue-daily-reminders')
where exists (select 1 from cron.job where jobname = 'enqueue-daily-reminders');

select cron.schedule(
  'poll-sunan-data-every-15m',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/poll-sunan-data',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer '
        || (select decrypted_secret from vault.decrypted_secrets where name = 'function_auth_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'send-push-every-15m',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer '
        || (select decrypted_secret from vault.decrypted_secrets where name = 'function_auth_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'enqueue-daily-reminders',
  '50 23 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/daily-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer '
        || (select decrypted_secret from vault.decrypted_secrets where name = 'function_auth_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
