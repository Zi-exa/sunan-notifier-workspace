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
  id_mahasiswa: string;
  notifikasi_deadline_h1: boolean;
  notifikasi_deadline_hari_ini: boolean;
};

type SnapshotRow = {
  id_mahasiswa: string;
  id_tugas: number;
  status: string;
  isi_data: {
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

function scheduleAtSevenJakarta(targetDateKey: string): Date {
  return new Date(`${targetDateKey}T07:00:00+07:00`);
}

function buildDeadlineDedupeKey(
  kind: 'deadline_h1' | 'deadline_today',
  appUserId: string,
  assignmentId: number,
  reminderDateKey: string
): string {
  const scope = kind === 'deadline_h1' ? 'deadline-h1' : 'deadline-today';
  return `${scope}-${appUserId}-${assignmentId}-${reminderDateKey}`;
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
      .from('tabel_pengaturan_mahasiswa')
      .select('id_mahasiswa,notifikasi_deadline_h1,notifikasi_deadline_hari_ini');

    if (settingsResult.error) {
      throw new Error(settingsResult.error.message);
    }

    const settingsRows = (settingsResult.data ?? []) as SettingsRow[];
    const settingsMap = new Map<string, SettingsRow>();
    for (const row of settingsRows) {
      settingsMap.set(row.id_mahasiswa, row);
    }

    const snapshotsResult = await supabase
      .from('tabel_snapshot_tugas')
      .select('id_mahasiswa,id_tugas,status,isi_data');

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

      const settings = settingsMap.get(snapshot.id_mahasiswa);
      if (!settings) {
        continue;
      }

      const dueDateUnix = Number(snapshot.isi_data?.dueDate ?? 0);
      if (!dueDateUnix) {
        continue;
      }

      const dueDateKey = toJakartaDateKey(new Date(dueDateUnix * 1000));

      if (settings.notifikasi_deadline_h1 && dueDateKey === tomorrowKey) {
        const scheduleAt = scheduleAtSevenJakarta(todayKey);

        queueRows.push({
          id_mahasiswa: snapshot.id_mahasiswa,
          jenis_notifikasi: 'deadline_h1',
          judul_notifikasi: 'Pengingat Deadline H-1',
          isi_notifikasi: `${snapshot.isi_data.name} akan deadline besok.`,
          isi_data: {
            taskId: snapshot.id_tugas,
            kind: 'deadline_h1',
          },
          kunci_anti_duplikat: buildDeadlineDedupeKey(
            'deadline_h1',
            snapshot.id_mahasiswa,
            snapshot.id_tugas,
            todayKey
          ),
          jadwal_kirim: scheduleAt.toISOString(),
        });
      }

      if (settings.notifikasi_deadline_hari_ini && dueDateKey === todayKey) {
        let scheduleAt = scheduleAtSevenJakarta(todayKey);
        if (scheduleAt.getTime() < now.getTime()) {
          scheduleAt = now;
        }

        queueRows.push({
          id_mahasiswa: snapshot.id_mahasiswa,
          jenis_notifikasi: 'deadline_today',
          judul_notifikasi: 'Pengingat Deadline Hari Ini',
          isi_notifikasi: `${snapshot.isi_data.name} deadline hari ini.`,
          isi_data: {
            taskId: snapshot.id_tugas,
            kind: 'deadline_today',
          },
          kunci_anti_duplikat: buildDeadlineDedupeKey(
            'deadline_today',
            snapshot.id_mahasiswa,
            snapshot.id_tugas,
            todayKey
          ),
          jadwal_kirim: scheduleAt.toISOString(),
        });
      }

      if (settings.notifikasi_deadline_hari_ini) {
        const closingReminderDate = buildTaskClosingReminderDate(dueDateUnix, now);
        if (closingReminderDate) {
          queueRows.push({
            id_mahasiswa: snapshot.id_mahasiswa,
            jenis_notifikasi: 'task_closing',
            judul_notifikasi: 'Tugas Hampir Deadline',
            isi_notifikasi: `${snapshot.isi_data.name} deadline kurang dari 30 menit lagi.`,
            isi_data: {
              taskId: snapshot.id_tugas,
              kind: 'task_closing',
            },
            kunci_anti_duplikat: `closing-${snapshot.id_mahasiswa}-${snapshot.id_tugas}-${dueDateUnix}`,
            jadwal_kirim: closingReminderDate.toISOString(),
          });
        }
      }
    }

    if (queueRows.length > 0) {
      const insertResult = await supabase.from('tabel_antrian_notifikasi').upsert(queueRows, {
        onConflict: 'kunci_anti_duplikat',
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
