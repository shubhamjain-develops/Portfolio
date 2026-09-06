import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
  /** Adds the subtle blueprint grid behind the section. */
  patterned?: boolean;
  className?: string;
};

/** Shared section chrome so every heading block sits on the same rhythm. */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  patterned = false,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-20 py-20 sm:py-24 lg:py-28 ${className}`}
    >
      {patterned && (
        <div aria-hidden className="absolute inset-0 -z-10 grid-bg opacity-70" />
      )}
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 max-w-[24ch] text-[clamp(1.65rem,3.6vw,2.35rem)] leading-[1.15]">
            {title}
          </h2>
          {lead && (
            <p className="mt-4 max-w-[52ch] text-[1rem] text-dim">{lead}</p>
          )}
        </Reveal>
        <div className="mt-12 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}

export function Divider() {
  return (
    <div className="shell">
      <div className="rule-fade" />
    </div>
  );
}
