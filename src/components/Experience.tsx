"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { experience } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Section";

export function Experience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // The spine draws itself as the timeline passes through the viewport.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 78%", "end 55%"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <section id="experience" className="scroll-mt-20 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <SectionHeading eyebrow="Experience" title="Where I’ve built things" />

        <div ref={trackRef} className="relative mt-12 max-w-4xl pl-7 sm:pl-9">
          {/* static rail */}
          <div aria-hidden className="absolute left-0 top-1 h-full w-px bg-line" />
          {/* drawn rail */}
          <motion.div
            aria-hidden
            style={reduce ? { scaleY: 1 } : { scaleY }}
            className="absolute left-0 top-1 h-full w-px origin-top bg-gradient-to-b from-accent via-accent to-accent-2"
          />

          <div className="space-y-11 sm:space-y-14">
            {experience.map((job, i) => (
              <Reveal key={`${job.company}-${job.period}`} delay={0.04 * i}>
                <article className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-[34px] top-[7px] grid h-[13px] w-[13px] place-items-center rounded-full border-2 border-accent bg-bg sm:-left-[42px] ${
                      job.current ? "shadow-[0_0_0_4px_rgb(var(--c-accent)/0.16)]" : ""
                    }`}
                  >
                    {job.current && (
                      <span className="h-[5px] w-[5px] rounded-full bg-accent motion-safe:animate-pulse" />
                    )}
                  </span>

                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="text-[1.08rem] font-bold">{job.title}</h3>
                    <span className="font-mono text-[0.78rem] text-faint">
                      {job.period}
                    </span>
                  </div>

                  <p className="mt-1 text-[0.94rem] font-medium text-accent">
                    {job.company}
                    <span className="ml-2 font-normal text-faint">
                      · {job.location}
                    </span>
                  </p>

                  <p className="mt-3 max-w-[62ch] text-[0.97rem] text-dim">
                    {job.summary}
                  </p>

                  <ul className="mt-4 space-y-2.5">
                    {job.points.map((point, k) => (
                      <motion.li
                        key={k}
                        initial={reduce ? false : { opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                        transition={{
                          duration: 0.45,
                          delay: 0.05 * k,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative max-w-[68ch] pl-5 text-[0.94rem] leading-relaxed text-dim"
                      >
                        <span
                          aria-hidden
                          className="absolute left-0 top-[0.62em] h-[5px] w-[5px] rounded-[1px] bg-accent/55"
                        />
                        {point}
                      </motion.li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-line bg-surface2 px-2.5 py-[3px] font-mono text-[0.7rem] text-faint"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
