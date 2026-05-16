alter table public.notification_queue
drop constraint if exists notification_queue_notification_type_check;

alter table public.notification_queue
add constraint notification_queue_notification_type_check
check (
  notification_type in (
    'new_task',
    'deadline_h1',
    'deadline_today',
    'task_open',
    'task_closing',
    'attendance_open',
    'attendance_closing'
  )
);
