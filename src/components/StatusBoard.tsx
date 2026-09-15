"use client";

import { useEffect, useState } from "react";
import { availability, playful, site } from "@/data/content";
import { useHamsterCount } from "@/lib/useHamsterCount";

type Row = { label: string; state: string; ok: boolean };

/**
 * A status-page joke above the footer's copyright line. Every state is a fact
 * already on the site (availability, location) or the hamster's live count,
 * plus the one thing allowed to be degraded. No uptime bars: made-up history
 * would be an invented claim, and identical bars would be clutter.
 */
export function StatusBoard() {
  const count = useHamsterCount();
  // The count lives in this browser only, so the server renders a placeholder.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const copy = playful.status;
  const fed = count === 1 ? copy.hamsterFed.one : copy.hamsterFed.many.replace("{n}", String(count));
  const rows: Row[] = [
    ...(availability.status ? [{ label: copy.availability, state: availability.status, ok: true }] : []),
    { label: copy.location, state: site.location, ok: true },
    { label: copy.hamster, state: mounted ? fed : "—", ok: true },
    { label: copy.coffee, state: copy.coffeeState, ok: false },
  ];

  return (
    <div className="mt-10 rounded-xl border border-line card-surface p-4 sm:p-5">
      <p className="flex items-center gap-2.5 text-[0.95rem] font-semibold">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_4px_rgb(var(--c-accent)/0.16)]" />
        {copy.headline}
      </p>
      <ul className="mt-3 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2.5 bg-surface px-3.5 py-2.5 text-[0.84rem]">
            {/* The dot repeats the state in shape; the words carry it for everyone. */}
            <span
              aria-hidden
              className={`h-2 w-2 shrink-0 rounded-full ${row.ok ? "bg-accent" : "ring-[1.5px] ring-inset ring-dim"}`}
            />
            <span className="font-medium text-ink">{row.label}</span>
            <span className={`ml-auto text-right font-mono text-[0.74rem] ${row.ok ? "text-accent" : "text-dim"}`}>
              {row.state}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
