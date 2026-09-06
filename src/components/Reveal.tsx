"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds. Use for hero content that animates on load rather than on scroll. */
  delay?: number;
  /** Travel distance in px. */
  y?: number;
  /** Animate immediately instead of waiting for the element to scroll into view. */
  immediate?: boolean;
  as?: ElementType;
};

/**
 * Single scroll-reveal primitive used across the page so every section shares
 * the same easing and distance. Collapses to a plain fade-free render when the
 * visitor prefers reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  immediate = false,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduce) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  const animation = {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.62, delay, ease: EASE },
  };

  if (immediate) {
    return (
      <MotionTag
        className={className}
        initial={animation.initial}
        animate={animation.animate}
        transition={animation.transition}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial={animation.initial}
      whileInView={animation.animate}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={animation.transition}
    >
      {children}
    </MotionTag>
  );
}

/** Parent variant: children reveal in sequence rather than all at once. */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Wraps a list so its children stagger in. Children must use `staggerChild`. */
export function StaggerGroup({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduce) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </MotionTag>
  );
}

export { EASE };
