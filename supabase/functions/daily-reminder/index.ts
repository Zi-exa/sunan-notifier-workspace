import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const functionAuthKey = Deno.env.get('FUNCTION_AUTH_KEY') ?? '';
const acceptedAuthTokens = [serviceRoleKey, functionAuthKey].filter((token) => token.length > 0);

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

type SettingsRow = {
  app_user_id: string;
  notify_deadline_h1: boolean;
  notify_deadline_today: boolean;
  dnd_start: string;
  dnd_end: string;
};

type SnapshotRow = {
  app_user_id: string;
  assignment_id: number;
  status: string;
  payload: {
    id: number;
    name: string;
    dueDate: number;
  };
};

const jakartaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function toJakartaDateKey(date: Date): string {
  return jakartaDateFormatter.format(date);
}

function parseTimeToMinutes(value: string): number | null {
  const [hourRaw, minuteRaw] = value.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return hour * 60 + minute;
}

function inDoNotDisturb(now: Date, dndStart: string, dndEnd: string): boolean {
  const start = parseTimeToMinutes(dndStart);
  const end = parseTimeToMinutes(dndEnd);

  if (start === null || end === null || start === end) {
    return false;
  }

  const current = now.getHours() * 60 + now.getMinutes();
  if (start < end) {
    return current >= start && current < end;
  }

  return current >= start || current < end;
}

function getNextDndEnd(now: Date, dndEnd: string): Date {
  const minutes = parseTimeToMinutes(dndEnd);
  if (minutes === null) {
    return now;
  }

  const next = new Date(now);
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

function scheduleAtSevenJakarta(targetDateKey: string): Date {
  return new Date(`${targetDateKey}T07:00:00+07:00`);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = request.headers.get('Authorization') ?? '';
  if (!authHeader || !acceptedAuthTokens.some((token) => authHeader.includes(token))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const settingsResult = await supabase
      .from('user_settings')
      .select('app_user_id,notify_deadline_h1,notify_deadline_today,dnd_start,dnd_end');

    if (settingsResult.error) {
      throw new Error(settingsResult.error.message);
    }

    const settingsRows = (settingsResult.data ?? []) as SettingsRow[];
    const settingsMap = new Map<string, SettingsRow>();
    for (const row of settingsRows) {
      settingsMap.set(row.app_user_id, row);
    }

    const snapshotsResult = await supabase
      .from('task_snapshots')
      .select('app_user_id,assignment_id,status,payload');

    if (snapshotsResult.error) {
      throw new Error(snapshotsResult.error.message);
    }

    const snapshots = (snapshotsResult.data ?? []) as SnapshotRow[];
    const queueRows: Array<Record<string, unknown>> = [];

    const now = new Date();
    const todayKey = toJakartaDateKey(now);
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowKey = toJakartaDateKey(tomorrowDate);

    for (const snapshot of snapshots) {
      if (snapshot.status === 'submitted') {
        continue;
      }

      const settings = settingsMap.get(snapshot.app_user_id);
      if (!settings) {
        continue;
      }

      const dueDateUnix = Number(snapshot.payload?.dueDate ?? 0);
      if (!dueDateUnix) {
        continue;
      }

      const dueDateKey = toJakartaDateKey(new Date(dueDateUnix * 1000));

      if (settings.notify_deadline_h1 && dueDateKey === tomorrowKey) {
        let scheduleAt = scheduleAtSevenJakarta(todayKey);
        if (inDoNotDisturb(scheduleAt, settings.dnd_start, settings.dnd_end)) {
          scheduleAt = getNextDndEnd(scheduleAt, settings.dnd_end);
        }

        queueRows.push({
          app_user_id: snapshot.app_user_id,
          notification_type: 'deadline_h1',
          title: 'Pengingat Deadline H-1',
          body: `${snapshot.payload.name} akan deadline besok.`,
          payload: {
            taskId: snapshot.assignment_id,
            kind: 'deadline_h1',
          },
          dedupe_key: `daily-h1-${snapshot.app_user_id}-${snapshot.assignment_id}-${todayKey}`,
          schedule_at: scheduleAt.toISOString(),
        });
      }

      if (settings.notify_deadline_today && dueDateKey === todayKey) {
        let scheduleAt = scheduleAtSevenJakarta(todayKey);
        if (scheduleAt.getTime() < now.getTime()) {
          scheduleAt = now;
        }
        if (inDoNotDisturb(scheduleAt, settings.dnd_start, settings.dnd_end)) {
          scheduleAt = getNextDndEnd(scheduleAt, settings.dnd_end);
        }

        queueRows.push({
          app_user_id: snapshot.app_user_id,
          notification_type: 'deadline_today',
          title: 'Pengingat Deadline Hari Ini',
          body: `${snapshot.payload.name} deadline hari ini.`,
          payload: {
            taskId: snapshot.assignment_id,
            kind: 'deadline_today',
          },
          dedupe_key: `daily-today-${snapshot.app_user_id}-${snapshot.assignment_id}-${todayKey}`,
          schedule_at: scheduleAt.toISOString(),
        });
      }
    }

    if (queueRows.length > 0) {
      const insertResult = await supabase.from('notification_queue').insert(queueRows, {
        onConflict: 'dedupe_key',
        ignoreDuplicates: true,
      });

      if (insertResult.error) {
        throw new Error(insertResult.error.message);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        queued: queueRows.length,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
