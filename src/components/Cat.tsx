"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { site } from "@/data/content";
import { CHEEK_CAPACITY, cheekLevel, isAsleep, isZoomiesFeed } from "@/lib/catCount";
import { useActiveSection } from "@/lib/useActiveSection";
import { feedCat, useCatCount } from "@/lib/useCatCount";
import {
  BLUSH, BODY, CELL, CHEEK_L, CHEEK_L_FULL, CHEEK_R, CHEEK_R_FULL, CRUMBS, DRUMSTICK, ENVELOPE, EYE,
  EYE_HAPPY, EYE_SHUT, FISH, HARDHAT, HEAD, HEART, LAPTOP, MOUTH_OPEN, NIGHTCAP, PALETTE, SHRIMP, SPARK,
  SUNGLASSES, TAIL, TWINKLE, Z_BIG, Z_SMALL, type Sprite,
} from "./catSprites";

const TREATS = ["fish", "shrimp", "drumstick"] as const;
const CHEW_MS = 1200;
const DROP_MS = 680;
const YAWN_MS = 900;
const ZOOM_MS = 1600;
/** Feeds are at least this far apart, even when a key is held or motion is reduced. */
const MIN_FEED_GAP_MS = 400;
/** How often to re-check the clock and the idle timer for sleep. */
const SLEEP_CHECK_MS = 5_000;

/** The SVG's viewBox width, for turning screen pixels into SVG units. */
const VIEWBOX_WIDTH = 256;
/** Midpoint between the eyes, in SVG units from the viewBox's top-left corner. */
const FACE_X = 92;
const FACE_Y = 104;
/** How far the cursor has to be to the side before the eyes jump a cell toward it (-1 to 1). */
const LOOK_ASIDE = 0.35;
/** Eyes are fully turned once the cursor is this many screen pixels away. */
const FULL_TURN_AT = 80;
/** The cursor counts as "close" within this many screen pixels of the face. */
const EXCITED_WITHIN = 220;
/** A tap focuses the link it lands on; focus this soon after a touch isn't a keyboard visit. */
const TOUCH_FOCUS_GRACE_MS = 600;

type Heart = { id: number; x: number; r: number; delay: number };
type Headwear = "nightcap" | "hardhat" | "sunglasses";
type Held = "laptop" | "envelope";

/** Links that thrill it: any email link, and any link to the résumé. */
function isCheerLink(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const link = target.closest("a[href]");
  // Under the case-study modal or inside the terminal's output, it can't see the link.
  if (!link || link.closest('[role="dialog"], [data-terminal-log]')) return false;
  const href = link.getAttribute("href") ?? "";
  if (href.startsWith("mailto:")) return true;
  try {
    return new URL(href, window.location.href).pathname === site.resumePath;
  } catch {
    return false;
  }
}

/**
 * A cat sitting in the bottom-left corner. It eats when clicked and shows how many
 * times it was fed today. The count lives only in the visitor's browser, per
 * local calendar day. It renders after mount because the server can't know
 * what's in localStorage or the visitor's clock, and a guess would flash on
 * hydration.
 *
 * Its day: each feed puffs its cheeks, and the fifth sets off a burst of zoomies.
 * Between 23:00 and 06:00 it sleeps; a click wakes it with a yawn, and it
 * stays up while the visitor is active on the page.
 *
 * It also watches the cursor: its eyes follow it anywhere on the page, its body
 * leans gently after it, and it gets excited when the cursor comes close. With
 * no cursor it glances around on its own. All of that is off under reduced
 * motion.
 */
export function Cat() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const count = useCatCount();
  const [treat, setTreat] = useState(0);
  const [eating, setEating] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [full, setFull] = useState(false);
  const [asleep, setAsleep] = useState(false);
  const [yawning, setYawning] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [thrilled, setThrilled] = useState(false);
  const { resolvedTheme } = useTheme();
  const section = useActiveSection();
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [feeds, setFeeds] = useState(0);
  const busy = useRef(false);
  const asleepRef = useRef(false);
  /** Last time the visitor did anything while it was awake; null until then. */
  const lastActivity = useRef<number | null>(null);
  const lastFeedAt = useRef(-Infinity);
  const timers = useRef<number[]>([]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    setMounted(true);
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  // The count can change without a feed here (midnight, another tab). Serve
  // the matching treat, but never swap it out from under a meal in progress.
  useEffect(() => {
    if (!busy.current) setTreat(count % TREATS.length);
  }, [count]);

  // Sleep follows the visitor's clock. Activity only keeps an awake cat
  // awake — nothing but a click wakes a sleeping one.
  useEffect(() => {
    const check = () => {
      const next = !busy.current && isAsleep(new Date(), lastActivity.current);
      asleepRef.current = next;
      setAsleep(next);
    };
    let marked = -Infinity;
    const onActivity = () => {
      // Throttle on the monotonic clock: a wall clock can jump backwards.
      const tick = performance.now();
      if (asleepRef.current || tick - marked < 1000) return;
      marked = tick;
      lastActivity.current = Date.now();
    };
    const onVisible = () => {
      if (!document.hidden) check();
    };

    check();
    const tick = window.setInterval(check, SLEEP_CHECK_MS);
    const events = ["scroll", "pointermove", "keydown", "focusin"] as const;
    events.forEach((type) => window.addEventListener(type, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(tick);
      events.forEach((type) => window.removeEventListener(type, onActivity));
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Thrilled while the visitor points at, or tabs to, an email or résumé link.
  useEffect(() => {
    let lastTouch = -Infinity;
    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType !== "touch") setThrilled(isCheerLink(e.target));
    };
    const onPointerOut = (e: PointerEvent) => {
      // Moving from an icon to the text inside the same link isn't leaving it.
      if (e.pointerType !== "touch" && !isCheerLink(e.relatedTarget)) setThrilled(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") lastTouch = performance.now();
    };
    const onFocusIn = (e: FocusEvent) => {
      if (performance.now() - lastTouch > TOUCH_FOCUS_GRACE_MS) setThrilled(isCheerLink(e.target));
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!isCheerLink(e.relatedTarget)) setThrilled(false);
    };
    // Back from a mail app or a download, nothing is being pointed at any more.
    const calmDown = () => setThrilled(false);

    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", calmDown);
    window.addEventListener("pagehide", calmDown);
    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", calmDown);
      window.removeEventListener("pagehide", calmDown);
    };
  }, []);

  // The eyes follow the cursor. One rAF loop eases toward a target and, being
  // pixel art, snaps the eyes a whole cell left or right through a data
  // attribute on the SVG, so pointer moves never re-render React.
  useEffect(() => {
    if (!mounted || reduce) return;
    const svg = svgRef.current;
    const button = buttonRef.current;
    if (!svg || !button) return;

    let pointer: { x: number; y: number } | null = null;
    let nextGlance = 0;
    let raf = 0;
    // Where to look, as a direction from -1 to 1 on each axis.
    const target = { x: 0, y: 0 };
    let eased = 0;
    let look = "c";

    const aim = (now: number) => {
      if (!pointer) {
        // No cursor (touch screen, or it left the window): glance around.
        button.classList.remove("cat-excited");
        if (now < nextGlance) return;
        target.x = (Math.floor(Math.random() * 3) - 1) * 0.85; // left, ahead or right
        target.y = (Math.random() - 0.5) * 0.9;
        nextGlance = now + 1400 + Math.random() * 1600;
        return;
      }
      const rect = svg.getBoundingClientRect();
      const scale = rect.width / VIEWBOX_WIDTH;
      const dx = pointer.x - (rect.left + FACE_X * scale);
      const dy = pointer.y - (rect.top + FACE_Y * scale);
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, distance / FULL_TURN_AT);
      target.x = (dx / distance) * reach;
      target.y = (dy / distance) * reach;
      button.classList.toggle("cat-excited", distance < EXCITED_WITHIN && !asleepRef.current);
    };

    const frame = (now: number) => {
      aim(now);
      eased += (target.x - eased) * 0.22;
      const next = eased > LOOK_ASIDE ? "r" : eased < -LOOK_ASIDE ? "l" : "c";
      if (next !== look) {
        look = next;
        svg.dataset.look = next;
      }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      // A touch only moves the cursor while pressed; a tap still gives it somewhere to look.
      if (e.pointerType === "touch" && e.type === "pointermove") return;
      pointer = { x: e.clientX, y: e.clientY };
    };
    const onLeaveWindow = (e: MouseEvent) => {
      if (!e.relatedTarget) pointer = null;
    };
    // Keyboard visitors get the eye movement too: it glances at whatever takes focus.
    const onFocus = (e: FocusEvent) => {
      if (!(e.target instanceof Element) || e.target === document.body) return;
      const r = e.target.getBoundingClientRect();
      pointer = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("mouseout", onLeaveWindow);
    document.addEventListener("focusin", onFocus);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("mouseout", onLeaveWindow);
      document.removeEventListener("focusin", onFocus);
      button.classList.remove("cat-excited");
      svg.dataset.look = "c";
    };
  }, [mounted, reduce]);

  // One thing at a time: clicks while it yawns, chews or zooms are ignored.
  function feed() {
    // Monotonic, so a clock set back (DST, a manual change) can't lock feeding out for hours.
    const tick = performance.now();
    if (busy.current || tick - lastFeedAt.current < MIN_FEED_GAP_MS) return;
    busy.current = true;
    lastFeedAt.current = tick;
    lastActivity.current = Date.now();

    if (asleepRef.current) {
      asleepRef.current = false;
      setAsleep(false);
      if (!reduce) {
        setYawning(true);
        later(() => {
          setYawning(false);
          eat();
        }, YAWN_MS);
        return;
      }
    }
    eat();
  }

  function eat() {
    const next = feedCat();
    setFeeds((f) => f + 1);

    if (reduce) {
      setFull(true);
      later(() => {
        setFull(false);
        setTreat(next % TREATS.length);
        busy.current = false;
      }, 700);
      return;
    }

    setEating(true);
    const burst = Date.now();
    setHearts(
      [0, 1, 2, 3].map((i) => ({
        id: burst + i,
        x: (i - 1.5) * 16 + Math.random() * 8 - 4,
        r: Math.random() * 40 - 20,
        delay: 0.35 + i * 0.1,
      }))
    );
    later(() => setHearts([]), 1900);

    const serveNext = () => {
      setTreat(next % TREATS.length);
      setDropping(true);
      later(() => {
        setDropping(false);
        busy.current = false;
      }, DROP_MS);
    };

    later(() => {
      setEating(false);
      if (!isZoomiesFeed(next)) return serveNext();
      // Full cheeks: zoomies, then back with them empty.
      setZooming(true);
      later(() => {
        setZooming(false);
        serveNext();
      }, ZOOM_MS);
    }, CHEW_MS);
  }

  if (!mounted) return null;

  const unit = count === 1 ? "time" : "times";
  // The count already reads empty on the fifth feed; keep the cheeks puffed until the zoomies are over.
  const cheeks = zooming || (eating && isZoomiesFeed(count)) ? CHEEK_CAPACITY : cheekLevel(count);
  // One thing on its head: sleep beats the section, and the section beats the theme.
  const headwear: Headwear | null = asleep
    ? "nightcap"
    : section === "experience"
      ? "hardhat"
      : resolvedTheme === "light"
        ? "sunglasses"
        : null;
  // Its paws are busy with food while eating, and empty while asleep or off on its zoomies.
  const held: Held | null =
    asleep || yawning || eating || zooming
      ? null
      : section === "skills"
        ? "laptop"
        : section === "contact"
          ? "envelope"
          : null;
  const states = [
    eating && "eating",
    full && "full",
    asleep && "asleep",
    yawning && "yawning",
    zooming && "zooming",
    thrilled && !asleep && !zooming && "thrilled",
    held && "holding",
  ].filter(Boolean);

  return (
    <div className="cat-dock">
      <p className="cat-fed" aria-live="polite">
        <HeartIcon />
        Fed{" "}
        <b key={feeds} className={feeds ? "bump" : undefined}>
          {count.toLocaleString("en-IN")}
        </b>{" "}
        {unit} today
        {feeds > 0 && (
          <span key={`plus-${feeds}`} className="cat-plus" aria-hidden>
            +1
          </span>
        )}
      </p>
      <button
        ref={buttonRef}
        type="button"
        onClick={feed}
        onKeyDown={(e) => {
          // A held key would otherwise repeat clicks as fast as the OS allows.
          if (e.repeat && (e.key === "Enter" || e.key === " ")) e.preventDefault();
        }}
        aria-label={`${asleep ? "Wake and feed" : "Feed"} the cat. Fed ${count} ${unit} today.`}
        className={["cat", ...states].join(" ")}
      >
        <CatArt
          svgRef={svgRef}
          treat={treat}
          dropping={dropping}
          hideTreat={full || asleep || zooming}
          cheeks={full ? CHEEK_CAPACITY : cheeks}
          headwear={headwear}
          held={held}
        />
        {hearts.map((h) => (
          <span
            key={h.id}
            className="cat-heart"
            style={
              {
                "--hx": `${h.x}px`,
                "--hr": `${h.r}deg`,
                animationDelay: `${h.delay}s`,
              } as CSSProperties
            }
          >
            <HeartIcon />
          </span>
        ))}
      </button>
    </div>
  );
}

/** A pixel heart in the current text colour, for the counter and the feeding burst. */
function HeartIcon() {
  return (
    <svg viewBox="0 0 5 4" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
      {HEART.map((row, y) =>
        [...row].map((ch, x) => (ch === "." ? null : <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />))
      )}
    </svg>
  );
}

/**
 * Draws a sprite as SVG rects, one rect per run of same-coloured cells in a
 * row, so a 24-cell row is a handful of rects rather than 24.
 */
function Pixels({ sprite, x, y }: { sprite: Sprite; x: number; y: number }) {
  const rects: React.ReactElement[] = [];
  sprite.forEach((row, r) => {
    let c = 0;
    while (c < row.length) {
      let end = c + 1;
      while (end < row.length && row[end] === row[c]) end++;
      const fill = PALETTE[row[c]];
      if (fill) {
        rects.push(
          <rect key={`${r}.${c}`} x={(x + c) * CELL} y={(y + r) * CELL} width={(end - c) * CELL} height={CELL} fill={fill} />
        );
      }
      c = end;
    }
  });
  return <>{rects}</>;
}

/** Both eyes, shifted `dx` cells to look aside. */
function Eyes({ sprite, dx = 0 }: { sprite: Sprite; dx?: number }) {
  return (
    <>
      <Pixels sprite={sprite} x={5 + dx} y={6} />
      <Pixels sprite={sprite} x={15 + dx} y={6} />
    </>
  );
}

/** Cheeks fill out with today's feeds: a blush, then a puff, then a full puff. */
function Cheeks({ level }: { level: number }) {
  if (level <= 0) return null;
  return (
    <>
      {level >= 5 ? (
        <>
          <Pixels sprite={CHEEK_L_FULL} x={0} y={7} />
          <Pixels sprite={CHEEK_R_FULL} x={19} y={7} />
        </>
      ) : level >= 3 ? (
        <>
          <Pixels sprite={CHEEK_L} x={1} y={8} />
          <Pixels sprite={CHEEK_R} x={19} y={8} />
        </>
      ) : null}
      <Pixels sprite={BLUSH} x={4} y={8} />
      <Pixels sprite={BLUSH} x={17} y={8} />
    </>
  );
}

function CatArt({
  svgRef,
  treat,
  dropping,
  hideTreat,
  cheeks,
  headwear,
  held,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  treat: number;
  dropping: boolean;
  hideTreat: boolean;
  cheeks: number;
  headwear: Headwear | null;
  held: Held | null;
}) {
  const on = (name: (typeof TREATS)[number]) =>
    TREATS[treat] === name ? "on" : undefined;

  // 32 cells across, rows -6 to 22: room for hats above and the treat to the right.
  return (
    <svg ref={svgRef} viewBox="0 -48 256 232" data-look="c" aria-hidden="true" focusable="false">
      <rect className="cat-shadow" x={3 * CELL} y={22 * CELL} width={17 * CELL} height={CELL / 2} />
      <rect className="cat-shadow" x={24 * CELL} y={22 * CELL} width={6 * CELL} height={CELL / 2} />

      <g className="px-cat">
        <g className="px-tail">
          {TAIL.map((frame, i) => (
            <g key={i} className={`px-tail-f${i}`}>
              <Pixels sprite={frame} x={19} y={10} />
            </g>
          ))}
        </g>
        <Pixels sprite={BODY} x={0} y={12} />

        <g className="px-head">
          <Pixels sprite={HEAD} x={0} y={0} />
          <Cheeks level={cheeks} />
          <g className="px-eyes-open">
            <g className="px-look-c"><Eyes sprite={EYE} /></g>
            <g className="px-look-l"><Eyes sprite={EYE} dx={-1} /></g>
            <g className="px-look-r"><Eyes sprite={EYE} dx={1} /></g>
          </g>
          <g className="px-eyes-shut"><Eyes sprite={EYE_SHUT} /></g>
          <g className="px-eyes-happy"><Eyes sprite={EYE_HAPPY} /></g>
          <g className="px-mouth"><Pixels sprite={MOUTH_OPEN} x={10} y={9} /></g>
          <g className="px-crumbs"><Pixels sprite={CRUMBS} x={9} y={11} /></g>
          {headwear === "sunglasses" && <Pixels sprite={SUNGLASSES} x={6} y={1} />}
          {headwear === "hardhat" && <Pixels sprite={HARDHAT} x={4} y={0} />}
          {headwear === "nightcap" && <Pixels sprite={NIGHTCAP} x={3} y={-3} />}
        </g>

        {held && (
          <g className="cat-held">
            {held === "laptop" ? <Pixels sprite={LAPTOP} x={4} y={14} /> : <Pixels sprite={ENVELOPE} x={6} y={14} />}
          </g>
        )}

        <g className="px-sparks">
          <Pixels sprite={SPARK} x={0} y={3} />
          <Pixels sprite={SPARK} x={21} y={5} />
          <Pixels sprite={SPARK} x={1} y={12} />
        </g>
      </g>

      <g
        className={`cat-treat${dropping ? " drop" : ""}`}
        style={hideTreat ? { opacity: 0 } : undefined}
      >
        <g className={on("fish")}><Pixels sprite={FISH} x={24} y={18} /></g>
        <g className={on("shrimp")}><Pixels sprite={SHRIMP} x={24} y={18} /></g>
        <g className={on("drumstick")}><Pixels sprite={DRUMSTICK} x={24} y={18} /></g>
      </g>
      <g className="px-twinkle"><Pixels sprite={TWINKLE} x={29} y={15} /></g>

      <g className="px-zzz">
        <g className="px-z1"><Pixels sprite={Z_BIG} x={21} y={0} /></g>
        <g className="px-z2"><Pixels sprite={Z_SMALL} x={25} y={-3} /></g>
      </g>
    </svg>
  );
}
