create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Replace the URL and auth header values with your actual Supabase project values.
-- Gunakan token internal yang sama dengan secret FUNCTION_AUTH_KEY pada Edge Functions.

-- Every 15 minutes: pull SUNAN tasks and queue notifications.
select cron.schedule(
  'poll-sunan-data-every-15m',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://rigzchjdqgpxaqybcrdg.functions.supabase.co/poll-sunan-data',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <FUNCTION_AUTH_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Every 15 minutes: dispatch pending notifications.
select cron.schedule(
  'send-push-every-15m',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://rigzchjdqgpxaqybcrdg.functions.supabase.co/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <FUNCTION_AUTH_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Daily at 06:50 Asia/Jakarta approximation in UTC: 23:50 UTC (previous day).
-- Adjust schedule if your project timezone differs.
select cron.schedule(
  'enqueue-daily-reminders',
  '50 23 * * *',
  $$
  select net.http_post(
    url := 'https://rigzchjdqgpxaqybcrdg.functions.supabase.co/daily-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <FUNCTION_AUTH_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);
