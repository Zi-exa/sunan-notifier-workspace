import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const functionAuthKey = Deno.env.get('FUNCTION_AUTH_KEY') ?? '';
const acceptedAuthTokens = [serviceRoleKey, functionAuthKey].filter((token) => token.length > 0);
const fcmServerKey = Deno.env.get('FCM_SERVER_KEY') ?? '';
const fcmServiceAccountRaw = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON') ?? '';

type FcmServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function parseFcmServiceAccount(raw: string): FcmServiceAccount | null {
  if (!raw.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FcmServiceAccount>;

    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      return null;
    }

    return {
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      private_key: parsed.private_key,
      token_uri: parsed.token_uri,
    };
  } catch {
    return null;
  }
}

const fcmServiceAccount = parseFcmServiceAccount(fcmServiceAccountRaw);
let cachedFcmAccessToken: { token: string; expiresAtUnix: number } | null = null;

function encodeBase64UrlString(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function encodeBase64UrlBytes(value: Uint8Array): string {
  let binary = '';
  for (const byte of value) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemPrivateKeyToPkcs8(privateKeyPem: string): ArrayBuffer {
  const normalized = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

async function getFcmAccessToken(): Promise<string> {
  if (!fcmServiceAccount) {
    throw new Error('FCM_SERVICE_ACCOUNT_JSON belum diset atau tidak valid');
  }

  const nowUnix = Math.floor(Date.now() / 1000);

  if (cachedFcmAccessToken && cachedFcmAccessToken.expiresAtUnix - 60 > nowUnix) {
    return cachedFcmAccessToken.token;
  }

  const jwtHeader = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const jwtPayload = {
    iss: fcmServiceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: fcmServiceAccount.token_uri ?? 'https://oauth2.googleapis.com/token',
    iat: nowUnix,
    exp: nowUnix + 3600,
  };

  const unsignedJwt = `${encodeBase64UrlString(JSON.stringify(jwtHeader))}.${encodeBase64UrlString(
    JSON.stringify(jwtPayload)
  )}`;

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemPrivateKeyToPkcs8(fcmServiceAccount.private_key),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedJwt)
  );

  const assertion = `${unsignedJwt}.${encodeBase64UrlBytes(new Uint8Array(signature))}`;

  const body = new URLSearchParams();
  body.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  body.set('assertion', assertion);

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok || !tokenPayload.access_token) {
    throw new Error(
      tokenPayload.error_description ?? tokenPayload.error ?? `OAuth token request gagal (${tokenResponse.status})`
    );
  }

  const expiresIn = Number(tokenPayload.expires_in ?? 3600);
  cachedFcmAccessToken = {
    token: tokenPayload.access_token,
    expiresAtUnix: nowUnix + expiresIn,
  };

  return tokenPayload.access_token;
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

type QueueRow = {
  id: number;
  app_user_id: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
};

type DeviceRow = {
  expo_push_token: string;
};

async function sendViaExpo(
  pushToken: string,
  title: string,
  body: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean; reason?: string }> {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: pushToken,
      title,
      body,
      data,
      sound: 'default',
      channelId: 'default',
    }),
  });

  const payload = (await response.json()) as {
    data?: {
      status?: string;
      message?: string;
    };
    errors?: Array<{ message?: string }>;
  };

  if (!response.ok) {
    return { ok: false, reason: `Expo HTTP ${response.status}` };
  }

  if (payload.data?.status === 'ok') {
    return { ok: true };
  }

  const errorMessage = payload.data?.message ?? payload.errors?.[0]?.message ?? 'Expo push gagal';
  return { ok: false, reason: errorMessage };
}

async function sendViaFcmLegacy(
  pushToken: string,
  title: string,
  body: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean; reason?: string }> {
  if (!fcmServerKey) {
    return { ok: false, reason: 'FCM_SERVER_KEY belum diset' };
  }

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${fcmServerKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: pushToken,
      notification: {
        title,
        body,
      },
      data,
      priority: 'high',
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: `FCM HTTP ${response.status}` };
  }

  const payload = (await response.json()) as {
    success?: number;
    results?: Array<{ error?: string }>;
  };

  if ((payload.success ?? 0) > 0) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: payload.results?.[0]?.error ?? 'FCM delivery gagal',
  };
}

async function sendViaFcmV1(
  pushToken: string,
  title: string,
  body: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean; reason?: string }> {
  if (!fcmServiceAccount) {
    return { ok: false, reason: 'FCM_SERVICE_ACCOUNT_JSON belum diset atau tidak valid' };
  }

  let accessToken = '';
  try {
    accessToken = await getFcmAccessToken();
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? `Gagal ambil OAuth token FCM: ${error.message}` : 'Gagal ambil OAuth token FCM',
    };
  }

  const dataPayload: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    dataPayload[key] = typeof value === 'string' ? value : JSON.stringify(value);
  });

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${fcmServiceAccount.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: pushToken,
          notification: {
            title,
            body,
          },
          data: dataPayload,
          android: {
            priority: 'HIGH',
          },
        },
      }),
    }
  );

  if (response.ok) {
    return { ok: true };
  }

  const payload = (await response.json()) as {
    error?: {
      message?: string;
      status?: string;
    };
  };

  return {
    ok: false,
    reason:
      payload.error?.message ?? payload.error?.status ?? `FCM v1 HTTP ${response.status}`,
  };
}

async function deliverPush(
  pushToken: string,
  title: string,
  body: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean; reason?: string }> {
  if (pushToken.startsWith('ExponentPushToken') || pushToken.startsWith('ExpoPushToken')) {
    return sendViaExpo(pushToken, title, body, data);
  }

  if (fcmServiceAccount) {
    return sendViaFcmV1(pushToken, title, body, data);
  }

  if (fcmServerKey) {
    return sendViaFcmLegacy(pushToken, title, body, data);
  }

  return {
    ok: false,
    reason: 'FCM credential belum diset (FCM_SERVICE_ACCOUNT_JSON/FCM_SERVER_KEY)',
  };
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
    const queueResult = await supabase
      .from('notification_queue')
      .select('id,app_user_id,title,body,payload')
      .is('sent_at', null)
      .lte('schedule_at', new Date().toISOString())
      .order('schedule_at', { ascending: true })
      .limit(100);

    if (queueResult.error) {
      throw new Error(queueResult.error.message);
    }

    const rows = (queueResult.data ?? []) as QueueRow[];
    let sentCount = 0;
    let failedCount = 0;

    for (const row of rows) {
      const deviceResult = await supabase
        .from('user_devices')
        .select('expo_push_token')
        .eq('app_user_id', row.app_user_id)
        .eq('active', true);

      const devices = (deviceResult.data ?? []) as DeviceRow[];

      if (!devices.length) {
        await supabase
          .from('notification_queue')
          .update({ failed_reason: 'Tidak ada device aktif untuk user ini.' })
          .eq('id', row.id);
        failedCount += 1;
        continue;
      }

      let success = 0;
      const failures: string[] = [];

      for (const device of devices) {
        const delivery = await deliverPush(device.expo_push_token, row.title, row.body, row.payload);

        if (delivery.ok) {
          success += 1;
        } else {
          failures.push(delivery.reason ?? 'Unknown delivery error');
        }
      }

      if (success > 0) {
        await supabase
          .from('notification_queue')
          .update({
            sent_at: new Date().toISOString(),
            failed_reason: failures.length ? failures.join('; ').slice(0, 800) : null,
          })
          .eq('id', row.id);
        sentCount += 1;
      } else {
        await supabase
          .from('notification_queue')
          .update({
            failed_reason: failures.join('; ').slice(0, 800),
          })
          .eq('id', row.id);
        failedCount += 1;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        queued: rows.length,
        sent: sentCount,
        failed: failedCount,
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
