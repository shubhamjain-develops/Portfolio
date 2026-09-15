"use client";

import { useSyncExternalStore } from "react";
import { HAMSTER_KEY, localDay, readCount, recordFeed } from "@/lib/hamsterCount";

/*
 * Today's feed count, shared by everything that shows it (the hamster, the
 * status footer, the terminal). One module-level store, so a feed updates all
 * of them at once — the `storage` event never fires in the tab that wrote.
 *
 * `stored` mirrors the last value read or written. It is also what keeps the
 * count going for this visit when site data is blocked, where even reading
 * localStorage throws.
 */

let stored: string | null = null;
let day = "";
let count = 0;
const listeners = new Set<() => void>();
let stop: (() => void) | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

/** Re-derive today's count; a tab left open past midnight starts the new day at zero. */
function refresh() {
  const today = localDay();
  const next = readCount(stored, today);
  if (today === day && next === count) return;
  day = today;
  count = next;
  emit();
}

function start() {
  try {
    stored = localStorage.getItem(HAMSTER_KEY);
  } catch {
    // Blocked site data: count in memory for this visit.
  }
  refresh();

  // Another tab fed it. Only the count follows; that tab played the animation.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== HAMSTER_KEY) return;
    stored = e.newValue;
    refresh();
  };
  const onVisible = () => {
    if (!document.hidden) refresh();
  };
  window.addEventListener("storage", onStorage);
  document.addEventListener("visibilitychange", onVisible);
  const tick = window.setInterval(refresh, 60_000);

  return () => {
    window.removeEventListener("storage", onStorage);
    document.removeEventListener("visibilitychange", onVisible);
    window.clearInterval(tick);
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  stop ??= start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stop?.();
      stop = null;
    }
  };
}

/** Record one feed for today and return the new count. */
export function feedHamster(): number {
  const today = localDay();
  const next = recordFeed(stored, today);
  stored = JSON.stringify(next);
  try {
    localStorage.setItem(HAMSTER_KEY, stored);
  } catch {
    // Private mode or blocked storage: the count still shows for this visit.
  }
  day = today;
  count = next.count;
  emit();
  return count;
}

/** How many times the hamster has been fed today, in this browser. 0 on the server. */
export function useHamsterCount(): number {
  return useSyncExternalStore(subscribe, () => count, () => 0);
}
