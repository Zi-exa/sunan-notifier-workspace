alter function public.set_updated_at()
  set search_path = public;

create index if not exists idx_user_devices_app_user_id
  on public.user_devices (app_user_id);

alter table public.app_users enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_devices enable row level security;
alter table public.task_snapshots enable row level security;
alter table public.notification_queue enable row level security;
alter table public.polling_runs enable row level security;

alter table public.app_users force row level security;
alter table public.user_settings force row level security;
alter table public.user_devices force row level security;
alter table public.task_snapshots force row level security;
alter table public.notification_queue force row level security;
alter table public.polling_runs force row level security;

revoke all on table public.app_users from anon, authenticated;
revoke all on table public.user_settings from anon, authenticated;
revoke all on table public.user_devices from anon, authenticated;
revoke all on table public.task_snapshots from anon, authenticated;
revoke all on table public.notification_queue from anon, authenticated;
revoke all on table public.polling_runs from anon, authenticated;
