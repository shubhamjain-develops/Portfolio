"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { HAMSTER_KEY, localDay, readCount, recordFeed } from "@/lib/hamsterCount";

const TREATS = ["seed", "strawberry", "blueberry"] as const;
const CHEW_MS = 1200;
const DROP_MS = 680;

/** The SVG's viewBox width, for turning screen pixels into SVG units. */
const VIEWBOX_WIDTH = 180;
/** Eye centres in viewBox coordinates. */
const EYE_Y = 50;
const EYES_MID_X = 79;
/** How far (in SVG units) the eyes may move off-centre. */
const LOOK_X = 2.6;
const LOOK_Y = 2.2;
/** The cursor counts as "close" within this many screen pixels of the face. */
const EXCITED_WITHIN = 190;

type Heart = { id: number; x: number; r: number; delay: number };

function readStored(): string | null {
  try {
    return localStorage.getItem(HAMSTER_KEY);
  } catch {
    return null;
  }
}

/**
 * A hamster in the bottom-left corner that eats when clicked and shows how many
 * times it was fed today. The count lives only in the visitor's browser, per
 * local calendar day. It renders after mount because the server can't know
 * what's in localStorage, and a guessed count would flash on hydration.
 *
 * It also watches the cursor: its eyes follow it anywhere on the page, its body
 * leans toward it, and it gets excited when the cursor comes close. With no
 * cursor it glances around on its own. All of that is off under reduced motion.
 */
export function Hamster() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [treat, setTreat] = useState(0);
  const [eating, setEating] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [full, setFull] = useState(false);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [feeds, setFeeds] = useState(0);
  const busy = useRef(false);
  const day = useRef("");
  const timers = useRef<number[]>([]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lookRef = useRef<SVGGElement>(null);
  const eyeRefs = useRef<(SVGGElement | null)[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    const sync = () => {
      const today = localDay();
      if (today === day.current) return;
      day.current = today;
      const n = readCount(readStored(), today);
      setCount(n);
      setTreat(n % TREATS.length);
    };
    sync();
    setMounted(true);

    // A tab left open past midnight starts the new day at zero.
    const onVisible = () => {
      if (!document.hidden) sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    const tick = window.setInterval(sync, 60_000);
    const pending = timers.current;
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(tick);
      pending.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // Eyes and head follow the cursor. One rAF loop eases toward a target and
  // writes straight to the SVG, so pointer moves never re-render React.
  useEffect(() => {
    if (!mounted || reduce) return;
    const svg = svgRef.current;
    const button = buttonRef.current;
    if (!svg || !button) return;

    let pointer: { x: number; y: number } | null = null;
    let nextGlance = 0;
    let raf = 0;
    const target = { x: 0, y: 0, tilt: 0 };
    const eased = { x: 0, y: 0, tilt: 0 };

    const aim = (now: number) => {
      if (!pointer) {
        // No cursor (touch screen, or it left the window): glance around.
        button.classList.remove("hm-excited");
        if (now < nextGlance) return;
        const side = Math.floor(Math.random() * 3) - 1; // left, ahead or right
        target.x = side * LOOK_X * 0.8;
        target.y = (Math.random() - 0.5) * LOOK_Y;
        target.tilt = side * 3;
        nextGlance = now + 1400 + Math.random() * 1600;
        return;
      }
      const rect = svg.getBoundingClientRect();
      const scale = rect.width / VIEWBOX_WIDTH;
      const dx = pointer.x - (rect.left + EYES_MID_X * scale);
      const dy = pointer.y - (rect.top + EYE_Y * scale);
      const distance = Math.hypot(dx, dy) || 1;
      // Fully sideways once the cursor is ~120px away; centred when on the face.
      const reach = Math.min(1, distance / 120);
      target.x = (dx / distance) * LOOK_X * reach;
      target.y = (dy / distance) * LOOK_Y * reach;
      target.tilt = Math.max(-7, Math.min(7, dx / 45));
      button.classList.toggle("hm-excited", distance < EXCITED_WITHIN);
    };

    const frame = (now: number) => {
      aim(now);
      eased.x += (target.x - eased.x) * 0.2;
      eased.y += (target.y - eased.y) * 0.2;
      eased.tilt += (target.tilt - eased.tilt) * 0.12;
      const shift = `translate(${eased.x.toFixed(2)} ${eased.y.toFixed(2)})`;
      for (const eye of eyeRefs.current) eye?.setAttribute("transform", shift);
      lookRef.current?.style.setProperty("transform", `rotate(${eased.tilt.toFixed(2)}deg)`);
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

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("mouseout", onLeaveWindow);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("mouseout", onLeaveWindow);
      button.classList.remove("hm-excited");
    };
  }, [mounted, reduce]);

  // One treat at a time: clicks while it is still chewing are ignored.
  function feed() {
    if (busy.current) return;
    busy.current = true;

    // If storage is blocked, keep counting in memory for this visit.
    const fallback = JSON.stringify({ day: day.current, count });
    const today = localDay();
    day.current = today;
    const next = recordFeed(readStored() ?? fallback, today);
    try {
      localStorage.setItem(HAMSTER_KEY, JSON.stringify(next));
    } catch {
      // Private mode or blocked storage: the count still shows for this visit.
    }
    setCount(next.count);
    setFeeds((f) => f + 1);

    if (reduce) {
      setFull(true);
      later(() => {
        setFull(false);
        setTreat(next.count % TREATS.length);
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
    later(() => {
      setEating(false);
      setTreat(next.count % TREATS.length);
      setDropping(true);
      later(() => {
        setDropping(false);
        busy.current = false;
      }, DROP_MS);
    }, CHEW_MS);
  }

  if (!mounted) return null;

  const unit = count === 1 ? "time" : "times";

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
        aria-label={`Feed the hamster. Fed ${count} ${unit} today.`}
        className={`hamster${eating ? " eating" : ""}${full ? " full" : ""}`}
      >
        <HamsterArt
          svgRef={svgRef}
          lookRef={lookRef}
          eyeRefs={eyeRefs}
          treat={treat}
          dropping={dropping}
          hideTreat={full}
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

function HamsterArt({
  svgRef,
  lookRef,
  eyeRefs,
  treat,
  dropping,
  hideTreat,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  lookRef: React.RefObject<SVGGElement | null>;
  eyeRefs: React.MutableRefObject<(SVGGElement | null)[]>;
  treat: number;
  dropping: boolean;
  hideTreat: boolean;
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
          <g className="hm-ear l">
            <circle cx="49" cy="31" r="12.5" fill="#f0a45c" />
            <circle cx="49" cy="32" r="7.2" fill="#f7b1c1" />
          </g>
          <g className="hm-ear r">
            <circle cx="109" cy="31" r="12.5" fill="#f0a45c" />
            <circle cx="109" cy="32" r="7.2" fill="#f7b1c1" />
          </g>
          <ellipse cx="79" cy="89" rx="48" ry="31" fill="#f0a45c" />
          <ellipse cx="79" cy="59" rx="42" ry="35" fill="#f0a45c" />
          <path d="M69 26Q74 14 79 24Q83 15 90 26Z" fill="#f0a45c" />
          <ellipse
            cx="64"
            cy="37"
            rx="10"
            ry="4.5"
            transform="rotate(-18 64 37)"
            fill="#f8c48e"
            opacity=".75"
          />
          <path
            d="M38 67C38 53 52 49 62 57C70 51 88 51 96 57C106 49 120 53 120 67C122 88 118 117 79 118C40 117 36 88 38 67Z"
            fill="#fff4e6"
          />
          <g className="hm-cheek l">
            <ellipse cx="50" cy="72" rx="12" ry="11" fill="#fff4e6" />
            <ellipse cx="52" cy="67" rx="7" ry="4.2" fill="#ff9db3" opacity=".65" />
          </g>
          <g className="hm-cheek r">
            <ellipse cx="108" cy="72" rx="12" ry="11" fill="#fff4e6" />
            <ellipse cx="106" cy="67" rx="7" ry="4.2" fill="#ff9db3" opacity=".65" />
          </g>
          <g className="hm-eye">
            <g
              ref={(el) => {
                eyeRefs.current[0] = el;
              }}
            >
              <ellipse cx="62" cy="50" rx="6.3" ry="7.2" fill="#2a1b16" />
              <circle cx="64.4" cy="46.8" r="2.5" fill="#fff" />
              <circle cx="60.2" cy="53.4" r="1.1" fill="#fff" opacity=".85" />
            </g>
          </g>
          <g className="hm-eye">
            <g
              ref={(el) => {
                eyeRefs.current[1] = el;
              }}
            >
              <ellipse cx="96" cy="50" rx="6.3" ry="7.2" fill="#2a1b16" />
              <circle cx="98.4" cy="46.8" r="2.5" fill="#fff" />
              <circle cx="94.2" cy="53.4" r="1.1" fill="#fff" opacity=".85" />
            </g>
          </g>
          <path className="hm-nose" d="M76.4 59.6Q79 57.2 81.6 59.6Q79 63.2 76.4 59.6Z" fill="#ee7f95" />
          <path
            d="M74.6 64Q76.8 67 79 64Q81.2 67 83.4 64"
            fill="none"
            stroke="#7a4b3a"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
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
          <g className="hm-paws" fill="#f7b8c2" stroke="#e99aaa" strokeWidth=".8">
            <ellipse cx="70" cy="88" rx="6.8" ry="5.2" />
            <ellipse cx="88" cy="88" rx="6.8" ry="5.2" />
          </g>
        </g>
      </g>
      <ellipse cx="60" cy="118" rx="9.5" ry="4.6" fill="#f5a9b8" />
      <ellipse cx="98" cy="118" rx="9.5" ry="4.6" fill="#f5a9b8" />
    </svg>
  );
}
