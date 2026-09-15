"use client";

import { useSyncExternalStore } from "react";
import { nav } from "@/data/content";

/*
 * Which nav section the visitor is reading. One module-level store, so the
 * nav pill and the hamster's props can never disagree about it.
 */

let active = "";
const listeners = new Set<() => void>();
let stop: (() => void) | null = null;

function compute(sections: HTMLElement[]) {
  // A section counts as active once its top crosses a third of the way
  // down the viewport — matches where the eye actually is.
  const line = window.scrollY + window.innerHeight * 0.32;
  let current = "";
  for (const section of sections) {
    if (section.offsetTop <= line) current = section.id;
  }

  // At the very bottom, the last section is the one being read even if
  // its top never crossed the line.
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) current = nav[nav.length - 1].id;

  // keep the pill off while the hero still fills the screen
  const next = window.scrollY < 120 ? "" : current;
  if (next !== active) {
    active = next;
    listeners.forEach((listener) => listener());
  }
}

function start() {
  const sections = nav
    .map((n) => document.getElementById(n.id))
    .filter((el): el is HTMLElement => Boolean(el));

  let frame = 0;
  // Coalesce to one measurement per frame. Deferring the ResizeObserver's work
  // to rAF also keeps it from reporting a "ResizeObserver loop" error.
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      compute(sections);
    });
  };

  // Scroll moves the line; a section changing height (the git-log view, the
  // terminal) moves the sections without any scroll.
  const resize = new ResizeObserver(schedule);
  resize.observe(document.querySelector("main") ?? document.body);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  compute(sections);

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
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

/** The id of the nav section being read, or "" while the hero fills the screen. */
export function useActiveSection(): string {
  return useSyncExternalStore(subscribe, () => active, () => "");
}
