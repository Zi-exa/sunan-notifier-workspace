export const MAX_DELIVERY_ATTEMPTS = 5;

const RETRY_BASE_MINUTES = 15;
const RETRY_MAX_MINUTES = 2 * 60;
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

export type QuietHoursSettings = {
  jam_diam_aktif: boolean;
  jangan_ganggu_mulai: string;
  jangan_ganggu_selesai: string;
};

function parseQuietHourMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function getJakartaDateParts(date: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);
    const valueOf = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    const values = {
      year: valueOf('year'),
      month: valueOf('month'),
      day: valueOf('day'),
      hour: valueOf('hour'),
      minute: valueOf('minute'),
    };

    if (Object.values(values).every((value) => Number.isFinite(value))) {
      return values;
    }
  } catch {
    // Asia/Jakarta uses a fixed UTC+7 offset. Keep delivery deterministic if
    // the runtime does not expose complete Intl time-zone data.
  }

  const jakartaAsUtc = new Date(date.getTime() + JAKARTA_OFFSET_MS);
  return {
    year: jakartaAsUtc.getUTCFullYear(),
    month: jakartaAsUtc.getUTCMonth() + 1,
    day: jakartaAsUtc.getUTCDate(),
    hour: jakartaAsUtc.getUTCHours(),
    minute: jakartaAsUtc.getUTCMinutes(),
  };
}

/**
 * Returns the first instant after the configured quiet window, or null when
 * the delivery time is not quiet. Equal start/end is intentionally treated as
 * no quiet window instead of an accidental 24-hour blackout.
 */
export function getQuietHoursEndDate(
  settings: QuietHoursSettings | undefined,
  now = new Date()
): Date | null {
  if (!settings?.jam_diam_aktif) {
    return null;
  }

  const startMinutes = parseQuietHourMinutes(settings.jangan_ganggu_mulai);
  const endMinutes = parseQuietHourMinutes(settings.jangan_ganggu_selesai);
  if (startMinutes === null || endMinutes === null || startMinutes === endMinutes) {
    return null;
  }

  const dateParts = getJakartaDateParts(now);
  const currentMinutes = dateParts.hour * 60 + dateParts.minute;
  const crossesMidnight = startMinutes > endMinutes;
  const insideQuietHours = crossesMidnight
    ? currentMinutes >= startMinutes || currentMinutes < endMinutes
    : currentMinutes >= startMinutes && currentMinutes < endMinutes;

  if (!insideQuietHours) {
    return null;
  }

  const endsTomorrow = crossesMidnight && currentMinutes >= startMinutes;
  const endAtUtc = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day + (endsTomorrow ? 1 : 0),
    Math.floor(endMinutes / 60),
    endMinutes % 60
  );
  return new Date(endAtUtc - JAKARTA_OFFSET_MS);
}

export function getRetryDate(attempt: number, now = new Date()): Date {
  const delayMinutes = Math.min(
    RETRY_MAX_MINUTES,
    RETRY_BASE_MINUTES * 2 ** Math.max(0, attempt - 1)
  );
  return new Date(now.getTime() + delayMinutes * 60 * 1000);
}

export function getDeliveryFailureState(currentAttempts: number | null | undefined, now = new Date()) {
  const normalizedAttempts = Number.isFinite(currentAttempts)
    ? Math.max(0, Math.floor(currentAttempts ?? 0))
    : 0;
  const attempts = normalizedAttempts + 1;
  const terminal = attempts >= MAX_DELIVERY_ATTEMPTS;

  return {
    attempts,
    terminal,
    retryAt: terminal ? null : getRetryDate(attempts, now),
  };
}

export function formatFailureReason(reason: string): string {
  return reason.trim().slice(0, 800) || 'Pengiriman push gagal tanpa alasan dari provider.';
}
