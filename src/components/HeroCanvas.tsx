"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Home position — particles drift around it and are pulled back to it. */
  hx: number;
  hy: number;
  r: number;
};

const LINK_DIST = 132;
const CURSOR_RADIUS = 170;

/**
 * The hero's background: a constellation of nodes that links neighbours and
 * reacts to the cursor — nodes within range are nudged away and drawn brighter,
 * with lines running from the pointer to whatever is nearby.
 *
 * Colours are read from the live CSS variables so the canvas re-tints itself
 * when the theme changes, and the whole loop is skipped for reduced motion
 * (a single static frame is drawn instead).
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const host = canvas.parentElement;
    if (!ctx || !host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    /** Reads `--c-accent` (space-separated channels) off the document root. */
    const readAccent = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--c-accent")
        .trim();
      return raw || "63 224 200";
    };
    let accent = readAccent();
    // Light mode sits on a bright ground, so the same alphas would vanish.
    let intensity = document.documentElement.classList.contains("dark") ? 1 : 1.55;

    const build = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(
        Math.max(26, Math.min(76, (width * height) / 17000))
      );
      particles = Array.from({ length: count }, () => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          x,
          y,
          hx: x,
          hy: y,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1.1 + Math.random() * 1.5,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;

          // gentle spring back toward home so the field never drifts apart
          p.vx += (p.hx - p.x) * 0.00035;
          p.vy += (p.hy - p.y) * 0.00035;

          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < CURSOR_RADIUS * CURSOR_RADIUS && d2 > 1) {
              const d = Math.sqrt(d2);
              const push = (1 - d / CURSOR_RADIUS) * 0.55;
              p.vx += (dx / d) * push * 0.1;
              p.vy += (dy / d) * push * 0.1;
            }
          }

          p.vx *= 0.986;
          p.vy *= 0.986;

          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
        }
      }

      // links between neighbours
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.17 * intensity;
          ctx.strokeStyle = `rgb(${accent} / ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // links from the pointer, plus brighter nodes near it
      for (const p of particles) {
        let boost = 0;
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < CURSOR_RADIUS) {
            boost = 1 - d / CURSOR_RADIUS;
            ctx.strokeStyle = `rgb(${accent} / ${boost * 0.3 * intensity})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgb(${accent} / ${(0.5 + boost * 0.5) * intensity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + boost * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (coarse || e.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    build();
    if (reduce) {
      draw();
    } else {
      loop();
    }

    const ro = new ResizeObserver(() => {
      build();
      if (reduce) draw();
    });
    ro.observe(host);

    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);

    // Re-read the palette when the theme class flips.
    const mo = new MutationObserver(() => {
      accent = readAccent();
      intensity = document.documentElement.classList.contains("dark") ? 1 : 1.55;
      if (reduce) draw();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
