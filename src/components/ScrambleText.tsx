"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\[]{}#*+=$%&_—01";

type ScrambleTextProps = {
  text: string;
  className?: string;
  /** Seconds to wait before the decode starts. */
  delay?: number;
  /** Frames each character stays scrambled before locking in. */
  speed?: number;
};

/**
 * Decodes the text left to right, cycling random glyphs ahead of the resolve
 * point. The real string stays in the accessibility tree the whole time and
 * renders immediately for anyone who prefers reduced motion, so this never
 * costs readability or SEO.
 */
export function ScrambleText({
  text,
  className,
  delay = 0,
  speed = 1.8,
}: ScrambleTextProps) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? text : "");

  useEffect(() => {
    if (reduce) {
      setDisplay(text);
      return;
    }

    let raf = 0;
    let frame = 0;
    const totalFrames = text.length * speed;

    const tick = () => {
      const resolved = Math.floor(frame / speed);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (i < resolved || ch === " ") {
          out += ch;
        } else if (i < resolved + 6) {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setDisplay(out);
      frame += 1;
      if (frame <= totalFrames + 6) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [text, delay, speed, reduce]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{display}</span>
    </span>
  );
}
