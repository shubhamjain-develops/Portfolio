"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { site } from "@/data/content";
import { HeroCanvas } from "./HeroCanvas";
import { ScrambleText } from "./ScrambleText";
import { MagneticButton } from "./MagneticButton";
import { Reveal } from "./Reveal";
import {
  ArrowIcon,
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
} from "./Icons";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Content drifts up and fades slightly as you scroll past — the canvas
  // behind it moves at a different rate, which reads as depth.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative isolate overflow-hidden pb-24 pt-32 sm:pb-32 sm:pt-40"
    >
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: canvasY }}
        className="absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 grid-bg" />
        <HeroCanvas />
        {/* warm/cool wash so the canvas doesn't read as pure noise */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_0%,rgb(var(--c-accent)/0.10),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </motion.div>

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="shell"
      >
        <Reveal immediate delay={0.05}>
          <p className="eyebrow inline-flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {site.location} · {site.availability}
          </p>
        </Reveal>

        <h1 className="mt-5 text-[clamp(2.4rem,7vw,4.6rem)] font-extrabold leading-[1.02]">
          <Reveal immediate delay={0.12} as="span" className="block">
            {site.name}
          </Reveal>
          <Reveal immediate delay={0.2} as="span" className="mt-1 block">
            <ScrambleText
              text={site.role}
              delay={0.5}
              className="accent-sweep motion-safe:animate-sweep"
            />
          </Reveal>
        </h1>

        <Reveal immediate delay={0.3}>
          <p className="mt-6 max-w-[46rem] text-[1.02rem] leading-relaxed text-dim sm:text-[1.1rem]">
            {site.intro}
          </p>
        </Reveal>

        <Reveal immediate delay={0.38}>
          <div className="relative mt-8 max-w-[38rem] overflow-hidden rounded-xl border border-line card-surface p-5 pl-6">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-accent to-accent-2"
            />
            <p className="text-[0.98rem] leading-relaxed">
              {site.thesis.before}
              {site.thesis.highlights.map((h) => (
                <span key={h.value}>
                  <strong className="font-mono font-semibold text-accent">
                    {h.value}
                  </strong>
                  {h.after}
                </span>
              ))}
            </p>
          </div>
        </Reveal>

        <Reveal immediate delay={0.46}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <MagneticButton variant="primary" href={`mailto:${site.email}`}>
              <MailIcon /> Email me
            </MagneticButton>
            <MagneticButton href={site.resumePath} download>
              <DownloadIcon /> Résumé
            </MagneticButton>
            <MagneticButton href={site.linkedin} external ariaLabel="LinkedIn profile">
              <LinkedInIcon /> LinkedIn
            </MagneticButton>
            {site.github && (
              <MagneticButton href={site.github} external ariaLabel="GitHub profile">
                <GitHubIcon /> GitHub
              </MagneticButton>
            )}
            <MagneticButton href="#work" variant="quiet">
              Selected work <ArrowIcon />
            </MagneticButton>
          </div>
        </Reveal>
      </motion.div>

      <span
        aria-hidden
        className="absolute bottom-7 left-1/2 hidden h-9 w-[22px] -translate-x-1/2 rounded-full border border-line-strong lg:block"
      >
        <span className="absolute left-1/2 top-[7px] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-accent motion-safe:animate-scroll-hint" />
      </span>
    </section>
  );
}
