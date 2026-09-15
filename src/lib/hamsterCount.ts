/**
 * The hamster's feed count belongs to one calendar day in the visitor's own
 * timezone. It is stored together with its date and reads back as 0 once that
 * date has passed, so the counter resets at local midnight with no server.
 */
export const HAMSTER_KEY = "portfolio-hamster-fed-daily";

export type DailyCount = { day: string; count: number };

/** YYYY-MM-DD for the visitor's local calendar date (not UTC). */
export function localDay(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today's count from a stored value. Stale, malformed or missing values read as 0. */
export function readCount(raw: string | null, today: string): number {
  if (!raw) return 0;
  try {
    const saved = JSON.parse(raw) as Partial<DailyCount> | null;
    if (saved?.day !== today) return 0;
    const n = Number(saved.count);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

/** The value to store after one more feed today. */
export function recordFeed(raw: string | null, today: string): DailyCount {
  return { day: today, count: readCount(raw, today) + 1 };
}
