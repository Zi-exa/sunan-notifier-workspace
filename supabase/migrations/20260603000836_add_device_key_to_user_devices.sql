alter table public.user_devices
add column if not exists device_key text;

create unique index if not exists uq_user_devices_app_user_device_key
on public.user_devices (app_user_id, device_key)
;

create index if not exists idx_user_devices_active_user
on public.user_devices (app_user_id, active);
