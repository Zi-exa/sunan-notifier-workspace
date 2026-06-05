with ranked_active_devices as (
  select
    id,
    row_number() over (
      partition by device_key
      order by last_seen_at desc nulls last, updated_at desc nulls last, id desc
    ) as row_number
  from public.user_devices
  where active = true
    and device_key is not null
)
update public.user_devices device
set
  active = false,
  device_key = null,
  updated_at = now()
from ranked_active_devices ranked
where device.id = ranked.id
  and ranked.row_number > 1;

create unique index if not exists uq_user_devices_active_device_key
on public.user_devices (device_key)
where active = true
  and device_key is not null;
