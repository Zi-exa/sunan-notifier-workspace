/**
 * supabase/functions/poll-materi-baru/index.ts
 *
 * Edge Function untuk fitur "Materi Baru":
 *  - Ambil core_course_get_contents per mata kuliah yang dipantau
 *  - Bandingkan modul dengan tabel_snapshot_materi (diff via hash_data)
 *  - Modul baru -> enqueue notifikasi 'materi_baru' ke tabel_antrian_notifikasi
 *
 * Dijalankan via pg_cron SETIAP 6 JAM (bukan 15 menit) supaya ringan.
 * Pola kode mengikuti poll-sunan-data/index.ts.
 *
 * Prasyarat: migrasi 20261007190000_tambah_fitur_materi_baru.sql sudah di-apply,
 * dan probe-sunan.js mengonfirmasi core_course_get_contents bisa dipanggil.
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

type PengaturanRow = {
  id_mahasiswa: string;
  notifikasi_materi_baru: boolean;
  id_mata_kuliah_dipantau: number[];
};

type MahasiswaRow = {
  id: string;
  id_pengguna_moodle: number;
  token_moodle: string;
};

type MoodleCourse = { id: number; fullname: string; shortname: string };

type MoodleModuleContent = {
  filename?: string;
  fileurl?: string;
  mimetype?: string;
  filesize?: number;
  timemodified?: number;
};

type MoodleModule = {
  id: number; // course module id (unik global)
  name: string;
  modname: string; // resource | url | page | book | folder | label | forum | assign | ...
  description?: string;
  url?: string;
  contents?: MoodleModuleContent[];
};

type MoodleSection = {
  id: number;
  name: string;
  modules?: MoodleModule[];
};

type MateriSnapshot = {
  id: number; // = id_modul
  idMataKuliah: number;
  namaMataKuliah: string;
  namaModul: string;
  jenisModul: string;
  tautanModul?: string;
  berkas: Array<{ nama: string; tipe?: string; ukuran?: number; diubahPada?: number }>;
};

// Hanya tipe modul yang dianggap "materi" dan layak di-notify.
// assign/quiz/forum/label sengaja dikecualikan (sudah di-cover fitur lain / bukan materi).
const JENIS_MODUL_MATERI = new Set(['resource', 'url', 'page', 'book', 'folder']);

// Batas request paralel ke Moodle per user. Tanpa batas, 1 user dengan banyak
// matkul = puluhan request sekuensial yang bisa membuat function timeout.
const KONKURENSI_MOODLE = 5;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const moodleBaseUrl = (Deno.env.get('MOODLE_BASE_URL') ?? 'https://sunan.umk.ac.id').replace(/\/$/, '');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const functionAuthKey = Deno.env.get('FUNCTION_AUTH_KEY') ?? '';
const acceptedAuthTokens = [serviceRoleKey, functionAuthKey].filter((t) => t.length > 0);

function appendParam(params: URLSearchParams, key: string, value: unknown): void {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => appendParam(params, `${key}[${index}]`, item));
    return;
  }
  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) => appendParam(params, `${key}[${k}]`, v));
    return;
  }
  params.append(key, String(value));
}

async function callMoodle<T>(token: string, functionName: string, params: Record<string, unknown> = {}): Promise<T> {
  const body = new URLSearchParams();
  body.append('wstoken', token);
  body.append('wsfunction', functionName);
  body.append('moodlewsrestformat', 'json');
  Object.entries(params).forEach(([k, v]) => appendParam(body, k, v));
  const response = await fetch(`${moodleBaseUrl}/webservice/rest/server.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!response.ok) throw new Error(`Moodle request gagal: ${response.status}`);
  const payload = (await response.json()) as Record<string, unknown>;
  if (typeof payload.exception === 'string') {
    throw new Error(typeof payload.message === 'string' ? payload.message : 'Error dari Moodle');
  }
  return payload as T;
}

function stripHtml(value: string | undefined): string {
  return (value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

async function hashPayload(value: unknown): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Jalankan fn untuk setiap item dengan maksimal `limit` promise berjalan bersamaan. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

function toMateriSnapshot(course: MoodleCourse, module: MoodleModule): MateriSnapshot {
  return {
    id: module.id,
    idMataKuliah: course.id,
    namaMataKuliah: stripHtml(course.fullname) || `Matkul #${course.id}`,
    namaModul: stripHtml(module.name) || `Materi #${module.id}`,
    jenisModul: module.modname,
    tautanModul: module.url,
    berkas: (module.contents ?? []).map((c) => ({
      nama: c.filename ?? 'berkas',
      tipe: c.mimetype,
      ukuran: c.filesize,
      diubahPada: c.timemodified,
    })),
  };
}

/** Deep link terbaik untuk sebuah modul materi. */
function quickLinkFor(course: MoodleCourse, module: MoodleModule, snapshot: MateriSnapshot): string {
  // Modul bertipe "url": tujuan aslinya ada di contents[0].fileurl,
  // bukan di halaman view modul.
  if (module.modname === 'url' && module.contents?.[0]?.fileurl) {
    return module.contents[0].fileurl;
  }
  return snapshot.tautanModul ?? `${moodleBaseUrl}/course/view.php?id=${course.id}`;
}

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = request.headers.get('Authorization') ?? '';
  if (!authHeader || !acceptedAuthTokens.some((t) => authHeader.includes(t))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const runStart = await supabase
    .from('tabel_riwayat_sinkronisasi')
    .insert({ status: 'running', detail_sinkronisasi: { source: 'poll-materi-baru' } })
    .select('id')
    .single();
  const runId = runStart.data?.id as number | undefined;

  let penggunaDiproses = 0;
  let snapshotDisimpan = 0;
  let notifikasiDimasukkan = 0;

  try {
    const { data: daftarMahasiswa, error: errMahasiswa } = await supabase
      .from('tabel_mahasiswa')
      .select('id,id_pengguna_moodle,token_moodle');
    if (errMahasiswa) throw new Error(errMahasiswa.message);

    const { data: daftarPengaturan, error: errPengaturan } = await supabase
      .from('tabel_pengaturan_mahasiswa')
      .select('id_mahasiswa,notifikasi_materi_baru,id_mata_kuliah_dipantau');
    if (errPengaturan) throw new Error(errPengaturan.message);

    const pengaturanMap = new Map<string, PengaturanRow>();
    for (const row of (daftarPengaturan ?? []) as PengaturanRow[]) pengaturanMap.set(row.id_mahasiswa, row);

    for (const mhs of (daftarMahasiswa ?? []) as MahasiswaRow[]) {
      const pengaturan = pengaturanMap.get(mhs.id);
      // Lewati user yang mematikan fitur ini
      if (pengaturan && pengaturan.notifikasi_materi_baru === false) {
        penggunaDiproses += 1;
        continue;
      }
      const idDipantau = pengaturan?.id_mata_kuliah_dipantau ?? [];

      let courses: MoodleCourse[];
      try {
        courses = await callMoodle<MoodleCourse[]>(mhs.token_moodle, 'core_enrol_get_users_courses', {
          userid: mhs.id_pengguna_moodle,
        });
      } catch {
        continue;
      }
      const courseTerpantau =
        idDipantau.length > 0 ? courses.filter((c) => idDipantau.includes(c.id)) : courses;

      // Ambil snapshot lama SEKALI per user (bukan per matkul)
      const { data: snapshotLama } = await supabase
        .from('tabel_snapshot_materi')
        .select('id_modul,id_mata_kuliah,hash_data')
        .eq('id_mahasiswa', mhs.id);
      const hashLamaMap = new Map<number, string>();
      const courseIdsSeen = new Set<number>();
      for (
        const row of (snapshotLama ?? []) as Array<{ id_modul: number; id_mata_kuliah: number; hash_data: string }>
      ) {
        hashLamaMap.set(row.id_modul, row.hash_data);
        courseIdsSeen.add(row.id_mata_kuliah);
      }

      const barisSnapshot: Record<string, unknown>[] = [];
      const barisAntrean: Record<string, unknown>[] = [];
      const sekarang = new Date();

      // Isi course diambil paralel (maks KONKURENSI_MOODLE request jalan bareng).
      // 1 matkul gagal -> lewati matkul itu saja, jangan gagalkan semua.
      const hasilCourse = await mapWithConcurrency(courseTerpantau, KONKURENSI_MOODLE, async (course) => {
        try {
          const sections = await callMoodle<MoodleSection[]>(mhs.token_moodle, 'core_course_get_contents', {
            courseid: course.id,
          });
          return { course, sections: sections ?? [] };
        } catch {
          return { course, sections: null as MoodleSection[] | null };
        }
      });

      for (const { course, sections } of hasilCourse) {
        if (!sections) continue;
        // ANTI-SPAM: matkul yang belum pernah di-scan -> jadikan baseline,
        // jangan kirim notif untuk semua materi lamanya sekaligus
        // (mencegah banjir notifikasi tiap semester baru / ganti matkul pantauan).
        const isBaselineCourse = !courseIdsSeen.has(course.id);

        for (const section of sections) {
          for (const module of section.modules ?? []) {
            if (!JENIS_MODUL_MATERI.has(module.modname)) continue;
            const snapshot = toMateriSnapshot(course, module);
            const hashBaru = await hashPayload(snapshot);

            barisSnapshot.push({
              id_mahasiswa: mhs.id,
              id_modul: snapshot.id,
              id_mata_kuliah: snapshot.idMataKuliah,
              nama_mata_kuliah: snapshot.namaMataKuliah,
              nama_modul: snapshot.namaModul,
              jenis_modul: snapshot.jenisModul,
              tautan_modul: snapshot.tautanModul ?? null,
              hash_data: hashBaru,
              isi_data: snapshot,
            });

            const hashLama = hashLamaMap.get(snapshot.id);
            if (!hashLama && !isBaselineCourse) {
              barisAntrean.push({
                id_mahasiswa: mhs.id,
                jenis_notifikasi: 'materi_baru',
                judul_notifikasi: 'Materi Baru di SUNAN',
                isi_notifikasi: `${snapshot.namaModul} — ${snapshot.namaMataKuliah}`,
                isi_data: {
                  kind: 'materi_baru',
                  courseId: snapshot.idMataKuliah,
                  moduleId: snapshot.id,
                  modname: snapshot.jenisModul,
                  quickLink: quickLinkFor(course, module, snapshot),
                },
                kunci_anti_duplikat: `materi-baru-${mhs.id}-${snapshot.id}-${hashBaru}`,
                jadwal_kirim: sekarang.toISOString(),
              });
            }
          }
        }
      }

      if (barisSnapshot.length > 0) {
        const { error } = await supabase.from('tabel_snapshot_materi').upsert(barisSnapshot, {
          onConflict: 'id_mahasiswa,id_modul',
        });
        if (!error) snapshotDisimpan += barisSnapshot.length;
      }
      if (barisAntrean.length > 0) {
        // upsert + ignoreDuplicates: 1 kunci duplikat tidak boleh menggagalkan
        // seluruh batch (pola sama seperti poll-sunan-data).
        const { error } = await supabase.from('tabel_antrian_notifikasi').upsert(barisAntrean, {
          onConflict: 'kunci_anti_duplikat',
          ignoreDuplicates: true,
        });
        if (error) throw new Error(`Gagal menyimpan antrean notifikasi materi: ${error.message}`);
        notifikasiDimasukkan += barisAntrean.length;
      }
      penggunaDiproses += 1;
    }

    if (runId) {
      await supabase
        .from('tabel_riwayat_sinkronisasi')
        .update({
          status: 'selesai',
          selesai_pada: new Date().toISOString(),
          detail_sinkronisasi: { source: 'poll-materi-baru', penggunaDiproses, snapshotDisimpan, notifikasiDimasukkan },
        })
        .eq('id', runId);
    }

    return new Response(
      JSON.stringify({ ok: true, penggunaDiproses, snapshotDisimpan, notifikasiDimasukkan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    if (runId) {
      await supabase
        .from('tabel_riwayat_sinkronisasi')
        .update({ status: 'gagal', selesai_pada: new Date().toISOString(), catatan: String(e) })
        .eq('id', runId);
    }
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
