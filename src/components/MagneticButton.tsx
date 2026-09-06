"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

type MagneticProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "ghost" | "quiet";
  external?: boolean;
  download?: boolean;
  ariaLabel?: string;
};

const base =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg px-[18px] py-[11px] text-[0.9rem] font-semibold transition-colors duration-200 will-change-transform";

const variants = {
  primary: "bg-accent text-accent-ink hover:bg-accent/90",
  ghost: "border border-line-strong text-ink hover:border-accent hover:text-accent",
  quiet: "text-dim hover:text-accent",
};

/**
 * A button that leans toward the cursor as it approaches, then springs back.
 * The pull is deliberately small (max ~7px) — enough to feel responsive,
 * not enough to make the target hard to hit.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  className = "",
  variant = "ghost",
  external = false,
  download = false,
  ariaLabel,
}: MagneticProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const spring = { stiffness: 260, damping: 16, mass: 0.4 };
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);

  function handleMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-7, Math.min(7, relX * 0.28)));
    y.set(Math.max(-7, Math.min(7, relY * 0.4)));
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  const classes = `${base} ${variants[variant]} ${className}`;
  const style = reduce ? undefined : { x, y };

  const inner = (
    <>
      {/* sheen that sweeps across on hover */}
      {!reduce && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-[650ms] ease-smooth group-hover/mag:translate-x-full"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        aria-label={ariaLabel}
        download={download || undefined}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={style}
        className={`group/mag ${classes}`}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={style}
      className={`group/mag ${classes}`}
    >
      {inner}
    </motion.button>
  );
}
