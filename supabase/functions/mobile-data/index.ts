import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const moodleBaseUrl = (Deno.env.get('MOODLE_BASE_URL') ?? 'https://sunan.umk.ac.id').replace(/\/$/, '');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

type UserSettingsInput = {
  notifyNewTask: boolean;
  notifyDeadlineH1: boolean;
  notifyDeadlineToday: boolean;
  notifyTaskOpen: boolean;
  notifyAttendance: boolean;
  pollIntervalMinutes: 15 | 30 | 60;
  monitoredCourseIds: number[];
};

type RequestPayload = {
  action?: 'sync-profile' | 'load-settings' | 'save-settings' | 'upsert-device' | 'deactivate-device';
  moodleToken?: string;
  moodleUserId?: number;
  nim?: string;
  fullname?: string;
  settings?: UserSettingsInput;
  pushToken?: string;
  deviceKey?: string;
  platform?: string;
};

type MoodleSiteInfo = {
  userid: number;
  fullname: string;
  username?: string;
};

type AppUserRow = {
  id: string;
  moodle_user_id: number;
};

type UserSettingsRow = Record<string, unknown>;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

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
    const message = typeof payload.message === 'string' ? payload.message : 'Token SUNAN tidak valid';
    throw new Error(message);
  }

  return payload as T;
}

async function validateMoodleToken(moodleToken: string, moodleUserId: number): Promise<MoodleSiteInfo> {
  const siteInfo = await callMoodle<MoodleSiteInfo>(moodleToken, 'core_webservice_get_site_info');

  if (siteInfo.userid !== moodleUserId) {
    throw new Error('Token SUNAN tidak cocok dengan akun yang dipakai.');
  }

  return siteInfo;
}

function normalizeMonitoredCourseIds(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
}

function toRemoteUserSettings(data: Record<string, unknown>, includeNotifyTaskOpen: boolean) {
  return {
    notifyNewTask: Boolean(data.notify_new_task),
    notifyDeadlineH1: Boolean(data.notify_deadline_h1),
    notifyDeadlineToday: Boolean(data.notify_deadline_today),
    notifyTaskOpen: includeNotifyTaskOpen ? Boolean(data.notify_task_open) : undefined,
    notifyAttendance: Boolean(data.notify_attendance),
    pollIntervalMinutes: Number(data.poll_interval_minutes) as 15 | 30 | 60,
    monitoredCourseIds: normalizeMonitoredCourseIds(data.monitored_course_ids),
  };
}

function isMissingNotifyTaskOpenColumnError(error: { code?: string | null; message?: string | null; details?: string | null; hint?: string | null } | null | undefined): boolean {
  if (!error) {
    return false;
  }

  const haystack = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    (haystack.includes('notify_task_open') &&
      (haystack.includes('column') || haystack.includes('schema cache')))
  );
}

async function ensureAppUser(input: {
  moodleUserId: number;
  nim?: string;
  fullname?: string;
  moodleToken: string;
  siteInfo: MoodleSiteInfo;
}): Promise<AppUserRow> {
  const fullname = input.fullname?.trim() || input.siteInfo.fullname.trim();
  const nim = input.nim?.trim();

  if (!nim || !fullname) {
    const { data: existing, error: existingError } = await supabase
      .from('app_users')
      .select('id,moodle_user_id')
      .eq('moodle_user_id', input.moodleUserId)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existing) {
      throw new Error('Data akun belum lengkap untuk sinkronisasi.');
    }

    return existing as AppUserRow;
  }

  const { data, error } = await supabase
    .from('app_users')
    .upsert(
      {
        moodle_user_id: input.moodleUserId,
        nim,
        fullname,
        moodle_token: input.moodleToken,
        token_updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'moodle_user_id',
      }
    )
    .select('id,moodle_user_id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const appUser = data as AppUserRow;

  await supabase.from('user_settings').upsert(
    {
      app_user_id: appUser.id,
    },
    {
      onConflict: 'app_user_id',
      ignoreDuplicates: false,
    }
  );

  return appUser;
}

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = (await request.json()) as RequestPayload;
    const action = payload.action;
    const moodleToken = payload.moodleToken?.trim();
    const moodleUserId = Number(payload.moodleUserId);

    if (!action || !moodleToken || !Number.isFinite(moodleUserId)) {
      return jsonResponse(400, {
        error: 'Permintaan tidak lengkap.',
      });
    }

    const siteInfo = await validateMoodleToken(moodleToken, moodleUserId);
    const appUser = await ensureAppUser({
      moodleUserId,
      nim: payload.nim,
      fullname: payload.fullname,
      moodleToken,
      siteInfo,
    });

    if (action === 'sync-profile') {
      return jsonResponse(200, {
        appUserId: appUser.id,
      });
    }

    if (action === 'load-settings') {
      const { data, error } = await supabase
        .from('user_settings')
        .select(
          'notify_new_task,notify_deadline_h1,notify_deadline_today,notify_task_open,notify_attendance,poll_interval_minutes,monitored_course_ids'
        )
        .eq('app_user_id', appUser.id)
        .maybeSingle();

      if (error && isMissingNotifyTaskOpenColumnError(error)) {
        const { data: legacyData, error: legacyError } = await supabase
          .from('user_settings')
          .select(
            'notify_new_task,notify_deadline_h1,notify_deadline_today,notify_attendance,poll_interval_minutes,monitored_course_ids'
          )
          .eq('app_user_id', appUser.id)
          .maybeSingle();

        if (legacyError) {
          throw new Error(legacyError.message);
        }

        return jsonResponse(200, {
          appUserId: appUser.id,
          settings: legacyData
            ? toRemoteUserSettings(legacyData as Record<string, unknown>, false)
            : null,
        });
      }

      if (error) {
        throw new Error(error.message);
      }

      return jsonResponse(200, {
        appUserId: appUser.id,
        settings: data ? toRemoteUserSettings(data as Record<string, unknown>, true) : null,
      });
    }

    if (action === 'save-settings') {
      const settings = payload.settings;

      if (!settings) {
        return jsonResponse(400, {
          error: 'Pengaturan belum dikirim.',
        });
      }

      const basePayload = {
        app_user_id: appUser.id,
        notify_new_task: settings.notifyNewTask,
        notify_deadline_h1: settings.notifyDeadlineH1,
        notify_deadline_today: settings.notifyDeadlineToday,
        notify_attendance: settings.notifyAttendance,
        poll_interval_minutes: settings.pollIntervalMinutes,
        monitored_course_ids: settings.monitoredCourseIds,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('user_settings').upsert(
        {
          ...basePayload,
          notify_task_open: settings.notifyTaskOpen,
        },
        {
          onConflict: 'app_user_id',
        }
      );

      if (error && isMissingNotifyTaskOpenColumnError(error)) {
        const { error: legacyError } = await supabase.from('user_settings').upsert(basePayload, {
          onConflict: 'app_user_id',
        });

        if (legacyError) {
          throw new Error(legacyError.message);
        }

        return jsonResponse(200, {
          appUserId: appUser.id,
          result: 'legacy-notify-task-open',
        });
      }

      if (error) {
        throw new Error(error.message);
      }

      return jsonResponse(200, {
        appUserId: appUser.id,
        result: 'full',
      });
    }

    if (action === 'upsert-device') {
      const pushToken = payload.pushToken?.trim();
      const deviceKey = payload.deviceKey?.trim();
      const platform = payload.platform?.trim() || 'unknown';
      const nowIso = new Date().toISOString();

      if (!pushToken) {
        return jsonResponse(400, {
          error: 'Push token belum dikirim.',
        });
      }

      if (deviceKey) {
        const { error: staleDeviceError } = await supabase
          .from('user_devices')
          .update({
            active: false,
            device_key: null,
            updated_at: nowIso,
          })
          .eq('device_key', deviceKey)
          .neq('expo_push_token', pushToken);

        if (staleDeviceError) {
          throw new Error(staleDeviceError.message);
        }

        const { error: legacyCleanupError } = await supabase
          .from('user_devices')
          .update({
            active: false,
            updated_at: nowIso,
          })
          .eq('app_user_id', appUser.id)
          .eq('platform', platform)
          .is('device_key', null);

        if (legacyCleanupError) {
          throw new Error(legacyCleanupError.message);
        }
      }

      const devicePayload = {
        app_user_id: appUser.id,
        expo_push_token: pushToken,
        device_key: deviceKey || null,
        platform,
        active: true,
        last_seen_at: nowIso,
      };

      const { error } = await supabase.from('user_devices').upsert(devicePayload, {
        onConflict: 'expo_push_token',
      });

      if (error) {
        throw new Error(error.message);
      }

      return jsonResponse(200, {
        appUserId: appUser.id,
        ok: true,
      });
    }

    if (action === 'deactivate-device') {
      const deviceKey = payload.deviceKey?.trim();
      const pushToken = payload.pushToken?.trim();

      if (!deviceKey && !pushToken) {
        return jsonResponse(200, {
          appUserId: appUser.id,
          ok: true,
        });
      }

      const updatePayload = {
        active: false,
        updated_at: new Date().toISOString(),
      };

      const { error } = deviceKey
        ? await supabase
            .from('user_devices')
            .update(updatePayload)
            .eq('app_user_id', appUser.id)
            .eq('device_key', deviceKey)
        : await supabase
            .from('user_devices')
            .update(updatePayload)
            .eq('app_user_id', appUser.id)
            .eq('expo_push_token', pushToken);

      if (error) {
        throw new Error(error.message);
      }

      return jsonResponse(200, {
        appUserId: appUser.id,
        ok: true,
      });
    }

    return jsonResponse(400, {
      error: 'Aksi tidak dikenali.',
    });
  } catch (error) {
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
