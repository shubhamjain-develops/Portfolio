"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

type CrowdCanvasProps = {
  /** Same-origin sprite sheet: black line art, white fill, transparent ground. */
  src: string;
  /** Sprites across the sheet. */
  rows?: number;
  /** Sprites down the sheet. */
  cols?: number;
  /** Sheet index of the one peep who stands still, centred and in colour. */
  standout?: number;
  className?: string;
};

type Peep = {
  rect: [number, number, number, number];
  width: number;
  height: number;
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  walk: gsap.core.Timeline | null;
};

type RGB = [number, number, number];

const randomRange = (min: number, max: number) => min + Math.random() * (max - min);
const randomIndex = (array: unknown[]) => randomRange(0, array.length) | 0;
const removeItem = <T,>(array: T[], item: T) => array.splice(array.indexOf(item), 1)[0];

/** Palette channels from globals.css, e.g. "--c-accent" -> [10, 115, 101]. */
const channel = (name: string): RGB => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const [r = 0, g = 0, b = 0] = value.split(/\s+/).map(Number);
  return [r, g, b];
};

/** Repaint the sheet's black-to-white ramp as line-to-fill, keeping alpha. */
function recolour(
  img: HTMLImageElement,
  rect: [number, number, number, number],
  line: RGB,
  fill: RGB,
) {
  const [sx, sy, w, h] = rect;
  const out = document.createElement("canvas");
  out.width = Math.round(w);
  out.height = Math.round(h);
  const ctx = out.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, sx, sy, w, h, 0, 0, out.width, out.height);
  const image = ctx.getImageData(0, 0, out.width, out.height);
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) {
    const t = d[i] / 255;
    d[i] = line[0] + (fill[0] - line[0]) * t;
    d[i + 1] = line[1] + (fill[1] - line[1]) * t;
    d[i + 2] = line[2] + (fill[2] - line[2]) * t;
  }
  ctx.putImageData(image, 0, 0);
  return out;
}

/**
 * A crowd walking past, after Skiper UI's Skiper 39. Adapted here: walkers are
 * recoloured from the site palette (and again on a theme switch), sprites
 * scale to the canvas, one `standout` peep stands still in the accent colour,
 * the sheet loads only when the canvas nears the viewport, drawing pauses
 * off-screen, and reduced motion freezes the crowd mid-stride.
 */
export function CrowdCanvas({ src, rows = 15, cols = 7, standout, className }: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = document.createElement("img");
    const stage = { width: 0, height: 0, scale: 1 };
    const allPeeps: Peep[] = [];
    const available: Peep[] = [];
    const crowd: Peep[] = [];
    let hero: Peep | null = null;
    let sheet: HTMLCanvasElement | null = null;
    let heroArt: HTMLCanvasElement | null = null;
    let loaded = false;
    let visible = false;
    let ticking = false;

    const paint = () => {
      // Dark mode's sheet is mostly black clothing, which --c-faint would turn
      // into a wall of grey; the strong border colour keeps it in the background.
      const dark = document.documentElement.classList.contains("dark");
      const line = channel(dark ? "--c-border-strong" : "--c-faint");
      const fill = channel("--c-surface");
      sheet = recolour(img, [0, 0, img.naturalWidth, img.naturalHeight], line, fill);
      if (hero) {
        // A lighter accent keeps the dark line art readable in both themes.
        const accent = channel("--c-accent");
        const tint = accent.map((c) => c + (255 - c) * 0.28) as RGB;
        // Ink on the light page; on the dark page, a deep teal instead, or black
        // clothes and hair would vanish into the background.
        const ink = dark ? (accent.map((c) => c * 0.3) as RGB) : ([20, 24, 29] as RGB);
        heroArt = recolour(img, hero.rect, ink, tint);
      }
    };

    const resetPeep = (peep: Peep) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const offsetY = (100 - 250 * gsap.parseEase("power2.in")(Math.random())) * stage.scale;
      const startY = stage.height - peep.height + offsetY;
      const startX = direction === 1 ? -peep.width : stage.width + peep.width;
      const endX = direction === 1 ? stage.width : 0;
      peep.scaleX = direction;
      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;
      return { startY, endX };
    };

    const walk = (peep: Peep) => {
      const { startY, endX } = resetPeep(peep);
      const xDuration = 10;
      const yDuration = 0.25;
      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.5, 1.5));
      tl.to(peep, { duration: xDuration, x: endX, ease: "none" }, 0);
      tl.to(peep, { duration: yDuration, repeat: xDuration / yDuration, yoyo: true, y: startY - 10 * stage.scale }, 0);
      return tl;
    };

    const addPeepToCrowd = () => {
      const peep = available.splice(randomIndex(available), 1)[0];
      peep.walk = walk(peep).eventCallback("onComplete", () => {
        removeItem(crowd, peep);
        available.push(peep);
        addPeepToCrowd();
      });
      if (still) peep.walk.pause();
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return peep;
    };

    const render = () => {
      if (!visible || !sheet) return;
      const dpr = window.devicePixelRatio;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      for (const peep of crowd) {
        ctx.save();
        ctx.translate(peep.x, peep.y);
        ctx.scale(peep.scaleX, 1);
        const [sx, sy, w, h] = peep.rect;
        ctx.drawImage(sheet, sx, sy, w, h, 0, 0, peep.width, peep.height);
        ctx.restore();
      }
      // The standout is drawn last so no walker ever covers them.
      if (hero && heroArt) ctx.drawImage(heroArt, hero.x, hero.y, hero.width, hero.height);
      ctx.restore();
    };

    const resize = () => {
      if (!loaded) return;
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      // The sheet's sprites are 324px tall and walk up to 150px above the floor.
      stage.scale = Math.min(1, stage.height / 490, Math.max(0.5, stage.width / 1000));
      canvas.width = stage.width * window.devicePixelRatio;
      canvas.height = stage.height * window.devicePixelRatio;

      for (const peep of allPeeps) {
        peep.width = peep.rect[2] * stage.scale;
        peep.height = peep.rect[3] * stage.scale;
      }
      if (hero) {
        hero.x = (stage.width - hero.width) / 2;
        // High enough that a pose at the bottom of the sprite (folded arms) clears the band's bottom fade.
        hero.y = stage.height - hero.height + 8 * stage.scale;
      }

      crowd.forEach((peep) => peep.walk?.kill());
      crowd.length = 0;
      available.length = 0;
      available.push(...allPeeps.filter((peep) => peep !== hero));
      // The full sheet is a wall of people; keep enough that the standout shows.
      const size = Math.min(available.length, Math.round(stage.width / 28));
      for (let i = 0; i < size; i++) addPeepToCrowd().walk?.progress(Math.random());
      if (still) render();
    };

    const init = () => {
      const w = img.naturalWidth / rows;
      const h = img.naturalHeight / cols;
      for (let i = 0; i < rows * cols; i++) {
        allPeeps.push({
          rect: [(i % rows) * w, ((i / rows) | 0) * h, w, h],
          width: w, height: h, x: 0, y: 0, anchorY: 0, scaleX: 1, walk: null,
        });
      }
      hero = standout === undefined ? null : allPeeps[standout] ?? null;
      loaded = true;
      paint();
      resize();
      if (!still) {
        gsap.ticker.add(render);
        ticking = true;
      }
    };

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !img.src) img.src = src;
      if (visible && still) render();
    }, { rootMargin: "200px 0px" });
    visibility.observe(canvas);

    const sized = new ResizeObserver(() => resize());
    sized.observe(canvas);

    // next-themes swaps the class on <html>; repaint the palette when it does.
    const theme = new MutationObserver(() => {
      if (!loaded) return;
      paint();
      render();
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    img.onload = init;

    return () => {
      img.onload = null;
      visibility.disconnect();
      sized.disconnect();
      theme.disconnect();
      if (ticking) gsap.ticker.remove(render);
      crowd.forEach((peep) => peep.walk?.kill());
    };
  }, [src, rows, cols, standout]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}

/**
 * Skiper 39 Canvas_Landing_004 — React + Canvas
 * Inspired by and adapted from https://codepen.io/zadvorsky/pen/xxwbBQV
 * illustration by https://www.openpeeps.com/
 * We respect the original creators. This is an inspired rebuild with our own taste and does not claim any ownership.
 * These animations aren’t associated with the codepen.io . They’re independent recreations meant to study interaction design
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.me
 * Twitter: https://x.com/Gur__vi
 */
