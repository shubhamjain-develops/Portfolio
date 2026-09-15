"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { experience, playful, projects, site, skills } from "@/data/content";
import { complete, runCommand, type Line, type Part } from "@/lib/terminal";
import { useHamsterCount } from "@/lib/useHamsterCount";

/** Past this many rows the oldest output is dropped, so a long session can't grow without limit. */
const MAX_ROWS = 60;
const copy = playful.terminal;

const TONE: Record<NonNullable<Part["tone"]>, string> = {
  cmd: "text-accent",
  dim: "text-dim",
  strong: "font-semibold text-ink",
};

type Row = { id: number; line: Line };

/**
 * The hero's thesis card, as a terminal. The thesis stays pinned and is in the
 * server HTML, so a visitor who never types, or a crawler, reads exactly what
 * the card said before. At rest it adds only a prompt row, so the buttons below
 * barely move. Commands answer from content.ts only, into a log that opens on
 * the first command (never on page load) and then scrolls inside a fixed height.
 */
export function Terminal() {
  const hamsterCount = useHamsterCount();
  const [rows, setRows] = useState<Row[]>([]);
  const [value, setValue] = useState("");
  const [chip, setChip] = useState(0);
  const history = useRef<string[]>([]);
  const recall = useRef(-1);
  const nextId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [rows]);

  function run(raw: string) {
    const typed = raw.trim();
    if (!typed) return;
    history.current.unshift(typed);
    recall.current = -1;

    const result = runCommand(typed, { site, experience, skills, projects, copy, hamsterCount });
    if (result.kind === "clear") {
      setRows([]);
      return;
    }
    const added = [[{ text: `$ ${typed}`, tone: "cmd" } as Part], ...result.lines].map((line) => ({
      id: nextId.current++,
      line,
    }));
    setRows((prev) => [...prev, ...added].slice(-MAX_ROWS));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    run(value);
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const { selectionStart, selectionEnd } = e.currentTarget;
    // Tab keeps moving focus; → completes, but only with the caret at the end.
    if (e.key === "ArrowRight" && selectionStart === value.length && selectionEnd === value.length) {
      const completion = complete(value);
      if (completion) {
        e.preventDefault();
        setValue(completion);
      }
    } else if (e.key === "ArrowUp" && history.current.length) {
      e.preventDefault();
      recall.current = Math.min(recall.current + 1, history.current.length - 1);
      setValue(history.current[recall.current]);
    } else if (e.key === "ArrowDown" && recall.current >= 0) {
      e.preventDefault();
      recall.current -= 1;
      setValue(recall.current < 0 ? "" : history.current[recall.current]);
    }
  }

  // The example chips are one tab stop; arrow keys move between them.
  function onChipKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (chip + step + copy.examples.length) % copy.examples.length;
    setChip(next);
    chipRefs.current[next]?.focus();
  }

  return (
    <div
      data-no-burst
      className="relative mt-8 max-w-[38rem] overflow-hidden rounded-xl border border-line card-surface"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-accent to-accent-2" />

      <div className="px-5 pb-3 pl-6 pt-4">
        <p className="text-[0.98rem] leading-relaxed">
          {site.thesis.before}
          {site.thesis.highlights.map((h) => (
            <span key={h.value}>
              <strong className="font-mono font-semibold text-accent">{h.value}</strong>
              {h.after}
            </span>
          ))}
        </p>
      </div>

      <div
        ref={logRef}
        role="log"
        aria-label={copy.logLabel}
        tabIndex={rows.length ? 0 : -1}
        data-terminal-log
        className={`overflow-y-auto whitespace-pre-wrap break-words px-5 pl-6 font-mono text-[0.78rem] leading-[1.65] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
          rows.length ? "h-[5.9rem] border-t border-line py-2" : "h-0"
        }`}
      >
        {rows.map((row) => (
          <div key={row.id}>
            {row.line.map((part, i) => (
              <TerminalPart key={i} part={part} />
            ))}
          </div>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-line px-5 py-2 pl-6 font-mono focus-within:bg-accent/5"
      >
        <span aria-hidden className="text-[0.86rem] text-accent">
          $
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          maxLength={80}
          enterKeyHint="go"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={copy.placeholder}
          aria-label={copy.inputLabel}
          aria-describedby="terminal-hint"
          className="min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-dim focus:outline-none sm:text-[0.86rem]"
        />
        <span id="terminal-hint" className="sr-only">
          {copy.hint}
        </span>
      </form>

      {/* Tap-to-run examples, on phones only: typing there is the hard part. */}
      <div
        role="group"
        aria-label={copy.examplesLabel}
        onKeyDown={onChipKey}
        className="flex gap-1.5 overflow-x-auto border-t border-line px-5 py-2.5 pl-6 sm:hidden"
      >
        {copy.examples.map((example, i) => (
          <button
            key={example}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            type="button"
            tabIndex={i === chip ? 0 : -1}
            onClick={() => {
              setChip(i);
              run(example);
            }}
            className="shrink-0 whitespace-nowrap rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.72rem] text-dim transition-colors hover:border-accent/50 hover:text-ink"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}

function TerminalPart({ part }: { part: Part }) {
  const tone = part.tone ? TONE[part.tone] : "";
  if (!part.href) return <span className={tone}>{part.text}</span>;
  return (
    <a
      href={part.href}
      className={`${tone} underline decoration-dotted underline-offset-2 transition-colors hover:text-accent`}
      {...(part.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(part.download ? { download: true } : {})}
    >
      {part.text}
    </a>
  );
}
