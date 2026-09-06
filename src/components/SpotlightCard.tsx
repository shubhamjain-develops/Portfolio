"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. Set to 0 for a glow-only card. */
  tilt?: number;
  onClick?: () => void;
  as?: "div" | "button" | "article";
  ariaLabel?: string;
};

/**
 * A surface that tracks the cursor twice over:
 *  - a radial "spotlight" gradient follows the pointer across the card face
 *  - the card tilts a couple of degrees toward the pointer, on a spring
 * Both effects are pointer-only and both switch off under reduced motion.
 */
export function SpotlightCard({
  children,
  className = "",
  tilt = 4,
  onClick,
  as = "div",
  ariaLabel,
}: SpotlightCardProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);

  const spring = { stiffness: 190, damping: 18, mass: 0.35 };
  const rx = useSpring(useMotionValue(0), spring);
  const ry = useSpring(useMotionValue(0), spring);

  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, rgb(var(--glow) / 0.13), transparent 72%)`;

  function handleMove(e: React.PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mx.set(x);
    my.set(y);
    if (tilt > 0) {
      ry.set(((x / rect.width) * 2 - 1) * tilt);
      rx.set((1 - (y / rect.height) * 2) * tilt);
    }
  }

  function handleLeave() {
    mx.set(-9999);
    my.set(-9999);
    rx.set(0);
    ry.set(0);
  }

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref as never}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={onClick}
      aria-label={ariaLabel}
      style={
        reduce
          ? undefined
          : { rotateX: rx, rotateY: ry, transformPerspective: 1100 }
      }
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`group relative isolate overflow-hidden rounded-xl border border-line card-surface transition-colors duration-300 hover:border-accent/45 ${className}`}
    >
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />
      )}
      {children}
    </MotionTag>
  );
}
