"use client";

import { useEffect, useState } from "react";
import { portal } from "@/data/content";
import GlyphPortal from "./ui/glyph-portal";

const FALLBACK = "system-ui, sans-serif";

/**
 * SYSTEMS, set huge and faint behind the hero. The portal is pulled up a
 * screen (globals.css, .portal) so its pinned frame starts under the hero; it
 * holds there for `leadIn` while the hero scrolls away and the word fills
 * with teal, then the camera dives through a letter into the teal room.
 * Colours come from the site palette, so it follows the theme toggle.
 */
export function Portal() {
  const [family, setFamily] = useState<string | null>(null);

  useEffect(() => {
    // GlyphPortal freezes its face at mount and drops to a static poster if the
    // face is still pending, so wait for Sora before mounting it. Only Sora's
    // own family is passed: next/font's metric fallback face never loads, and
    // the portal would read it as pending.
    const sora = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-display")
      .split(",")[0]
      .trim();
    let settled = false;
    const finish = (value: string) => {
      if (!settled) {
        settled = true;
        setFamily(value);
      }
    };
    const timeout = window.setTimeout(() => finish(FALLBACK), 1600);
    if (sora) {
      document.fonts
        .load(`800 100px ${sora}`, portal.word)
        .then(() => finish(`${sora}, ${FALLBACK}`), () => finish(FALLBACK));
    } else {
      finish(FALLBACK);
    }
    return () => {
      settled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  // Same footprint as the portal's opening frame, which sits under the hero.
  if (!family) return <div aria-hidden className="portal-hold" />;

  return (
    <GlyphPortal
      className="portal"
      word={portal.word}
      fontFamily={family}
      fontWeight={800}
      scrollLength={2.4}
      leadIn={0.9}
      enterLabel={portal.enterLabel}
      background={<div className="portal-field" />}
      front={
        <>
          <p className="portal-eyebrow eyebrow">{portal.eyebrow}</p>
          <p className="portal-support">{portal.support}</p>
        </>
      }
    >
      <div className="shell">
        <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-accent-ink/80">
          {portal.eyebrow}
        </p>
        <h2 className="mt-3 max-w-[22ch] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.12]">
          {portal.title}
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-12">
          {portal.principles.map((p, i) => (
            <li key={p.title} className="border-t border-accent-ink/25 pt-4">
              <h3 className="text-[1.1rem] leading-snug">
                <span className="mr-3 font-mono text-[0.75rem] font-medium tracking-[0.08em] text-accent-ink/75">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p.title}
              </h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-accent-ink/85">
                {p.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </GlyphPortal>
  );
}
