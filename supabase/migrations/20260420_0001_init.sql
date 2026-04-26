create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  moodle_user_id bigint not null unique,
  nim text not null unique,
  fullname text not null,
  moodle_token text not null,
  token_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_settings (
  app_user_id uuid primary key references app_users(id) on delete cascade,
  notify_new_task boolean not null default true,
  notify_deadline_h1 boolean not null default true,
  notify_deadline_today boolean not null default true,
  notify_task_open boolean not null default true,
  notify_attendance boolean not null default true,
  poll_interval_minutes int not null default 15 check (poll_interval_minutes in (15, 30, 60)),
  dnd_start time not null default '22:00',
  dnd_end time not null default '07:00',
  monitored_course_ids bigint[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_devices (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references app_users(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null,
  active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists task_snapshots (
  id bigserial primary key,
  app_user_id uuid not null references app_users(id) on delete cascade,
  assignment_id bigint not null,
  due_at timestamptz,
  status text not null default 'pending',
  payload_hash text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_user_id, assignment_id)
);

create table if not exists notification_queue (
  id bigserial primary key,
  app_user_id uuid not null references app_users(id) on delete cascade,
  notification_type text not null check (
    notification_type in (
      'new_task',
      'deadline_h1',
      'deadline_today',
      'attendance_open',
      'attendance_closing'
    )
  ),
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text,
  schedule_at timestamptz not null default now(),
  sent_at timestamptz,
  failed_reason text,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_notification_queue_dedupe_key
  on notification_queue (dedupe_key)
  where dedupe_key is not null;

create table if not exists polling_runs (
  id bigserial primary key,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running',
  details jsonb not null default '{}'::jsonb,
  notes text
);

create index if not exists idx_task_snapshots_user on task_snapshots (app_user_id);
create index if not exists idx_task_snapshots_due on task_snapshots (due_at);
create index if not exists idx_notification_queue_schedule on notification_queue (schedule_at);
create index if not exists idx_notification_queue_user on notification_queue (app_user_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tg_app_users_updated_at on app_users;
create trigger tg_app_users_updated_at
before update on app_users
for each row execute function set_updated_at();

drop trigger if exists tg_user_settings_updated_at on user_settings;
create trigger tg_user_settings_updated_at
before update on user_settings
for each row execute function set_updated_at();

drop trigger if exists tg_user_devices_updated_at on user_devices;
create trigger tg_user_devices_updated_at
before update on user_devices
for each row execute function set_updated_at();

drop trigger if exists tg_task_snapshots_updated_at on task_snapshots;
create trigger tg_task_snapshots_updated_at
before update on task_snapshots
for each row execute function set_updated_at();
