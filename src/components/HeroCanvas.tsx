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
  /** Brightness bump when a packet arrives; decays every frame. */
  flash: number;
};

/** A request travelling along a link between two particles (by index). */
type Packet = {
  from: number;
  to: number;
  /** 0 → 1 along the link. */
  t: number;
  /** Links per second. */
  speed: number;
  /** How many more links it may hop onto after this one. */
  hops: number;
  /** Fanned out by a click rather than ordinary traffic. */
  burst: boolean;
};

type Ring = { x: number; y: number; r: number; alpha: number };

const LINK_DIST = 132;
const CURSOR_RADIUS = 170;
const MAX_PACKETS = 44;

/**
 * The hero's background: a constellation of nodes that links neighbours and
 * reacts to the cursor — nodes within range are nudged away and drawn brighter,
 * with lines running from the pointer to whatever is nearby.
 *
 * Small request packets travel the links and hop onward, like calls through a
 * service mesh, in the site's existing blue. A click fans a burst out from the
 * nearest node in coral, the one extra accent colour.
 *
 * Colours are read from the live CSS variables so the canvas re-tints itself
 * when the theme changes, and the whole loop is skipped for reduced motion
 * (a single static frame with no packets is drawn instead).
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
    let packets: Packet[] = [];
    let rings: Ring[] = [];
    let raf = 0;
    let last = 0;
    let spawnAt = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    /** Reads a colour token (space-separated channels) off the document root. */
    const readColor = (name: string, fallback: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
      fallback;
    const readPalette = () => ({
      accent: readColor("--c-accent", "63 224 200"),
      traffic: readColor("--c-accent-2", "122 172 255"),
      warm: readColor("--c-warm", "255 146 107"),
    });
    let palette = readPalette();
    // Light mode sits on a bright ground, so the same alphas would vanish.
    let intensity = document.documentElement.classList.contains("dark") ? 1 : 1.55;

    const neighbours = (i: number, max = LINK_DIST) => {
      const a = particles[i];
      const found: number[] = [];
      for (let j = 0; j < particles.length; j++) {
        if (j === i) continue;
        const b = particles[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) < max) found.push(j);
      }
      return found;
    };

    const launch = (
      from: number,
      to: number,
      speed: number,
      hops: number,
      burst: boolean,
      t = 0
    ) => {
      // A click always gets its burst, even when ordinary traffic is at the cap.
      if (burst || packets.length < MAX_PACKETS) {
        packets.push({ from, to, t, speed, hops, burst });
      }
    };

    const spawn = (t = 0) => {
      if (!particles.length) return;
      const from = Math.floor(Math.random() * particles.length);
      const options = neighbours(from);
      if (!options.length) return;
      const to = options[Math.floor(Math.random() * options.length)];
      launch(from, to, 0.9 + Math.random() * 0.9, 3, false, t);
    };

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
          flash: 0,
        };
      });

      // Indices point into the old particle list, so traffic restarts with it.
      packets = [];
      rings = [];
      // Start some packets mid-flight so the first frame already shows traffic.
      if (!reduce) for (let i = 0; i < 12; i++) spawn(Math.random() * 0.8);
    };

    /** Moves packets and click rings forward by `dt` seconds. */
    const advance = (dt: number) => {
      for (const q of packets) {
        q.t += q.speed * dt;
        if (q.t < 1) continue;
        particles[q.to].flash = 1;
        const onward =
          q.hops > 0 && Math.random() < 0.6
            ? neighbours(q.to).filter((n) => n !== q.from)
            : [];
        if (onward.length) {
          q.from = q.to;
          q.to = onward[Math.floor(Math.random() * onward.length)];
          q.t = 0;
          q.hops -= 1;
        } else {
          q.hops = -1; // arrived for good
        }
      }
      packets = packets.filter((q) => q.hops >= 0);

      for (const ring of rings) {
        ring.r += 180 * dt;
        ring.alpha -= 1.4 * dt;
      }
      rings = rings.filter((ring) => ring.alpha > 0);
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
          p.flash *= 0.92;

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
          ctx.strokeStyle = `rgb(${palette.accent} / ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // links from the pointer, plus brighter nodes near it or just reached by a packet
      for (const p of particles) {
        let boost = p.flash;
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < CURSOR_RADIUS) {
            const near = 1 - d / CURSOR_RADIUS;
            boost = Math.max(boost, near);
            ctx.strokeStyle = `rgb(${palette.accent} / ${near * 0.3 * intensity})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgb(${palette.accent} / ${Math.min(1, (0.5 + boost * 0.5) * intensity)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + boost * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // packets: a short fading tail and a glowing head
      for (const q of packets) {
        const a = particles[q.from];
        const b = particles[q.to];
        const color = q.burst ? palette.warm : palette.traffic;
        const x = a.x + (b.x - a.x) * q.t;
        const y = a.y + (b.y - a.y) * q.t;
        const t0 = Math.max(0, q.t - 0.22);
        const x0 = a.x + (b.x - a.x) * t0;
        const y0 = a.y + (b.y - a.y) * t0;
        const tail = ctx.createLinearGradient(x0, y0, x, y);
        tail.addColorStop(0, `rgb(${color} / 0)`);
        tail.addColorStop(1, `rgb(${color} / ${Math.min(1, 0.8 * intensity)})`);
        ctx.strokeStyle = tail;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = `rgb(${color})`;
        ctx.shadowColor = `rgb(${color} / 0.8)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // expanding rings where a click landed
      ctx.lineWidth = 1.5;
      for (const ring of rings) {
        ctx.strokeStyle = `rgb(${palette.warm} / ${ring.alpha * 0.6 * intensity})`;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
    };

    const loop = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (now > spawnAt) {
        spawn();
        spawnAt = now + 200 + Math.random() * 170;
      }
      advance(dt);
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

    // The canvas sits behind the hero text, so clicks are caught on the whole
    // hero section. Clicking a link or button just does that, with no burst,
    // and neither does anything inside the terminal (typing, selecting output).
    const clickArea = host.closest("section") ?? host;
    const onPointerDown = (e: PointerEvent) => {
      if (reduce || !particles.length) return;
      if (e.target instanceof Element && e.target.closest("a, button, input, [data-no-burst]")) return;
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let hub = 0;
      let best = Infinity;
      particles.forEach((p, i) => {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < best) {
          best = d;
          hub = i;
        }
      });

      const h = particles[hub];
      h.flash = 1;
      rings.push({ x: h.x, y: h.y, r: 4, alpha: 1 });
      for (const n of neighbours(hub, LINK_DIST * 1.3)) {
        launch(hub, n, 1.8 + Math.random() * 0.8, 2, true);
        const p = particles[n];
        const d = Math.hypot(p.x - h.x, p.y - h.y) || 1;
        p.vx += ((p.x - h.x) / d) * 0.6;
        p.vy += ((p.y - h.y) / d) * 0.6;
      }
    };

    build();
    if (reduce) {
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      build();
      if (reduce) draw();
    });
    ro.observe(host);

    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);
    clickArea.addEventListener("pointerdown", onPointerDown);

    // Re-read the palette when the theme class flips.
    const mo = new MutationObserver(() => {
      palette = readPalette();
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
      clickArea.removeEventListener("pointerdown", onPointerDown);
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
