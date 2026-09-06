"use client";

import { motion, useReducedMotion } from "framer-motion";
import { about, availability, languages, stats } from "@/data/content";
import { CountUp } from "./CountUp";
import { Reveal, StaggerGroup, staggerChild } from "./Reveal";

export function About() {
  const reduce = useReducedMotion();

  return (
    <section id="about" className="scroll-mt-20 py-20 sm:py-24 lg:py-28">
      <div className="shell grid gap-14 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow">About</p>
            <h2 className="mt-3 text-[clamp(1.65rem,3.6vw,2.35rem)] leading-[1.15]">
              {about.heading}
            </h2>
          </Reveal>

          <div className="mt-6 space-y-5">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p className="max-w-[58ch] text-[1.02rem] leading-relaxed text-dim">
                  {p}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-faint">
                Languages
              </span>
              {languages.map((l) => (
                <span
                  key={l}
                  className="rounded-md border border-line bg-surface2 px-2.5 py-1 font-mono text-[0.78rem] text-dim"
                >
                  {l}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="self-start lg:sticky lg:top-24">
        <StaggerGroup className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={reduce ? undefined : staggerChild}
              className="group relative bg-surface p-5 sm:p-6"
            >
              <div className="font-mono text-[1.7rem] font-semibold leading-none text-accent sm:text-[1.9rem]">
                <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="mt-2.5 text-[0.82rem] leading-snug text-faint">
                {s.label}
              </div>
              {/* hairline that grows on hover */}
              <span
                aria-hidden
                className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-[width] duration-500 ease-smooth group-hover:w-full"
              />
            </motion.div>
          ))}
        </StaggerGroup>

        <Reveal delay={0.12}>
          <div className="mt-4 rounded-xl border border-line card-surface p-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-accent">
                {availability.title}
              </span>
            </div>
            <p className="mt-3 text-[0.95rem] font-semibold">
              {availability.status}
            </p>
            <ul className="mt-2 space-y-1.5">
              {availability.lines.map((line) => (
                <li
                  key={line}
                  className="relative pl-4 text-[0.87rem] leading-snug text-dim"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-[0.55em] h-[4px] w-[4px] rounded-[1px] bg-accent/55"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        </div>
      </div>
    </section>
  );
}
