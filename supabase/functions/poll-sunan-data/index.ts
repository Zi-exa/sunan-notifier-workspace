import { createClient } from 'npm:@supabase/supabase-js@2';

type UserSettingsRow = {
  notify_new_task: boolean;
  notify_deadline_h1: boolean;
  notify_deadline_today: boolean;
  notify_task_open: boolean;
  notify_attendance: boolean;
  poll_interval_minutes: number;
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
  allowsubmissionsfromdate?: number;
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

type MoodleQuiz = {
  id: number;
  course: number;
  coursemodule?: number;
  cmid?: number;
  name: string;
  intro?: string;
  timeopen: number;
  timeclose: number;
};

type MoodleQuizzesPayload = {
  quizzes?: MoodleQuiz[];
};

type MoodleQuizAttempt = {
  state?: string;
  timemodified?: number;
  timefinish?: number;
};

type MoodleQuizAttemptsPayload = {
  attempts?: MoodleQuizAttempt[];
};

type MoodleCalendarEvent = {
  id: number;
  name: string;
  timestart: number;
  timeduration: number;
  description?: string;
  url?: string;
  modulename?: string;
  eventtype?: string;
  instance?: number;
  courseid?: number;
  course?: {
    id?: number;
    fullname?: string;
    shortname?: string;
  };
};

type AssignmentSnapshotPayload = {
  id: number;
  sourceId: number;
  activityType: 'assignment' | 'quiz';
  cmid: number;
  courseId: number;
  courseName: string;
  name: string;
  intro?: string;
  openDate?: number;
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
const QUIZ_TASK_ID_OFFSET = 2_000_000_000;
const ATTENDANCE_KEYWORDS = [
  'absensi',
  'presensi',
  'attendance',
  'kehadiran',
  'daftar hadir',
  'daftar kehadiran',
  'check in',
  'check-in',
];
const ATTENDANCE_MODULE_NAMES = new Set(['attendance', 'mod_attendance']);
const ATTENDANCE_URL_HINTS = ['/mod/attendance/', '/attendance/view.php'];

const jakartaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function toJakartaDateKey(date: Date): string {
  return jakartaDateFormatter.format(date);
}

function resolveSettings(record: UserRow): UserSettingsRow {
  const defaults: UserSettingsRow = {
    notify_new_task: true,
    notify_deadline_h1: true,
    notify_deadline_today: true,
    notify_task_open: true,
    notify_attendance: true,
    poll_interval_minutes: 15,
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

function buildTaskId(activityType: 'assignment' | 'quiz', sourceId: number): number {
  return activityType === 'quiz' ? QUIZ_TASK_ID_OFFSET + sourceId : sourceId;
}

function stripHtml(value: string | undefined): string {
  return (value ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeText(value: string | undefined): string {
  return stripHtml(value).toLowerCase();
}

function normalizeUrl(value: string | undefined): string {
  return normalizeText(value).replace(/#.*$/, '');
}

function isAttendanceEvent(event: MoodleCalendarEvent): boolean {
  const moduleName = normalizeText(event.modulename);
  if (ATTENDANCE_MODULE_NAMES.has(moduleName)) {
    return true;
  }

  const eventType = normalizeText(event.eventtype);
  if (eventType.includes('attendance') || eventType.includes('presensi') || eventType.includes('absensi')) {
    return true;
  }

  const eventUrl = normalizeUrl(event.url);
  if (ATTENDANCE_URL_HINTS.some((hint) => eventUrl.includes(hint))) {
    return true;
  }

  const targetText = normalizeText(
    `${event.name} ${event.description ?? ''} ${event.course?.fullname ?? ''} ${event.course?.shortname ?? ''}`
  );

  return ATTENDANCE_KEYWORDS.some((keyword) => targetText.includes(keyword));
}

function toCalendarEventArray(value: unknown): MoodleCalendarEvent[] {
  const rawEvents = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? Object.values(value as Record<string, unknown>)
      : [];

  return rawEvents.flatMap((event) => {
    if (!event || typeof event !== 'object') {
      return [];
    }

    const raw = event as Partial<MoodleCalendarEvent> & { id?: unknown; timestart?: unknown };
    const rawCourse =
      raw.course && typeof raw.course === 'object' ? (raw.course as Record<string, unknown>) : undefined;
    const id = typeof raw.id === 'number' ? raw.id : Number(raw.id);
    const timestart = typeof raw.timestart === 'number' ? raw.timestart : Number(raw.timestart);

    if (!Number.isFinite(id) || !Number.isFinite(timestart)) {
      return [];
    }

    return [
      {
        ...raw,
        id,
        name: stripHtml(raw.name) || `Event #${id}`,
        description: stripHtml(raw.description) || undefined,
        timestart,
        timeduration:
          typeof raw.timeduration === 'number' ? raw.timeduration : Number(raw.timeduration ?? 0),
        courseid:
          typeof raw.courseid === 'number'
            ? raw.courseid
            : raw.courseid !== undefined
              ? Number(raw.courseid)
              : rawCourse && rawCourse.id !== undefined
                ? Number(rawCourse.id)
                : undefined,
        instance:
          typeof raw.instance === 'number'
            ? raw.instance
            : raw.instance !== undefined
              ? Number(raw.instance)
              : undefined,
      } as MoodleCalendarEvent,
    ];
  });
}

function extractActionEventsFromPayload(payload: unknown): MoodleCalendarEvent[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const parsed = payload as Record<string, unknown>;
  const directEvents = toCalendarEventArray(parsed.events);
  if (directEvents.length > 0) {
    return directEvents;
  }

  const grouped = parsed.groupedbycourse;
  if (Array.isArray(grouped)) {
    return grouped.flatMap((groupedItem) => {
      if (!groupedItem || typeof groupedItem !== 'object') {
        return [];
      }

      return toCalendarEventArray((groupedItem as Record<string, unknown>).events);
    });
  }

  if (grouped && typeof grouped === 'object') {
    return Object.values(grouped as Record<string, unknown>).flatMap((groupedItem) => {
      if (Array.isArray(groupedItem)) {
        return toCalendarEventArray(groupedItem);
      }

      if (groupedItem && typeof groupedItem === 'object') {
        return toCalendarEventArray((groupedItem as Record<string, unknown>).events);
      }

      return [];
    });
  }

  return [];
}

function extractUpcomingEventsFromPayload(payload: unknown): MoodleCalendarEvent[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const parsed = payload as Record<string, unknown>;
  const directEvents = toCalendarEventArray(parsed.events);
  if (directEvents.length > 0) {
    return directEvents;
  }

  return Object.values(parsed).flatMap((value) => {
    if (!value || typeof value !== 'object') {
      return [];
    }

    return toCalendarEventArray((value as Record<string, unknown>).events);
  });
}

function mergeCalendarEvents(
  primaryEvents: MoodleCalendarEvent[],
  secondaryEvents: MoodleCalendarEvent[]
): MoodleCalendarEvent[] {
  const mergedById = new Map<number, MoodleCalendarEvent>();

  [...secondaryEvents, ...primaryEvents].forEach((event) => {
    mergedById.set(event.id, event);
  });

  return [...mergedById.values()].sort((a, b) => a.timestart - b.timestart);
}

async function getAttendanceEvents(
  token: string,
  courseIds: number[],
  now: Date,
  pollingWindowMinutes: number
): Promise<MoodleCalendarEvent[]> {
  const nowUnix = Math.floor(now.getTime() / 1000);
  const windowSeconds = pollingWindowMinutes * 60;
  const timeStart = nowUnix - Math.max(windowSeconds, 24 * 60 * 60);
  const timeEnd = nowUnix + windowSeconds;
  let actionEvents: MoodleCalendarEvent[] = [];
  let upcomingEvents: MoodleCalendarEvent[] = [];

  try {
    const actionPayload = await callMoodle<unknown>(token, 'core_calendar_get_action_events_by_courses', {
      courseids: courseIds,
      timesortfrom: timeStart,
      timesortto: timeEnd,
      limitnum: 100,
    });
    actionEvents = extractActionEventsFromPayload(actionPayload);
  } catch {
    actionEvents = [];
  }

  try {
    const upcomingPayload = await callMoodle<unknown>(token, 'core_calendar_get_calendar_upcoming_view');
    upcomingEvents = extractUpcomingEventsFromPayload(upcomingPayload).filter(
      (event) => courseIds.length === 0 || !event.courseid || courseIds.includes(event.courseid)
    );
  } catch {
    upcomingEvents = [];
  }

  return mergeCalendarEvents(upcomingEvents, actionEvents).filter((event) => isAttendanceEvent(event));
}

function resolveAttendanceOpenSchedule(
  event: MoodleCalendarEvent,
  now: Date,
  pollingWindowMinutes: number
): Date | null {
  const nowMs = now.getTime();
  const startsAtMs = event.timestart * 1000;
  const pollingWindowMs = pollingWindowMinutes * 60 * 1000;
  const startsWithinNextWindow = startsAtMs >= nowMs && startsAtMs <= nowMs + pollingWindowMs;

  if (startsWithinNextWindow) {
    return new Date(startsAtMs);
  }

  if (startsAtMs > nowMs) {
    return null;
  }

  if (event.timeduration && event.timeduration > 0) {
    const closesAtMs = startsAtMs + event.timeduration * 1000;
    return closesAtMs > nowMs ? new Date(nowMs) : null;
  }

  return toJakartaDateKey(new Date(startsAtMs)) === toJakartaDateKey(now)
    ? new Date(nowMs)
    : null;
}

function toAssignmentSnapshot(courseName: string, assignment: MoodleAssignment): AssignmentSnapshotPayload {
  return {
    id: buildTaskId('assignment', assignment.id),
    sourceId: assignment.id,
    activityType: 'assignment',
    cmid: assignment.cmid,
    courseId: assignment.course,
    courseName,
    name: stripHtml(assignment.name) || `Tugas #${assignment.id}`,
    intro: stripHtml(assignment.intro) || undefined,
    openDate:
      typeof assignment.allowsubmissionsfromdate === 'number' && assignment.allowsubmissionsfromdate > 0
        ? assignment.allowsubmissionsfromdate
        : undefined,
    dueDate: assignment.duedate,
    cutoffDate: assignment.cutoffdate,
    status: 'pending',
    quickLink: `${moodleBaseUrl}/mod/assign/view.php?id=${assignment.cmid}`,
  };
}

function toQuizSnapshot(quiz: MoodleQuiz, courseName?: string): AssignmentSnapshotPayload {
  const sourceId = quiz.id;
  const cmid = quiz.cmid ?? quiz.coursemodule ?? sourceId;
  const dueDate = quiz.timeclose > 0 ? quiz.timeclose : quiz.timeopen;

  return {
    id: buildTaskId('quiz', sourceId),
    sourceId,
    activityType: 'quiz',
    cmid,
    courseId: quiz.course,
    courseName: courseName ?? `Matkul #${quiz.course}`,
    name: stripHtml(quiz.name) || `Quiz #${quiz.id}`,
    intro: stripHtml(quiz.intro) || undefined,
    openDate: quiz.timeopen > 0 ? quiz.timeopen : undefined,
    dueDate,
    cutoffDate: dueDate,
    status: mapSubmissionStatus(undefined, dueDate),
    quickLink:
      cmid > 0
        ? `${moodleBaseUrl}/mod/quiz/view.php?id=${cmid}`
        : `${moodleBaseUrl}/mod/quiz/view.php?q=${quiz.id}`,
  };
}

async function resolveAssignmentStatus(
  token: string,
  assignment: AssignmentSnapshotPayload
): Promise<Pick<AssignmentSnapshotPayload, 'status' | 'submissionModifiedAt'>> {
  if (assignment.activityType === 'quiz') {
    try {
      const attemptsPayload = await callMoodle<MoodleQuizAttemptsPayload>(
        token,
        'mod_quiz_get_user_attempts',
        {
          quizid: assignment.sourceId,
          status: 'all',
          includepreviews: 0,
        }
      );
      const attempts = attemptsPayload.attempts ?? [];
      const states = attempts.map((attempt) => (attempt.state ?? '').toLowerCase());
      const hasFinishedAttempt = states.some((state) => state === 'finished' || state === 'submitted');
      const hasOverdueAttempt = states.some((state) => state === 'overdue');
      const submissionModifiedAt = attempts.reduce((maxTimestamp, attempt) => {
        const modifiedAt =
          typeof attempt.timemodified === 'number' && attempt.timemodified > 0
            ? attempt.timemodified
            : typeof attempt.timefinish === 'number' && attempt.timefinish > 0
              ? attempt.timefinish
              : 0;

        return modifiedAt > maxTimestamp ? modifiedAt : maxTimestamp;
      }, 0);

      if (hasFinishedAttempt) {
        return {
          status: 'submitted',
          submissionModifiedAt: submissionModifiedAt || undefined,
        };
      }

      if (hasOverdueAttempt) {
        return {
          status: 'overdue',
          submissionModifiedAt: submissionModifiedAt || undefined,
        };
      }
    } catch {
      // Leave quiz status as the time-based fallback if attempts are unavailable.
    }

    return {
      status: mapSubmissionStatus(undefined, assignment.dueDate),
      submissionModifiedAt: undefined,
    };
  }

  try {
    const submission = await callMoodle<MoodleSubmissionStatus>(
      token,
      'mod_assign_get_submission_status',
      {
        assignid: assignment.sourceId,
      }
    );

    return {
      status: mapSubmissionStatus(
        submission.lastattempt?.submission?.status,
        assignment.dueDate
      ),
      submissionModifiedAt: submission.lastattempt?.submission?.timemodified,
    };
  } catch {
    return {
      status: assignment.status,
      submissionModifiedAt: undefined,
    };
  }
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

function buildTaskClosingReminderDate(dueDateUnixSeconds: number, now: Date): Date | null {
  const dueDateMs = dueDateUnixSeconds * 1000;
  const nowMs = now.getTime();

  if (!Number.isFinite(dueDateMs) || dueDateMs <= nowMs) {
    return null;
  }

  const thirtyMinutesBeforeDue = dueDateMs - 30 * 60 * 1000;
  return new Date(Math.max(thirtyMinutesBeforeDue, nowMs));
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
        'id,moodle_user_id,moodle_token,user_settings(notify_new_task,notify_deadline_h1,notify_deadline_today,notify_task_open,notify_attendance,poll_interval_minutes,monitored_course_ids)'
      );

    if (usersResult.error) {
      throw new Error(usersResult.error.message);
    }

    const users = (usersResult.data ?? []) as UserRow[];
    let usersProcessed = 0;
    let snapshotsUpserted = 0;
    let notificationsQueued = 0;
    let attendanceEventsDetected = 0;

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

      const courseNameById = new Map<number, string>();
      courses.forEach((course) => {
        courseNameById.set(course.id, course.fullname);
      });
      assignmentsPayload.courses.forEach((course) => {
        courseNameById.set(course.id, course.fullname);
      });

      const assignmentSnapshots = assignmentsPayload.courses.flatMap((course) =>
        course.assignments.map((assignment) => toAssignmentSnapshot(course.fullname, assignment))
      );

      let quizSnapshots: AssignmentSnapshotPayload[] = [];
      try {
        const quizPayload = await callMoodle<MoodleQuizzesPayload>(
          user.moodle_token,
          'mod_quiz_get_quizzes_by_courses',
          {
            courseids: scopedCourseIds,
          }
        );

        quizSnapshots = (quizPayload.quizzes ?? []).map((quiz) =>
          toQuizSnapshot(quiz, courseNameById.get(quiz.course))
        );
      } catch {
        quizSnapshots = [];
      }

      const resolvedAssignments: AssignmentSnapshotPayload[] = [];
      for (const assignment of [...assignmentSnapshots, ...quizSnapshots]) {
        const statusInfo = await resolveAssignmentStatus(user.moodle_token, assignment);
        resolvedAssignments.push({
          ...assignment,
          status: statusInfo.status,
          submissionModifiedAt: statusInfo.submissionModifiedAt,
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
          const scheduleAt = new Date();
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
            const reminderDate = buildReminderDate('deadline_h1', assignment.dueDate);
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
            const reminderDate = buildReminderDate('deadline_today', assignment.dueDate);
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

          const closingReminderDate = buildTaskClosingReminderDate(assignment.dueDate, now);
          if (closingReminderDate) {
            queueRows.push({
              app_user_id: user.id,
              notification_type: 'task_closing',
              title: 'Tugas Hampir Deadline',
              body: `${assignment.name} deadline kurang dari 30 menit lagi.`,
              payload: {
                taskId: assignment.id,
                kind: 'task_closing',
              },
              dedupe_key: `closing-${user.id}-${assignment.id}-${assignment.dueDate}`,
              schedule_at: closingReminderDate.toISOString(),
            });
          }
        }
      }

      if (settings.notify_attendance) {
        try {
          const attendanceEvents = await getAttendanceEvents(
            user.moodle_token,
            scopedCourseIds,
            now,
            settings.poll_interval_minutes
          );
          attendanceEventsDetected += attendanceEvents.length;

          for (const event of attendanceEvents) {
            const startsAtMs = event.timestart * 1000;
            const openScheduleDate = resolveAttendanceOpenSchedule(
              event,
              now,
              settings.poll_interval_minutes
            );

            const closesAtMs =
              event.timeduration && event.timeduration > 0
                ? startsAtMs + event.timeduration * 1000
                : null;

            const isClosingSoon =
              closesAtMs !== null &&
              closesAtMs > now.getTime() &&
              closesAtMs - now.getTime() <= 30 * 60 * 1000;

            if (!openScheduleDate) {
              if (!isClosingSoon) {
                continue;
              }
            }

            if (openScheduleDate) {
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
                schedule_at: openScheduleDate.toISOString(),
              });
            }

            if (isClosingSoon) {
              const scheduleAt = new Date();
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
            attendance_events_detected: attendanceEventsDetected,
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
