"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { site } from "@/data/content";
import { CHEEK_CAPACITY, cheekLevel, isAsleep, isZoomiesFeed } from "@/lib/catCount";
import { useActiveSection } from "@/lib/useActiveSection";
import { feedCat, useCatCount } from "@/lib/useCatCount";

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
const VIEWBOX_WIDTH = 180;
/** Midpoint between the eyes, in viewBox coordinates. */
const FACE_X = 79;
const FACE_Y = 60;
/**
 * How far the eyes move (in SVG units) when looking fully to one side. The
 * white sparkles move a little further than the dark bead, so the eyes read as
 * rolling toward the cursor rather than sliding.
 */
const EYE_RANGE = { x: 5.5, y: 3.6 };
const SPARKLE_EXTRA = { x: 1.6, y: 1.1 };
/** Gentle body lean toward the cursor, in degrees. */
const MAX_TILT = 7;
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
 * A cat in a cardboard box in the bottom-left corner. It eats when clicked and shows how many
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
  const lookRef = useRef<SVGGElement>(null);
  const eyeRefs = useRef<(SVGGElement | null)[]>([]);
  const sparkleRefs = useRef<(SVGGElement | null)[]>([]);

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

  // Eyes and body follow the cursor. One rAF loop eases toward a target and
  // writes straight to the SVG, so pointer moves never re-render React.
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
    const eased = { x: 0, y: 0 };

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
      eased.x += (target.x - eased.x) * 0.22;
      eased.y += (target.y - eased.y) * 0.22;

      const eyes = `translate(${(eased.x * EYE_RANGE.x).toFixed(2)} ${(eased.y * EYE_RANGE.y).toFixed(2)})`;
      const sparkle = `translate(${(eased.x * SPARKLE_EXTRA.x).toFixed(2)} ${(eased.y * SPARKLE_EXTRA.y).toFixed(2)})`;
      for (const eye of eyeRefs.current) eye?.setAttribute("transform", eyes);
      for (const glint of sparkleRefs.current) glint?.setAttribute("transform", sparkle);
      lookRef.current?.style.setProperty("transform", `rotate(${(eased.x * MAX_TILT).toFixed(2)}deg)`);
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
        style={{ "--cat-cheeks": cheeks } as CSSProperties}
      >
        <CatArt
          svgRef={svgRef}
          lookRef={lookRef}
          eyeRefs={eyeRefs}
          sparkleRefs={sparkleRefs}
          treat={treat}
          dropping={dropping}
          hideTreat={full || asleep || zooming}
          asleep={asleep}
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

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 21s-7.6-4.7-10-9.4C.4 8.3 2.3 4.4 6.1 4.1c2.2-.2 4.2 1 5.9 3.1 1.7-2.1 3.7-3.3 5.9-3.1 3.8.3 5.7 4.2 4.1 7.5C19.6 16.3 12 21 12 21z"
      />
    </svg>
  );
}

/** Outline ink and the sticker palette. The die-cut white edge keeps it readable on any background. */
const INK = "#2b2233";
const ORANGE = "#ffa53b";
const STRIPE = "#e0771b";
const CREAM = "#fff1d6";
const PINK = "#ff8fa3";

const TAIL = "M118 98C144 102 156 86 148 68C146 62 140 62 140 68";
const EAR_L = "M39 48Q37 22 42 8Q44 4 48 6Q62 12 71 27Z";
const EAR_R = "M119 48Q121 22 116 8Q114 4 110 6Q96 12 87 27Z";
const EAR_L_INNER = "M46 40Q45 24 46 15Q56 19 63 29Z";
const EAR_R_INNER = "M112 40Q113 24 112 15Q102 19 95 29Z";
const FACE =
  "M40 68C40 60 52 57 62 63C70 59 88 59 96 63C106 57 118 60 118 68C118 82 104 94 79 94C54 94 40 82 40 68Z";

/** A white die-cut edge under one shape: the sticker border. */
const DIE = { fill: "#fff", stroke: "#fff", strokeWidth: 12, strokeLinejoin: "round" } as const;
const EDGE = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" } as const;

function Eye({
  cx,
  index,
  eyeRefs,
  sparkleRefs,
}: {
  cx: number;
  index: number;
  eyeRefs: React.MutableRefObject<(SVGGElement | null)[]>;
  sparkleRefs: React.MutableRefObject<(SVGGElement | null)[]>;
}) {
  return (
    <g className="cat-eye">
      <g
        ref={(el) => {
          eyeRefs.current[index] = el;
        }}
      >
        <ellipse cx={cx} cy="52" rx="7.2" ry="9.4" fill={INK} />
        <g
          ref={(el) => {
            sparkleRefs.current[index] = el;
          }}
        >
          <circle cx={cx + 2.6} cy="48" r="3" fill="#fff" />
          <circle cx={cx - 2.4} cy="56" r="1.4" fill="#fff" />
        </g>
      </g>
    </g>
  );
}

/** On its head. Sunglasses sit pushed up, clear of the eyes the visitor is watching. */
function HeadwearArt({ kind }: { kind: Headwear }) {
  if (kind === "nightcap") {
    return (
      <g className="cat-headwear">
        <path className="cat-cap" d="M47 33C52 13 93 3 113 23L141 12C132 26 121 33 111 34Z" {...EDGE} />
        <path d="M45 34Q79 18 114 33L114 38Q79 24 45 40Z" fill="#fff4e6" {...EDGE} strokeWidth={2.4} />
        <circle cx="142" cy="12" r="5.5" fill="#fff4e6" {...EDGE} />
      </g>
    );
  }
  if (kind === "hardhat") {
    return (
      <g className="cat-headwear">
        <path className="cat-hat" d="M51 32Q52 6 79 5Q106 6 107 32Z" {...EDGE} />
        <path className="cat-hat-ridge" d="M79 6V31" strokeWidth="3" />
        <rect className="cat-hat-brim" x="42" y="29" width="74" height="6.5" rx="3.2" {...EDGE} />
      </g>
    );
  }
  return (
    <g className="cat-headwear">
      <rect x="54" y="23" width="21" height="11" rx="5.5" fill="#222a35" {...EDGE} strokeWidth={2.4} />
      <rect x="83" y="23" width="21" height="11" rx="5.5" fill="#222a35" {...EDGE} strokeWidth={2.4} />
      <path d="M75 27.5q4-3 8 0" fill="none" stroke={INK} strokeWidth="2.6" />
      <rect x="57.5" y="25.3" width="7" height="2.4" rx="1.2" fill="#fff" opacity=".55" />
      <rect x="86.5" y="25.3" width="7" height="2.4" rx="1.2" fill="#fff" opacity=".55" />
    </g>
  );
}

/** In its paws: a laptop on Skills, an envelope on Contact. */
function HeldArt({ kind }: { kind: Held }) {
  if (kind === "laptop") {
    return (
      <g className="cat-held">
        <rect x="55" y="68" width="48" height="29" rx="3" fill="#2d3440" {...EDGE} />
        <rect className="cat-screen" x="59" y="72" width="40" height="21" rx="2" />
        <path d="M64 78h9M64 82h17M64 86h7" stroke="#e9fffb" strokeWidth="1.7" strokeLinecap="round" opacity=".85" />
        <path d="M49 97h60l-4 5H53z" fill="#434c5a" {...EDGE} strokeWidth={2.4} />
      </g>
    );
  }
  return (
    <g className="cat-held">
      <rect x="56" y="77" width="46" height="29" rx="3" fill={CREAM} {...EDGE} />
      <path d="M56.6 78.5 79 93l22.4-14.5" fill="none" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path
        className="cat-seal"
        d="M79 91.5c-1.8-2.6-6.2-1.8-5.3 1.6.8 2.7 5.3 4.7 5.3 4.7s4.5-2 5.3-4.7c.9-3.4-3.5-4.2-5.3-1.6z"
      />
    </g>
  );
}

function CatArt({
  svgRef,
  lookRef,
  eyeRefs,
  sparkleRefs,
  treat,
  dropping,
  hideTreat,
  asleep,
  headwear,
  held,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  lookRef: React.RefObject<SVGGElement | null>;
  eyeRefs: React.MutableRefObject<(SVGGElement | null)[]>;
  sparkleRefs: React.MutableRefObject<(SVGGElement | null)[]>;
  treat: number;
  dropping: boolean;
  hideTreat: boolean;
  asleep: boolean;
  headwear: Headwear | null;
  held: Held | null;
}) {
  const on = (name: (typeof TREATS)[number]) =>
    TREATS[treat] === name ? "on" : undefined;

  return (
    <svg ref={svgRef} viewBox="0 0 180 130" aria-hidden="true" focusable="false">
      <defs>
        <filter id="cat-lift" x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#000" floodOpacity="0.28" />
        </filter>
      </defs>
      <ellipse className="cat-shadow" cx="80" cy="124" rx="54" ry="4.6" />
      <ellipse className="cat-shadow" cx="150" cy="121" rx="12" ry="2.6" />

      <g transform="translate(150 119)">
        <g
          className={`cat-treat${dropping ? " drop" : ""}`}
          style={hideTreat ? { opacity: 0 } : undefined}
        >
          <g className={on("fish")}>
            <path d="M8-8 19-16V0Z" fill="#3f8fe0" {...EDGE} strokeWidth={2.6} />
            <ellipse cx="-2" cy="-8" rx="12" ry="7.5" fill="#63b0fb" {...EDGE} strokeWidth={2.6} />
            <path d="M-3-14.5 1-19.5 4-13.5Z" fill="#3f8fe0" {...EDGE} strokeWidth={2.6} />
            <circle cx="-8" cy="-10" r="1.8" fill={INK} />
          </g>
          <g className={on("shrimp")}>
            <path d="M-9-3C-13-13-4-21 5-17 12-14 12-6 6-3" fill="none" stroke={INK} strokeWidth="11.5" strokeLinecap="round" />
            <path d="M-9-3C-13-13-4-21 5-17 12-14 12-6 6-3" fill="none" stroke="#ff8f70" strokeWidth="6" strokeLinecap="round" />
            <path d="M-6.5-15.5l3 3M0-19.5l1 4.3M6.5-16l-2 3.4" fill="none" stroke="#e5624a" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M4-1l7 2.4-1-7.4Z" fill="#e5624a" {...EDGE} strokeWidth={2.4} />
            <circle cx="-9" cy="-4" r="1.3" fill={INK} />
          </g>
          <g className={on("drumstick")}>
            <path d="M-1-9-8-2.5" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
            <path d="M-1-9-8-2.5" fill="none" stroke={CREAM} strokeWidth="3.6" strokeLinecap="round" />
            <circle cx="-10.5" cy="-3.6" r="2.6" fill={CREAM} {...EDGE} strokeWidth={2.2} />
            <circle cx="-7.6" cy="-1.3" r="2.6" fill={CREAM} {...EDGE} strokeWidth={2.2} />
            <ellipse cx="3" cy="-14" rx="10.5" ry="8.6" transform="rotate(-28 3 -14)" fill="#d98a3d" {...EDGE} strokeWidth={2.6} />
            <ellipse cx="0" cy="-17" rx="4.5" ry="2.4" transform="rotate(-28 0 -17)" fill="#fff" opacity=".35" />
          </g>
        </g>
        <path
          className="cat-twinkle"
          d="M14-35l1.4 4.2 4.2 1.4-4.2 1.4-1.4 4.2-1.4-4.2-4.2-1.4 4.2-1.4Z"
        />
      </g>

      {/* The box stays put while the cat moves inside it, so its white edge does too. */}
      <g filter="url(#cat-lift)">
        <rect x="34" y="88" width="92" height="38" rx="3" {...DIE} />
        <rect x="30" y="82" width="100" height="10" rx="3" {...DIE} />
        <path d="M30 88L18 80L24 70L40 84Z" {...DIE} />
        <path d="M130 88L142 80L136 70L120 84Z" {...DIE} />
      </g>

      <g className="cat-body">
        <g ref={lookRef} className="cat-look">
          <g className="cat-tail">
            <g filter="url(#cat-lift)">
              <path d={TAIL} fill="none" stroke="#fff" strokeWidth="21" strokeLinecap="round" />
            </g>
            <path d={TAIL} fill="none" stroke={INK} strokeWidth="15" strokeLinecap="round" />
            <path d={TAIL} fill="none" stroke={ORANGE} strokeWidth="7.5" strokeLinecap="round" />
            <path d={TAIL} fill="none" stroke={STRIPE} strokeWidth="7.5" strokeDasharray="3 9" strokeDashoffset="-4" />
          </g>
          <g transform="translate(0 8)">
            <g filter="url(#cat-lift)">
              <ellipse cx="79" cy="58" rx="42" ry="36" {...DIE} />
            </g>
            <g className="cat-ear l">
              <path d={EAR_L} {...DIE} />
              <path d={EAR_L} fill={ORANGE} {...EDGE} strokeWidth={4} />
              <path d={EAR_L_INNER} fill={PINK} />
            </g>
            <g className="cat-ear r">
              <path d={EAR_R} {...DIE} />
              <path d={EAR_R} fill={ORANGE} {...EDGE} strokeWidth={4} />
              <path d={EAR_R_INNER} fill={PINK} />
            </g>
            <ellipse cx="79" cy="58" rx="42" ry="36" fill={ORANGE} />
            <path d={FACE} fill={CREAM} />
            <ellipse cx="79" cy="58" rx="42" ry="36" fill="none" {...EDGE} strokeWidth={4} />
            <path d="M79 24v9M70 26l2.5 7M88 26l-2.5 7" fill="none" stroke={STRIPE} strokeWidth="4" strokeLinecap="round" />
            <g className="cat-cheek l">
              <ellipse cx="50" cy="73" rx="12" ry="10" fill={CREAM} {...EDGE} strokeWidth={3.4} />
            </g>
            <g className="cat-cheek r">
              <ellipse cx="108" cy="73" rx="12" ry="10" fill={CREAM} {...EDGE} strokeWidth={3.4} />
            </g>
            <ellipse cx="50" cy="70" rx="8" ry="5" fill={PINK} opacity=".85" />
            <ellipse cx="108" cy="70" rx="8" ry="5" fill={PINK} opacity=".85" />
            {asleep ? (
              <path
                className="cat-closed"
                d="M55 53q7 6 14 0M89 53q7 6 14 0"
                fill="none"
                stroke={INK}
                strokeWidth="3"
                strokeLinecap="round"
              />
            ) : (
              <>
                <Eye cx={62} index={0} eyeRefs={eyeRefs} sparkleRefs={sparkleRefs} />
                <Eye cx={96} index={1} eyeRefs={eyeRefs} sparkleRefs={sparkleRefs} />
              </>
            )}
            <path className="cat-nose" d="M75.5 62.4h7l-3.5 4.2Z" fill="#ff6f8f" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
            <path
              d="M79 66.6v2.4M79 69Q75.5 73 71.5 69.5M79 69Q82.5 73 86.5 69.5"
              fill="none"
              stroke={INK}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <ellipse className="cat-yawn" cx="79" cy="71" rx="4.2" ry="5" fill="#7a3b3a" stroke={INK} strokeWidth="2" />
            <path
              d="M50 66 36 62M50 72 34 73M108 66 122 62M108 72 124 73"
              fill="none"
              stroke={INK}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <g className="cat-crumbs" fill="#d8c3a0">
              <circle cx="77" cy="72" r="1.5" style={{ "--cx": "-9px" } as CSSProperties} />
              <circle cx="81" cy="72" r="1.3" style={{ "--cx": "8px" } as CSSProperties} />
              <circle cx="75" cy="74" r="1.1" style={{ "--cx": "-4px" } as CSSProperties} />
              <circle cx="83" cy="73" r="1.3" style={{ "--cx": "11px" } as CSSProperties} />
            </g>
            {headwear && <HeadwearArt kind={headwear} />}
          </g>
        </g>
      </g>

      <path d="M30 88L18 80L24 70L40 84Z" fill="#b98748" {...EDGE} />
      <path d="M130 88L142 80L136 70L120 84Z" fill="#b98748" {...EDGE} />
      <rect x="34" y="88" width="92" height="38" rx="3" fill="#c99a5b" {...EDGE} strokeWidth={4} />
      <rect x="70" y="92" width="20" height="34" fill="#ecd9a8" opacity=".85" />
      <path d="M100 118l7-10 7 10zM107 116v-7" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M40 100h22M40 106h16M40 112h20" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <rect x="30" y="82" width="100" height="10" rx="3" fill="#d8ab6a" {...EDGE} />

      <g className="cat-paws" fill={CREAM} stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <ellipse cx="54" cy="84" rx="10" ry="7" />
        <ellipse cx="104" cy="84" rx="10" ry="7" />
        <path d="M50 81v5M54 80v6M58 81v5M100 81v5M104 80v6M108 81v5" fill="none" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {held && (
        <g transform={held === "laptop" ? "translate(18.4 46.4) scale(.78)" : "translate(16.8 34.8) scale(.8) rotate(-6 79 91.5)"}>
          <HeldArt kind={held} />
        </g>
      )}

      <g className="cat-zzz" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M118 36h7l-7 8h7" />
        <path d="M131 22h9l-9 10h9" />
        <path d="M146 5h11l-11 12h11" />
      </g>
      <g className="cat-sparks">
        <path d="M26 20l1.6 4.4 4.4 1.6-4.4 1.6L26 32l-1.6-4.4-4.4-1.6 4.4-1.6Z" />
        <path d="M136 40l1.2 3.4 3.4 1.2-3.4 1.2-1.2 3.4-1.2-3.4-3.4-1.2 3.4-1.2Z" />
        <path d="M12 46l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1Z" />
      </g>
    </svg>
  );
}
