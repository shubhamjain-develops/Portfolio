"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { experience } from "@/data/content";
import { EASE, Reveal } from "./Reveal";
import { SectionHeading } from "./Section";

/** The drawn rail starts 4px down the track (`top-1`). */
const RAIL_TOP = 4;
/** A node's centre sits 13.5px below its article's top (`top-[7px]` + half of 13px). */
const NODE_CENTRE = 13.5;

export function Experience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
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

  // Each node lights up when the drawn line actually reaches it: `stops` holds
  // how far down the track (0-1) each node sits, `lit` how many are reached.
  const [stops, setStops] = useState<number[]>([]);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const height = track.offsetHeight || 1;
      setStops(
        itemRefs.current.map((el) => {
          if (!el) return 1;
          // While an item's Reveal wrapper is still transformed it becomes the
          // item's offsetParent, so add up offsets until reaching the track.
          let top = 0;
          for (let n: HTMLElement | null = el; n && n !== track; n = n.offsetParent as HTMLElement | null) {
            top += n.offsetTop;
          }
          return (top + NODE_CENTRE - RAIL_TOP) / height;
        })
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  const reach = (progress: number) => {
    const reached = stops.filter((stop) => progress >= stop).length;
    // Once lit, a node stays lit when scrolling back up.
    setLit((current) => Math.max(current, reached));
  };
  useMotionValueEvent(scaleY, "change", reach);
  // The spring can settle before the nodes are measured, so check again once they are.
  useEffect(() => reach(scaleY.get()), [stops]); // eslint-disable-line react-hooks/exhaustive-deps

  const litCount = reduce ? experience.length : lit;

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
            {experience.map((job, i) => {
              const on = i < litCount;
              // The current role is the one coral spot on the timeline.
              const fill = job.current
                ? "border-warm bg-warm shadow-[0_0_0_4px_rgb(var(--c-warm)/0.18)]"
                : "border-accent bg-accent";

              return (
                <Reveal key={`${job.company}-${job.period}`} delay={0.04 * i}>
                  <article
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    className="relative"
                  >
                    <motion.span
                      aria-hidden
                      initial={false}
                      animate={on && !reduce ? { scale: [0.6, 1.35, 1] } : { scale: 1 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className={`absolute -left-[34px] top-[7px] grid h-[13px] w-[13px] place-items-center rounded-full border-2 transition-colors duration-500 sm:-left-[42px] ${
                        on ? fill : "border-line-strong bg-bg"
                      }`}
                    >
                      {on && !reduce && (
                        <motion.span
                          className={`absolute -inset-[2px] rounded-full border-2 ${
                            job.current ? "border-warm" : "border-accent"
                          }`}
                          initial={{ opacity: 0.75, scale: 1 }}
                          animate={{ opacity: 0, scale: 2.8 }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      )}
                      {job.current && on && (
                        <span className="h-[5px] w-[5px] rounded-full bg-bg motion-safe:animate-pulse" />
                      )}
                    </motion.span>

                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="text-[1.08rem] font-bold">{job.title}</h3>
                      <motion.span
                        className="inline-block font-mono text-[0.78rem] text-faint"
                        style={{ transformPerspective: 400, transformOrigin: "50% 0%" }}
                        initial={reduce ? false : { opacity: 0, rotateX: -90 }}
                        animate={on ? { opacity: 1, rotateX: 0 } : undefined}
                        transition={{ duration: 0.6, ease: EASE }}
                      >
                        {job.period}
                      </motion.span>
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
