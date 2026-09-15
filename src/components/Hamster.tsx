"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { site } from "@/data/content";
import { CHEEK_CAPACITY, cheekLevel, isAsleep, isStashFeed } from "@/lib/hamsterCount";
import { useActiveSection } from "@/lib/useActiveSection";
import { feedHamster, useHamsterCount } from "@/lib/useHamsterCount";

const TREATS = ["seed", "strawberry", "blueberry"] as const;
const CHEW_MS = 1200;
const DROP_MS = 680;
const YAWN_MS = 900;
const STASH_MS = 1800;
/** Feeds are at least this far apart, even when a key is held or motion is reduced. */
const MIN_FEED_GAP_MS = 400;
/** How often to re-check the clock and the idle timer for sleep. */
const SLEEP_CHECK_MS = 5_000;

/** The SVG's viewBox width, for turning screen pixels into SVG units. */
const VIEWBOX_WIDTH = 180;
/** Midpoint between the eyes, in viewBox coordinates. */
const FACE_X = 79;
const FACE_Y = 50;
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
 * A hamster in the bottom-left corner that eats when clicked and shows how many
 * times it was fed today. The count lives only in the visitor's browser, per
 * local calendar day. It renders after mount because the server can't know
 * what's in localStorage or the visitor's clock, and a guess would flash on
 * hydration.
 *
 * Its day: each feed puffs its cheeks, and the fifth sends it off to stash the
 * food. Between 23:00 and 06:00 it sleeps; a click wakes it with a yawn, and it
 * stays up while the visitor is active on the page.
 *
 * It also watches the cursor: its eyes follow it anywhere on the page, its body
 * leans gently after it, and it gets excited when the cursor comes close. With
 * no cursor it glances around on its own. All of that is off under reduced
 * motion.
 */
export function Hamster() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const count = useHamsterCount();
  const [treat, setTreat] = useState(0);
  const [eating, setEating] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [full, setFull] = useState(false);
  const [asleep, setAsleep] = useState(false);
  const [yawning, setYawning] = useState(false);
  const [stashing, setStashing] = useState(false);
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

  // Sleep follows the visitor's clock. Activity only keeps an awake hamster
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
        button.classList.remove("hm-excited");
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
      button.classList.toggle("hm-excited", distance < EXCITED_WITHIN && !asleepRef.current);
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
      button.classList.remove("hm-excited");
    };
  }, [mounted, reduce]);

  // One thing at a time: clicks while it yawns, chews or stashes are ignored.
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
    const next = feedHamster();
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
      if (!isStashFeed(next)) return serveNext();
      // Full cheeks: off to stash the food, back with them empty.
      setStashing(true);
      later(() => {
        setStashing(false);
        serveNext();
      }, STASH_MS);
    }, CHEW_MS);
  }

  if (!mounted) return null;

  const unit = count === 1 ? "time" : "times";
  // The count already reads empty on the fifth feed; keep the cheeks stuffed until it has stashed.
  const cheeks = stashing || (eating && isStashFeed(count)) ? CHEEK_CAPACITY : cheekLevel(count);
  // One thing on its head: sleep beats the section, and the section beats the theme.
  const headwear: Headwear | null = asleep
    ? "nightcap"
    : section === "experience"
      ? "hardhat"
      : resolvedTheme === "light"
        ? "sunglasses"
        : null;
  // Its paws are busy with food while eating, and empty while asleep or off stashing.
  const held: Held | null =
    asleep || yawning || eating || stashing
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
    stashing && "stashing",
    thrilled && !asleep && !stashing && "thrilled",
    held && "holding",
  ].filter(Boolean);

  return (
    <div className="hamster-dock">
      <p className="hamster-fed" aria-live="polite">
        <HeartIcon />
        Fed{" "}
        <b key={feeds} className={feeds ? "bump" : undefined}>
          {count.toLocaleString("en-IN")}
        </b>{" "}
        {unit} today
        {feeds > 0 && (
          <span key={`plus-${feeds}`} className="hamster-plus" aria-hidden>
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
        aria-label={`${asleep ? "Wake and feed" : "Feed"} the hamster. Fed ${count} ${unit} today.`}
        className={["hamster", ...states].join(" ")}
        style={{ "--hm-cheeks": cheeks } as CSSProperties}
      >
        <HamsterArt
          svgRef={svgRef}
          lookRef={lookRef}
          eyeRefs={eyeRefs}
          sparkleRefs={sparkleRefs}
          treat={treat}
          dropping={dropping}
          hideTreat={full || asleep || stashing}
          asleep={asleep}
          headwear={headwear}
          held={held}
        />
        {hearts.map((h) => (
          <span
            key={h.id}
            className="hamster-heart"
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
    <g className="hm-eye">
      <g
        ref={(el) => {
          eyeRefs.current[index] = el;
        }}
      >
        <ellipse cx={cx} cy="50" rx="6.3" ry="7.2" fill="#2a1b16" />
        <g
          ref={(el) => {
            sparkleRefs.current[index] = el;
          }}
        >
          <circle cx={cx + 2.4} cy="46.8" r="2.5" fill="#fff" />
          <circle cx={cx - 1.8} cy="53.4" r="1.1" fill="#fff" opacity=".85" />
        </g>
      </g>
    </g>
  );
}

/** On its head. Sunglasses sit pushed up, clear of the eyes the visitor is watching. */
function HeadwearArt({ kind }: { kind: Headwear }) {
  if (kind === "nightcap") {
    return (
      <g className="hm-headwear">
        <path className="hm-cap" d="M47 33C52 13 93 3 113 23L141 12C132 26 121 33 111 34Z" />
        <path d="M45 34Q79 18 114 33L114 38Q79 24 45 40Z" fill="#fff4e6" />
        <circle cx="142" cy="12" r="5.5" fill="#fff4e6" />
      </g>
    );
  }
  if (kind === "hardhat") {
    return (
      <g className="hm-headwear">
        <path className="hm-hat" d="M51 32Q52 6 79 5Q106 6 107 32Z" />
        <path className="hm-hat-ridge" d="M79 6V31" strokeWidth="3" />
        <rect className="hm-hat-brim" x="42" y="29" width="74" height="6.5" rx="3.2" />
      </g>
    );
  }
  return (
    <g className="hm-headwear">
      <rect x="54" y="23" width="21" height="11" rx="5.5" fill="#222a35" />
      <rect x="83" y="23" width="21" height="11" rx="5.5" fill="#222a35" />
      <path d="M75 27.5q4-3 8 0" fill="none" stroke="#222a35" strokeWidth="2.2" />
      <rect x="57.5" y="25.3" width="7" height="2.4" rx="1.2" fill="#fff" opacity=".45" />
      <rect x="86.5" y="25.3" width="7" height="2.4" rx="1.2" fill="#fff" opacity=".45" />
    </g>
  );
}

/** In its paws: a laptop on Skills, an envelope on Contact. */
function HeldArt({ kind }: { kind: Held }) {
  if (kind === "laptop") {
    return (
      <g className="hm-held">
        <rect x="55" y="68" width="48" height="29" rx="3" fill="#2d3440" />
        <rect className="hm-screen" x="59" y="72" width="40" height="21" rx="2" />
        <path d="M64 78h9M64 82h17M64 86h7" stroke="#e9fffb" strokeWidth="1.7" strokeLinecap="round" opacity=".85" />
        <path d="M49 97h60l-4 5H53z" fill="#434c5a" />
      </g>
    );
  }
  return (
    <g className="hm-held">
      <rect x="56" y="77" width="46" height="29" rx="3" fill="#fff4e6" stroke="#dccab0" strokeWidth="1.2" />
      <path d="M56.6 78.5 79 93l22.4-14.5" fill="none" stroke="#dccab0" strokeWidth="1.5" />
      <path
        className="hm-seal"
        d="M79 91.5c-1.8-2.6-6.2-1.8-5.3 1.6.8 2.7 5.3 4.7 5.3 4.7s4.5-2 5.3-4.7c.9-3.4-3.5-4.2-5.3-1.6z"
      />
    </g>
  );
}

function HamsterArt({
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
      <ellipse className="hm-shadow" cx="80" cy="121" rx="58" ry="5" />
      <ellipse className="hm-shadow" cx="150" cy="121" rx="12" ry="2.6" />

      <g transform="translate(150 119)">
        <g
          className={`hm-treat${dropping ? " drop" : ""}`}
          style={hideTreat ? { opacity: 0 } : undefined}
        >
          <g className={on("seed")}>
            <path
              className="hm-shell"
              d="M0-22C5.4-22 7.5-13 7-6.5 6.5-1 3.3 1 0 1-3.3 1-6.5-1-7-6.5-7.5-13-5.4-22 0-22Z"
            />
            <path
              d="M-2.6-18.3C-4-12-3.7-5.8-2.1-1.3M2.6-18.3C4-12 3.7-5.8 2.1-1.3"
              fill="none"
              stroke="#efe6d6"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
          <g className={on("strawberry")}>
            <path
              d="M0 1C-9-2-12.5-10-11.5-15.5-10.5-21.5-3.5-22.5 0-19.5 3.5-22.5 10.5-21.5 11.5-15.5 12.5-10 9-2 0 1Z"
              fill="#f2546b"
            />
            <path d="M-7.5-19.5-2.5-17.5 0-24 2.5-17.5 7.5-19.5 3.5-15.2-3.5-15.2Z" fill="#46b36a" />
            <g fill="#ffe28a">
              <ellipse cx="-5" cy="-12" rx=".9" ry="1.3" />
              <ellipse cx="0" cy="-9" rx=".9" ry="1.3" />
              <ellipse cx="5" cy="-12" rx=".9" ry="1.3" />
              <ellipse cx="-2.6" cy="-4.5" rx=".9" ry="1.3" />
              <ellipse cx="2.6" cy="-4.5" rx=".9" ry="1.3" />
              <ellipse cx="0" cy="-14.5" rx=".9" ry="1.3" />
            </g>
            <ellipse cx="-5.5" cy="-15" rx="1.8" ry="3" fill="#fff" opacity=".35" />
          </g>
          <g className={on("blueberry")}>
            <circle cx="0" cy="-9.5" r="9.5" fill="#5a6ee6" />
            <path d="M-2.8-17.6 0-15.2 2.8-17.6 2.3-14.3-2.3-14.3Z" fill="#323e9e" />
            <circle cx="-3.6" cy="-12.6" r="2.4" fill="#fff" opacity=".38" />
          </g>
        </g>
        <path
          className="hm-twinkle"
          d="M14-35l1.4 4.2 4.2 1.4-4.2 1.4-1.4 4.2-1.4-4.2-4.2-1.4 4.2-1.4Z"
        />
      </g>

      <g className="hm-body">
        <g ref={lookRef} className="hm-look">
          <ellipse className="hm-tail" cx="126" cy="104" rx="8" ry="5.5" fill="#dd8a44" />
          <g className="hm-ear l">
            <circle cx="49" cy="31" r="12.5" fill="#f0a45c" />
            <circle cx="49" cy="32" r="7.2" fill="#f7b1c1" />
          </g>
          <g className="hm-ear r">
            <circle cx="109" cy="31" r="12.5" fill="#f0a45c" />
            <circle cx="109" cy="32" r="7.2" fill="#f7b1c1" />
          </g>
          <ellipse cx="79" cy="89" rx="48" ry="31" fill="#f0a45c" />
          <ellipse cx="79" cy="58" rx="42" ry="36" fill="#f0a45c" />
          <path d="M69 25Q74 13 79 23Q83 14 90 25Z" fill="#f0a45c" />
          <ellipse
            cx="64"
            cy="36"
            rx="10"
            ry="4.5"
            transform="rotate(-18 64 36)"
            fill="#f8c48e"
            opacity=".7"
          />
          <path
            d="M38 67C38 53 52 49 62 57C70 51 88 51 96 57C106 49 120 53 120 67C122 88 118 117 79 118C40 117 36 88 38 67Z"
            fill="#fff4e6"
          />
          <g className="hm-cheek l">
            <ellipse cx="50" cy="72" rx="13" ry="11.5" fill="#fff4e6" />
            <ellipse cx="52" cy="67" rx="7" ry="4.2" fill="#ff9db3" opacity=".7" />
          </g>
          <g className="hm-cheek r">
            <ellipse cx="108" cy="72" rx="13" ry="11.5" fill="#fff4e6" />
            <ellipse cx="106" cy="67" rx="7" ry="4.2" fill="#ff9db3" opacity=".7" />
          </g>
          {asleep ? (
            <path
              className="hm-closed"
              d="M55 51q7 6 14 0M89 51q7 6 14 0"
              fill="none"
              stroke="#2a1b16"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          ) : (
            <>
              <Eye cx={62} index={0} eyeRefs={eyeRefs} sparkleRefs={sparkleRefs} />
              <Eye cx={96} index={1} eyeRefs={eyeRefs} sparkleRefs={sparkleRefs} />
            </>
          )}
          <path className="hm-nose" d="M76.4 59.6Q79 57.2 81.6 59.6Q79 63.2 76.4 59.6Z" fill="#ee7f95" />
          <path
            d="M74.6 64Q76.8 67 79 64Q81.2 67 83.4 64"
            fill="none"
            stroke="#7a4b3a"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <ellipse className="hm-yawn" cx="79" cy="67" rx="3.4" ry="4.4" fill="#7a3b3a" />
          <path
            d="M57 63l-15-2.5M57 66.5l-15 2M101 63l15-2.5M101 66.5l15 2"
            fill="none"
            stroke="#c98b5e"
            strokeWidth="1"
            strokeLinecap="round"
            opacity=".4"
          />
          <g className="hm-crumbs" fill="#d8c3a0">
            <circle cx="77" cy="70" r="1.4" style={{ "--cx": "-9px" } as CSSProperties} />
            <circle cx="81" cy="70" r="1.2" style={{ "--cx": "8px" } as CSSProperties} />
            <circle cx="75" cy="72" r="1" style={{ "--cx": "-4px" } as CSSProperties} />
            <circle cx="83" cy="71" r="1.2" style={{ "--cx": "11px" } as CSSProperties} />
          </g>
          {headwear && <HeadwearArt kind={headwear} />}
          {held && <HeldArt kind={held} />}
          <g className="hm-paws" fill="#f7b8c2" stroke="#e99aaa" strokeWidth=".8">
            <ellipse cx="70" cy="88" rx="6.8" ry="5.2" />
            <ellipse cx="88" cy="88" rx="6.8" ry="5.2" />
          </g>
        </g>
      </g>
      <ellipse cx="60" cy="118" rx="9.5" ry="4.6" fill="#f5a9b8" />
      <ellipse cx="98" cy="118" rx="9.5" ry="4.6" fill="#f5a9b8" />
      <g className="hm-zzz" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M118 36h7l-7 8h7" />
        <path d="M131 22h9l-9 10h9" />
        <path d="M146 5h11l-11 12h11" />
      </g>
      <g className="hm-sparks">
        <path d="M26 20l1.6 4.4 4.4 1.6-4.4 1.6L26 32l-1.6-4.4-4.4-1.6 4.4-1.6Z" />
        <path d="M136 40l1.2 3.4 3.4 1.2-3.4 1.2-1.2 3.4-1.2-3.4-3.4-1.2 3.4-1.2Z" />
        <path d="M16 64l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1Z" />
      </g>
    </svg>
  );
}
