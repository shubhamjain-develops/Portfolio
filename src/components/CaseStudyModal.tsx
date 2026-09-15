"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { playful, type Project } from "@/data/content";
import { CloseIcon, ExternalIcon, GitHubIcon, LockIcon } from "./Icons";

type Props = {
  project: Project | null;
  onClose: () => void;
};

export function CaseStudyModal({ project, onClose }: Props) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState<"case" | "postmortem">("case");

  // Every case study opens in its normal view.
  useEffect(() => setView("case"), [project?.slug]);

  // Only projects whose problem was a production incident offer the postmortem view.
  const pm = playful.postmortem;
  const canPostmortem = !!project && pm.projects.includes(project.slug);
  const postmortem = canPostmortem && view === "postmortem";

  /* Escape to close, and keep Tab inside the dialog while it's open. */
  useEffect(() => {
    if (!project) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeRef.current?.focus(), 60);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
        >
          <motion.button
            type="button"
            aria-label="Close case study"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 cursor-default bg-bg/70 backdrop-blur-md"
          />

          <motion.div
            ref={panelRef}
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.985 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.99 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-line card-surface sm:rounded-2xl"
            style={{ boxShadow: "var(--shadow-lift)" }}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-6 py-5 backdrop-blur-xl sm:px-8">
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-accent">
                  {project.context}
                </p>
                <h3
                  id="case-study-title"
                  className="mt-1.5 text-[1.2rem] leading-snug sm:text-[1.35rem]"
                >
                  {project.title}
                </h3>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-dim transition-colors hover:border-accent hover:text-accent"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="px-6 py-7 sm:px-8">
              {canPostmortem && (
                <div
                  role="group"
                  aria-label={pm.label}
                  className="mb-6 inline-flex gap-1 rounded-lg border border-line bg-surface2 p-1"
                >
                  {(["case", "postmortem"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={view === option}
                      onClick={() => setView(option)}
                      className={`rounded-md px-3 py-1.5 font-mono text-[0.76rem] transition-colors ${
                        view === option ? "bg-surface text-ink shadow-sm" : "text-dim hover:text-ink"
                      }`}
                    >
                      {option === "case" ? pm.caseStudy : pm.postmortem}
                    </button>
                  ))}
                </div>
              )}

              {postmortem ? (
                // The same words as the case study, under postmortem headings:
                // Impact is the outcome, Root cause the problem, Fix what I did.
                <>
                  <Block title={pm.impact} first>
                    <Metrics project={project} />
                    <p className="mt-3 rounded-lg border-l-2 border-accent bg-accent/[0.06] px-4 py-3 text-[0.97rem] leading-relaxed">
                      {project.result}
                    </p>
                  </Block>

                  <Block title={pm.rootCause}>
                    <p className="text-[0.97rem] leading-relaxed text-dim">
                      {project.problem}
                    </p>
                  </Block>

                  <Block title={pm.fix}>
                    <ul className="space-y-3">
                      {project.approach.map((step, i) => (
                        <li
                          key={i}
                          className="relative pl-8 text-[0.95rem] leading-relaxed text-dim"
                        >
                          <span
                            aria-hidden
                            className="absolute left-0 top-[0.2em] grid h-[18px] w-[18px] place-items-center rounded border border-accent/50 bg-accent/[0.08] font-mono text-[0.68rem] font-semibold text-accent"
                          >
                            ✓
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </Block>
                </>
              ) : (
                <>
                  <Metrics project={project} />

                  <Block title="The problem">
                    <p className="text-[0.97rem] leading-relaxed text-dim">
                      {project.problem}
                    </p>
                  </Block>

                  <Block title="What I did">
                    <ul className="space-y-3">
                      {project.approach.map((step, i) => (
                        <li
                          key={i}
                          className="relative pl-7 text-[0.95rem] leading-relaxed text-dim"
                        >
                          <span className="absolute left-0 top-0 font-mono text-[0.78rem] text-accent/70">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </Block>

                  <Block title="Outcome">
                    <p className="rounded-lg border-l-2 border-accent bg-accent/[0.06] px-4 py-3 text-[0.97rem] leading-relaxed">
                      {project.result}
                    </p>
                  </Block>
                </>
              )}

              <div className="mt-7 flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-accent/25 bg-accent/[0.07] px-2.5 py-1 font-mono text-[0.72rem] text-accent"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {(project.repo || project.demo || project.confidential) && (
                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-6">
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2 text-[0.85rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                    >
                      <GitHubIcon /> View code
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2 text-[0.85rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                    >
                      <ExternalIcon /> Live site
                    </a>
                  )}
                  {project.confidential && !project.repo && (
                    <p className="inline-flex items-center gap-2 text-[0.82rem] text-faint">
                      <LockIcon /> Proprietary work — code isn&rsquo;t public, but
                      I&rsquo;m happy to walk through the design.
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Metrics({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
      {project.metrics.map((m) => (
        <div key={m.label} className="bg-surface2 px-4 py-3.5">
          <div className="font-mono text-[1.05rem] font-semibold text-accent">
            {m.value}
          </div>
          <div className="mt-0.5 text-[0.75rem] leading-tight text-faint">
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function Block({
  title,
  first,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={first ? undefined : "mt-7"}>
      <h4 className="font-mono text-[0.74rem] uppercase tracking-[0.14em] text-faint">
        {title}
      </h4>
      <div className="mt-3">{children}</div>
    </div>
  );
}
