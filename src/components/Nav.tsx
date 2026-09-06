"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { nav, site } from "@/data/content";
import { ThemeToggle } from "./ThemeToggle";
import { ScrollProgress } from "./ScrollProgress";

export function Nav() {
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  /* Scroll-spy: the last section whose top has passed the nav wins. */
  useEffect(() => {
    const sections = nav
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const onScroll = () => {
      setScrolled(window.scrollY > 12);

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
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) current = nav[nav.length - 1].id;

      // keep the pill off while the hero still fills the screen
      setActive(window.scrollY < 120 ? "" : current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock the page behind the mobile menu. */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-bg/80 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent"
      }`}
    >
      <nav className="shell flex h-16 items-center justify-between" aria-label="Primary">
        <a
          href="#top"
          className="font-display text-[1.05rem] font-bold tracking-tight text-ink transition-colors hover:text-accent"
        >
          {site.initials}
          <span className="text-accent">.</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <li key={item.id} className="relative">
              <a
                href={`#${item.id}`}
                className={`relative block rounded-full px-3.5 py-1.5 text-[0.86rem] font-medium transition-colors duration-200 ${
                  active === item.id ? "text-accent" : "text-dim hover:text-ink"
                }`}
              >
                {active === item.id && !reduce && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-accent/10 ring-1 ring-inset ring-accent/25"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={site.resumePath}
            download
            className="hidden rounded-lg border border-line-strong px-3.5 py-[7px] text-[0.82rem] font-semibold text-ink transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            Résumé
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-dim transition-colors hover:border-accent/60 hover:text-accent md:hidden"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />}
            </svg>
          </button>
        </div>
      </nav>

      <ScrollProgress />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="border-b border-line bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <ul className="shell flex flex-col py-3">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line/70 py-3 text-[0.95rem] font-medium text-dim transition-colors hover:text-accent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={site.resumePath}
                  download
                  onClick={() => setOpen(false)}
                  className="block py-3 text-[0.95rem] font-semibold text-accent"
                >
                  Download résumé ↓
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
