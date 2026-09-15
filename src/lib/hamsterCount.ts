/**
 * The hamster's feed count belongs to one calendar day in the visitor's own
 * timezone. It is stored together with its date and reads back as 0 once that
 * date has passed, so the counter resets at local midnight with no server.
 */
export const HAMSTER_KEY = "portfolio-hamster-fed-daily";

/**
 * No visitor feeds this often in a day (feeds are at least 400ms apart and
 * each one animates), so a larger stored number is corrupt, not devotion.
 */
export const MAX_DAILY_COUNT = 9999;

/** Every fifth feed fills the cheeks and the hamster goes off to stash. */
export const CHEEK_CAPACITY = 5;

/** Visitor-local hours the hamster sleeps through: 23:00 up to 06:00. */
export const SLEEP_FROM_HOUR = 23;
export const WAKE_AT_HOUR = 6;

/** Once woken at night, it stays awake until the page has been idle this long. */
export const AWAKE_IDLE_MS = 120_000;

export type DailyCount = { day: string; count: number };

/** YYYY-MM-DD for the visitor's local calendar date (not UTC). */
export function localDay(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today's count from a stored value. Stale, malformed, missing or impossible values read as 0. */
export function readCount(raw: string | null, today: string): number {
  if (!raw) return 0;
  try {
    const saved = JSON.parse(raw) as Partial<DailyCount> | null;
    if (saved?.day !== today) return 0;
    const n = Number(saved.count);
    return Number.isFinite(n) && n > 0 && n <= MAX_DAILY_COUNT ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

/** The value to store after one more feed today. */
export function recordFeed(raw: string | null, today: string): DailyCount {
  return { day: today, count: readCount(raw, today) + 1 };
}

/** How full the cheeks are, 0 (empty) to 4, derived from today's count. */
export function cheekLevel(count: number): number {
  return count > 0 ? count % CHEEK_CAPACITY : 0;
}

/** True for the feed that fills the cheeks, which sends the hamster off to stash. */
export function isStashFeed(count: number): boolean {
  return count > 0 && count % CHEEK_CAPACITY === 0;
}

/** Whether the visitor's local clock is in the hamster's sleeping hours. */
export function isNightHour(date: Date): boolean {
  const hour = date.getHours();
  return hour >= SLEEP_FROM_HOUR || hour < WAKE_AT_HOUR;
}

/**
 * Asleep during night hours unless the page has been active recently.
 * `lastActivity` is null until the visitor wakes it, so a night-time visit
 * opens on a sleeping hamster; outside night hours it is never asleep.
 */
export function isAsleep(now: Date, lastActivity: number | null): boolean {
  if (!isNightHour(now)) return false;
  return lastActivity === null || now.getTime() - lastActivity >= AWAKE_IDLE_MS;
}
