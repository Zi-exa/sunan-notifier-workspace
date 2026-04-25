import { createClient } from 'npm:@supabase/supabase-js@2';

type UserSettingsRow = {
  notify_new_task: boolean;
  notify_deadline_h1: boolean;
  notify_deadline_today: boolean;
  notify_attendance: boolean;
  poll_interval_minutes: number;
  dnd_start: string;
  dnd_end: string;
  monitored_course_ids: number[];
};

type UserRow = {
  id: string;
  moodle_user_id: number;
  moodle_token: string;
  user_settings: UserSettingsRow | UserSettingsRow[] | null;
};

type MoodleCourse = {
  id: number;
  fullname: string;
  shortname: string;
};

type MoodleAssignment = {
  id: number;
  cmid: number;
  course: number;
  name: string;
  intro?: string;
  duedate: number;
  cutoffdate: number;
};

type MoodleAssignmentsPayload = {
  courses: Array<{
    id: number;
    fullname: string;
    assignments: MoodleAssignment[];
  }>;
};

type MoodleSubmissionStatus = {
  lastattempt?: {
    submission?: {
      status?: string;
      timemodified?: number;
    };
  };
};

type MoodleCalendarPayload = {
  events: Array<{
    id: number;
    name: string;
    timestart: number;
    timeduration: number;
    description?: string;
    url?: string;
    modulename?: string;
    instance?: number;
    courseid?: number;
  }>;
};

type AssignmentSnapshotPayload = {
  id: number;
  cmid: number;
  courseId: number;
  courseName: string;
  name: string;
  intro?: string;
  dueDate: number;
  cutoffDate: number;
  status: 'pending' | 'submitted' | 'overdue' | 'unknown';
  submissionModifiedAt?: number;
  quickLink: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const moodleBaseUrl = (Deno.env.get('MOODLE_BASE_URL') ?? 'https://sunan.umk.ac.id').replace(/\/$/, '');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const functionAuthKey = Deno.env.get('FUNCTION_AUTH_KEY') ?? '';
const acceptedAuthTokens = [serviceRoleKey, functionAuthKey].filter((token) => token.length > 0);

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

function inDoNotDisturbWindow(now: Date, settings: UserSettingsRow): boolean {
  const startMinutes = parseTimeToMinutes(settings.dnd_start);
  const endMinutes = parseTimeToMinutes(settings.dnd_end);

  if (startMinutes === null || endMinutes === null || startMinutes === endMinutes) {
    return false;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }

  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

function nextDoNotDisturbEnd(now: Date, settings: UserSettingsRow): Date {
  const fallback = new Date(now.getTime() + 30 * 60 * 1000);
  const endMinutes = parseTimeToMinutes(settings.dnd_end);

  if (endMinutes === null) {
    return fallback;
  }

  const next = new Date(now);
  next.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

function applyDoNotDisturb(scheduleDate: Date, settings: UserSettingsRow): Date {
  if (!inDoNotDisturbWindow(scheduleDate, settings)) {
    return scheduleDate;
  }

  return nextDoNotDisturbEnd(scheduleDate, settings);
}

function resolveSettings(record: UserRow): UserSettingsRow {
  const defaults: UserSettingsRow = {
    notify_new_task: true,
    notify_deadline_h1: true,
    notify_deadline_today: true,
    notify_attendance: true,
    poll_interval_minutes: 15,
    dnd_start: '22:00',
    dnd_end: '07:00',
    monitored_course_ids: [],
  };

  if (!record.user_settings) {
    return defaults;
  }

  if (Array.isArray(record.user_settings)) {
    return record.user_settings[0] ?? defaults;
  }

  return record.user_settings;
}

function appendParam(params: URLSearchParams, key: string, value: unknown): void {
  if (value === null || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendParam(params, `${key}[${index}]`, item));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
      appendParam(params, `${key}[${nestedKey}]`, nestedValue);
    });
    return;
  }

  params.append(key, String(value));
}

async function callMoodle<T>(
  token: string,
  functionName: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const body = new URLSearchParams();
  body.append('wstoken', token);
  body.append('wsfunction', functionName);
  body.append('moodlewsrestformat', 'json');

  Object.entries(params).forEach(([key, value]) => appendParam(body, key, value));

  const response = await fetch(`${moodleBaseUrl}/webservice/rest/server.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Moodle request gagal: ${response.status}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;

  if (typeof payload.exception === 'string') {
    const message = typeof payload.message === 'string' ? payload.message : 'Error dari Moodle';
    throw new Error(message);
  }

  return payload as T;
}

function mapSubmissionStatus(
  rawStatus: string | undefined,
  dueDateUnixSeconds: number,
  nowMs = Date.now()
): 'pending' | 'submitted' | 'overdue' | 'unknown' {
  if (rawStatus === 'submitted') {
    return 'submitted';
  }

  if (!rawStatus || rawStatus === 'new' || rawStatus === 'draft') {
    if (dueDateUnixSeconds > 0 && dueDateUnixSeconds * 1000 < nowMs) {
      return 'overdue';
    }
    return 'pending';
  }

  return 'unknown';
}

function buildReminderDate(kind: 'deadline_h1' | 'deadline_today', dueDateUnixSeconds: number): Date {
  const dueDate = new Date(dueDateUnixSeconds * 1000);
  const target = new Date(dueDate);

  if (kind === 'deadline_h1') {
    target.setDate(target.getDate() - 1);
  }

  const targetDateKey = toJakartaDateKey(target);
  const reminderDate = new Date(`${targetDateKey}T07:00:00+07:00`);

  if (reminderDate.getTime() < Date.now()) {
    return new Date();
  }

  return reminderDate;
}

function isDueOnTomorrowJakarta(dueDateUnixSeconds: number, now: Date): boolean {
  const dueKey = toJakartaDateKey(new Date(dueDateUnixSeconds * 1000));
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = toJakartaDateKey(tomorrow);

  return dueKey === tomorrowKey;
}

function isDueTodayJakarta(dueDateUnixSeconds: number, now: Date): boolean {
  const dueKey = toJakartaDateKey(new Date(dueDateUnixSeconds * 1000));
  const todayKey = toJakartaDateKey(now);

  return dueKey === todayKey;
}

async function hashPayload(value: unknown): Promise<string> {
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest('SHA-256', encoded);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

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

  const runStart = await supabase
    .from('polling_runs')
    .insert({ status: 'running', details: { source: 'poll-sunan-data' } })
    .select('id')
    .single();

  const runId = runStart.data?.id as number | undefined;

  try {
    const usersResult = await supabase
      .from('app_users')
      .select(
        'id,moodle_user_id,moodle_token,user_settings(notify_new_task,notify_deadline_h1,notify_deadline_today,notify_attendance,poll_interval_minutes,dnd_start,dnd_end,monitored_course_ids)'
      );

    if (usersResult.error) {
      throw new Error(usersResult.error.message);
    }

    const users = (usersResult.data ?? []) as UserRow[];
    let usersProcessed = 0;
    let snapshotsUpserted = 0;
    let notificationsQueued = 0;

    for (const user of users) {
      const settings = resolveSettings(user);
      const now = new Date();

      let courses: MoodleCourse[] = [];
      try {
        courses = await callMoodle<MoodleCourse[]>(user.moodle_token, 'core_enrol_get_users_courses', {
          userid: user.moodle_user_id,
        });
      } catch {
        continue;
      }

      const allCourseIds = courses.map((course) => course.id);
      const scopedCourseIds =
        settings.monitored_course_ids.length > 0
          ? allCourseIds.filter((courseId) => settings.monitored_course_ids.includes(courseId))
          : allCourseIds;

      if (scopedCourseIds.length === 0) {
        usersProcessed += 1;
        continue;
      }

      const assignmentsPayload = await callMoodle<MoodleAssignmentsPayload>(
        user.moodle_token,
        'mod_assign_get_assignments',
        {
          courseids: scopedCourseIds,
        }
      );

      const assignmentsRaw = assignmentsPayload.courses.flatMap((course) =>
        course.assignments.map((assignment) => ({
          assignment,
          courseName: course.fullname,
        }))
      );

      const resolvedAssignments: AssignmentSnapshotPayload[] = [];
      for (const item of assignmentsRaw) {
        let submission: MoodleSubmissionStatus | null = null;
        try {
          submission = await callMoodle<MoodleSubmissionStatus>(
            user.moodle_token,
            'mod_assign_get_submission_status',
            {
              assignid: item.assignment.id,
            }
          );
        } catch {
          submission = null;
        }

        const status = mapSubmissionStatus(
          submission?.lastattempt?.submission?.status,
          item.assignment.duedate
        );

        resolvedAssignments.push({
          id: item.assignment.id,
          cmid: item.assignment.cmid,
          courseId: item.assignment.course,
          courseName: item.courseName,
          name: item.assignment.name,
          intro: item.assignment.intro,
          dueDate: item.assignment.duedate,
          cutoffDate: item.assignment.cutoffdate,
          status,
          submissionModifiedAt: submission?.lastattempt?.submission?.timemodified,
          quickLink: `${moodleBaseUrl}/mod/assign/view.php?id=${item.assignment.cmid}`,
        });
      }

      const existingSnapshotsResult = await supabase
        .from('task_snapshots')
        .select('assignment_id,payload_hash')
        .eq('app_user_id', user.id);

      if (existingSnapshotsResult.error) {
        continue;
      }

      const existingMap = new Map<number, string>();
      for (const row of existingSnapshotsResult.data ?? []) {
        existingMap.set(row.assignment_id as number, row.payload_hash as string);
      }

      const snapshotRows: Array<Record<string, unknown>> = [];
      const queueRows: Array<Record<string, unknown>> = [];

      for (const assignment of resolvedAssignments) {
        const payloadHash = await hashPayload(assignment);
        snapshotRows.push({
          app_user_id: user.id,
          assignment_id: assignment.id,
          due_at: assignment.dueDate ? new Date(assignment.dueDate * 1000).toISOString() : null,
          status: assignment.status,
          payload_hash: payloadHash,
          payload: assignment,
        });

        const previousHash = existingMap.get(assignment.id);

        if (!previousHash && settings.notify_new_task) {
          const scheduleAt = applyDoNotDisturb(new Date(), settings);
          queueRows.push({
            app_user_id: user.id,
            notification_type: 'new_task',
            title: 'Tugas Baru SUNAN',
            body: `${assignment.name} baru dipost dosen.`,
            payload: {
              taskId: assignment.id,
              kind: 'new_task',
            },
            dedupe_key: `new-task-${user.id}-${assignment.id}-${payloadHash}`,
            schedule_at: scheduleAt.toISOString(),
          });
        }

        if (assignment.status !== 'submitted' && settings.notify_deadline_h1) {
          if (isDueOnTomorrowJakarta(assignment.dueDate, now)) {
            const reminderDate = applyDoNotDisturb(
              buildReminderDate('deadline_h1', assignment.dueDate),
              settings
            );
            queueRows.push({
              app_user_id: user.id,
              notification_type: 'deadline_h1',
              title: 'Pengingat Deadline H-1',
              body: `${assignment.name} akan deadline besok.`,
              payload: {
                taskId: assignment.id,
                kind: 'deadline_h1',
              },
              dedupe_key: `h1-${user.id}-${assignment.id}-${toJakartaDateKey(now)}`,
              schedule_at: reminderDate.toISOString(),
            });
          }
        }

        if (assignment.status !== 'submitted' && settings.notify_deadline_today) {
          if (isDueTodayJakarta(assignment.dueDate, now)) {
            const reminderDate = applyDoNotDisturb(
              buildReminderDate('deadline_today', assignment.dueDate),
              settings
            );
            queueRows.push({
              app_user_id: user.id,
              notification_type: 'deadline_today',
              title: 'Pengingat Deadline Hari Ini',
              body: `${assignment.name} deadline hari ini.`,
              payload: {
                taskId: assignment.id,
                kind: 'deadline_today',
              },
              dedupe_key: `today-${user.id}-${assignment.id}-${toJakartaDateKey(now)}`,
              schedule_at: reminderDate.toISOString(),
            });
          }
        }
      }

      if (settings.notify_attendance) {
        try {
          const calendar = await callMoodle<MoodleCalendarPayload>(
            user.moodle_token,
            'core_calendar_get_action_events_by_courses',
            {
              courseids: scopedCourseIds,
              limitnum: 100,
            }
          );

          const attendanceEvents = (calendar.events ?? []).filter((event) => {
            const normalized = event.name.toLowerCase();
            return normalized.includes('absensi') || normalized.includes('attendance');
          });

          for (const event of attendanceEvents) {
            const isWindowMatch =
              Math.abs(event.timestart * 1000 - now.getTime()) <=
              settings.poll_interval_minutes * 60 * 1000;

            const closesAtMs =
              event.timeduration && event.timeduration > 0
                ? event.timestart * 1000 + event.timeduration * 1000
                : null;

            const isClosingSoon =
              closesAtMs !== null &&
              closesAtMs > now.getTime() &&
              closesAtMs - now.getTime() <= 30 * 60 * 1000;

            if (!isWindowMatch) {
              if (!isClosingSoon) {
                continue;
              }
            }

            if (isWindowMatch) {
              const scheduleAt = applyDoNotDisturb(new Date(), settings);
              queueRows.push({
                app_user_id: user.id,
                notification_type: 'attendance_open',
                title: 'Absensi Dibuka',
                body: `${event.name} sudah dibuka. Jangan lupa isi absensi.`,
                payload: {
                  eventId: event.id,
                  kind: 'attendance_open',
                },
                dedupe_key: `attendance-open-${user.id}-${event.id}`,
                schedule_at: scheduleAt.toISOString(),
              });
            }

            if (isClosingSoon) {
              const scheduleAt = applyDoNotDisturb(new Date(), settings);
              queueRows.push({
                app_user_id: user.id,
                notification_type: 'attendance_closing',
                title: 'Absensi Segera Ditutup',
                body: `${event.name} akan segera ditutup. Segera isi absensi.`,
                payload: {
                  eventId: event.id,
                  kind: 'attendance_closing',
                },
                dedupe_key: `attendance-closing-${user.id}-${event.id}-${toJakartaDateKey(now)}`,
                schedule_at: scheduleAt.toISOString(),
              });
            }
          }
        } catch {
          // Attendance polling failure should not block task polling.
        }
      }

      if (snapshotRows.length > 0) {
        const upsertResult = await supabase.from('task_snapshots').upsert(snapshotRows, {
          onConflict: 'app_user_id,assignment_id',
        });

        if (!upsertResult.error) {
          snapshotsUpserted += snapshotRows.length;
        }
      }

      if (queueRows.length > 0) {
        const queueResult = await supabase.from('notification_queue').insert(queueRows, {
          onConflict: 'dedupe_key',
          ignoreDuplicates: true,
        });

        if (!queueResult.error) {
          notificationsQueued += queueRows.length;
        }
      }

      usersProcessed += 1;
    }

    if (runId) {
      await supabase
        .from('polling_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          details: {
            users_processed: usersProcessed,
            snapshots_upserted: snapshotsUpserted,
            notifications_queued: notificationsQueued,
          },
        })
        .eq('id', runId);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        usersProcessed,
        snapshotsUpserted,
        notificationsQueued,
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
    if (runId) {
      await supabase
        .from('polling_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          notes: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', runId);
    }

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
