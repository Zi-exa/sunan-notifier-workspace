-- Supabase Data API grants are no longer implicit for newly-created public
-- tables. This project keeps direct table access behind Edge Functions, so the
-- only Data API role that should reach these tables is service_role.

grant usage on schema public to service_role;

grant select, insert, update, delete on table
  public.app_users,
  public.user_settings,
  public.user_devices,
  public.task_snapshots,
  public.notification_queue,
  public.polling_runs
to service_role;

grant usage, select on sequence
  public.task_snapshots_id_seq,
  public.notification_queue_id_seq,
  public.polling_runs_id_seq
to service_role;

revoke all on table
  public.app_users,
  public.user_settings,
  public.user_devices,
  public.task_snapshots,
  public.notification_queue,
  public.polling_runs
from anon, authenticated;

revoke all on sequence
  public.task_snapshots_id_seq,
  public.notification_queue_id_seq,
  public.polling_runs_id_seq
from anon, authenticated;

alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;

alter default privileges for role postgres in schema public
  grant usage, select on sequences to service_role;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
