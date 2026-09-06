"use client";

import { motion, useReducedMotion } from "framer-motion";
import { skills } from "@/data/content";
import { Reveal, StaggerGroup, staggerChild } from "./Reveal";

export function Skills() {
  const reduce = useReducedMotion();

  return (
    <section id="skills" className="relative scroll-mt-20 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">Skills</p>
          <h2 className="mt-3 text-[clamp(1.65rem,3.6vw,2.35rem)] leading-[1.15]">
            What I build with
          </h2>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group) => (
            <motion.div
              key={group.title}
              variants={reduce ? undefined : staggerChild}
              className="group rounded-xl border border-line card-surface p-5 transition-colors duration-300 hover:border-accent/40"
            >
              <h3 className="font-mono text-[0.74rem] font-semibold uppercase tracking-[0.13em] text-accent">
                {group.title}
              </h3>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-line bg-surface2 px-2.5 py-1 text-[0.8rem] text-dim transition-colors duration-200 hover:border-accent/40 hover:text-ink"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
