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
  id_pengguna_moodle: number;
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

function toRemoteUserSettings(data: Record<string, unknown>) {
  return {
    notifyNewTask: Boolean(data.notifikasi_tugas_baru),
    notifyDeadlineH1: Boolean(data.notifikasi_deadline_h1),
    notifyDeadlineToday: Boolean(data.notifikasi_deadline_hari_ini),
    notifyTaskOpen: Boolean(data.notifikasi_tugas_dibuka),
    notifyAttendance: Boolean(data.notifikasi_absensi),
    pollIntervalMinutes: Number(data.interval_sinkronisasi_menit) as 15 | 30 | 60,
    monitoredCourseIds: normalizeMonitoredCourseIds(data.id_mata_kuliah_dipantau),
  };
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
      .from('tabel_mahasiswa')
      .select('id,id_pengguna_moodle')
      .eq('id_pengguna_moodle', input.moodleUserId)
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
    .from('tabel_mahasiswa')
    .upsert(
      {
        id_pengguna_moodle: input.moodleUserId,
        nim,
        nama_lengkap: fullname,
        token_moodle: input.moodleToken,
        token_diperbarui_pada: new Date().toISOString(),
      },
      {
        onConflict: 'id_pengguna_moodle',
      }
    )
    .select('id,id_pengguna_moodle')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const appUser = data as AppUserRow;

  await supabase.from('tabel_pengaturan_mahasiswa').upsert(
    {
      id_mahasiswa: appUser.id,
    },
    {
      onConflict: 'id_mahasiswa',
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
        .from('tabel_pengaturan_mahasiswa')
        .select(
          'notifikasi_tugas_baru,notifikasi_deadline_h1,notifikasi_deadline_hari_ini,notifikasi_tugas_dibuka,notifikasi_absensi,interval_sinkronisasi_menit,id_mata_kuliah_dipantau'
        )
        .eq('id_mahasiswa', appUser.id)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return jsonResponse(200, {
        appUserId: appUser.id,
        settings: data ? toRemoteUserSettings(data as Record<string, unknown>) : null,
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
        id_mahasiswa: appUser.id,
        notifikasi_tugas_baru: settings.notifyNewTask,
        notifikasi_deadline_h1: settings.notifyDeadlineH1,
        notifikasi_deadline_hari_ini: settings.notifyDeadlineToday,
        notifikasi_absensi: settings.notifyAttendance,
        interval_sinkronisasi_menit: settings.pollIntervalMinutes,
        id_mata_kuliah_dipantau: settings.monitoredCourseIds,
        diperbarui_pada: new Date().toISOString(),
      };

      const { error } = await supabase.from('tabel_pengaturan_mahasiswa').upsert(
        {
          ...basePayload,
          notifikasi_tugas_dibuka: settings.notifyTaskOpen,
        },
        {
          onConflict: 'id_mahasiswa',
        }
      );

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
          .from('tabel_perangkat_mahasiswa')
          .update({
            aktif: false,
            kunci_perangkat: null,
            diperbarui_pada: nowIso,
          })
          .eq('kunci_perangkat', deviceKey)
          .neq('token_perangkat', pushToken);

        if (staleDeviceError) {
          throw new Error(staleDeviceError.message);
        }

        const { error: legacyCleanupError } = await supabase
          .from('tabel_perangkat_mahasiswa')
          .update({
            aktif: false,
            diperbarui_pada: nowIso,
          })
          .eq('id_mahasiswa', appUser.id)
          .eq('platform_perangkat', platform)
          .is('kunci_perangkat', null);

        if (legacyCleanupError) {
          throw new Error(legacyCleanupError.message);
        }
      }

      const devicePayload = {
        id_mahasiswa: appUser.id,
        token_perangkat: pushToken,
        kunci_perangkat: deviceKey || null,
        platform_perangkat: platform,
        aktif: true,
        terakhir_aktif_pada: nowIso,
      };

      const { error } = await supabase.from('tabel_perangkat_mahasiswa').upsert(devicePayload, {
        onConflict: 'token_perangkat',
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
        aktif: false,
        diperbarui_pada: new Date().toISOString(),
      };

      const { error } = deviceKey
        ? await supabase
            .from('tabel_perangkat_mahasiswa')
            .update(updatePayload)
            .eq('id_mahasiswa', appUser.id)
            .eq('kunci_perangkat', deviceKey)
        : await supabase
            .from('tabel_perangkat_mahasiswa')
            .update(updatePayload)
            .eq('id_mahasiswa', appUser.id)
            .eq('token_perangkat', pushToken);

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
