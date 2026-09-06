"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Reading-progress hairline, pinned to the bottom edge of the nav bar. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-accent to-accent-2"
    />
  );
}
