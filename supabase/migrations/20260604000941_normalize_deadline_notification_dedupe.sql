-- `poll-sunan-data` and `daily-reminder` used different dedupe_key prefixes
-- for the same deadline reminder. Keep one pending row per task/type/day, then
-- normalize the remaining keys so future inserts collide correctly.
with ranked_deadlines as (
  select
    id,
    row_number() over (
      partition by
        app_user_id,
        notification_type,
        payload ->> 'taskId',
        to_char(schedule_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD')
      order by
        case
          when dedupe_key like 'deadline-%' then 0
          when dedupe_key like 'daily-%' then 1
          else 2
        end,
        created_at,
        id
    ) as row_number
  from public.notification_queue
  where notification_type in ('deadline_h1', 'deadline_today')
    and sent_at is null
)
delete from public.notification_queue queue
using ranked_deadlines ranked
where queue.id = ranked.id
  and ranked.row_number > 1;

update public.notification_queue
set dedupe_key = concat(
  case
    when notification_type = 'deadline_h1' then 'deadline-h1'
    else 'deadline-today'
  end,
  '-',
  app_user_id,
  '-',
  payload ->> 'taskId',
  '-',
  to_char(schedule_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD')
)
where notification_type in ('deadline_h1', 'deadline_today')
  and sent_at is null
  and payload ? 'taskId';
