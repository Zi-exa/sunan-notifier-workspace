alter table if exists user_settings
add column if not exists notify_task_open boolean not null default true;
