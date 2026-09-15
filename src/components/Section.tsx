"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { EASE, Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
  /** Adds the subtle blueprint grid behind the section. */
  patterned?: boolean;
  className?: string;
};

/** Shared section chrome so every heading block sits on the same rhythm. */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  patterned = false,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-20 py-20 sm:py-24 lg:py-28 ${className}`}
    >
      {patterned && (
        <div aria-hidden className="absolute inset-0 -z-10 grid-bg opacity-70" />
      )}
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 max-w-[24ch] text-[clamp(1.65rem,3.6vw,2.35rem)] leading-[1.15]">
            {title}
          </h2>
          {lead && (
            <p className="mt-4 max-w-[52ch] text-[1rem] text-dim">{lead}</p>
          )}
        </Reveal>
        <div className="mt-12 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}

const TITLE = "mt-3 text-[clamp(1.65rem,3.6vw,2.35rem)] leading-[1.15]";
const UNDERLINE = "mt-4 block h-[3px] w-14 origin-left rounded-full bg-accent";
const LEAD = "mt-4 max-w-[54ch] text-[1rem] text-dim";

/** Milliseconds per typed eyebrow character. */
const TYPE_MS = 45;

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
};

/**
 * The eyebrow + title block the About, Experience, Work, Skills and Education
 * sections open with. On first view the eyebrow types itself in behind a
 * caret, the title's words rise out of a clip, and a short teal underline
 * draws in. Screen readers get the plain text once (the animated copies are
 * aria-hidden), and under reduced motion it all renders static.
 */
export function SectionHeading({ eyebrow, title, lead }: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const [caret, setCaret] = useState(true);

  const play = inView && !reduce;

  useEffect(() => {
    if (!play) return;
    let i = 0;
    let hideCaret = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= eyebrow.length) {
        window.clearInterval(timer);
        hideCaret = window.setTimeout(() => setCaret(false), 1400);
      }
    }, TYPE_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(hideCaret);
    };
  }, [play, eyebrow]);

  if (reduce) {
    return (
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={TITLE}>{title}</h2>
        <span aria-hidden className={UNDERLINE} />
        {lead && <p className={LEAD}>{lead}</p>}
      </div>
    );
  }

  const words = title.split(" ");
  const wordStagger = 0.045;

  return (
    <div ref={ref}>
      <p className="eyebrow">
        <span className="sr-only">{eyebrow}</span>
        <span aria-hidden>{eyebrow.slice(0, typed)}</span>
        <span
          aria-hidden
          className={`ml-[3px] inline-block h-[1.05em] w-[0.5em] translate-y-[2px] bg-accent transition-opacity duration-300 ${
            typed >= eyebrow.length ? "animate-caret-blink" : ""
          } ${caret ? "" : "opacity-0"}`}
        />
      </p>

      <h2 className={TITLE}>
        <span className="sr-only">{title}</span>
        <span aria-hidden>
          {words.map((word, i) => (
            <Fragment key={i}>
              {/* the padding keeps descenders inside the clip */}
              <span className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={inView ? { y: "0%" } : undefined}
                  transition={{ duration: 0.8, delay: 0.1 + i * wordStagger, ease: EASE }}
                >
                  {word}
                </motion.span>
              </span>
              {i < words.length - 1 && " "}
            </Fragment>
          ))}
        </span>
      </h2>

      <motion.span
        aria-hidden
        className={UNDERLINE}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : undefined}
        transition={{ duration: 0.7, delay: 0.4 + words.length * wordStagger, ease: EASE }}
      />

      {lead && (
        <motion.p
          className={LEAD}
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
        >
          {lead}
        </motion.p>
      )}
    </div>
  );
}

export function Divider() {
  return (
    <div className="shell">
      <div className="rule-fade" />
    </div>
  );
}
