"use client";

import { education } from "@/data/content";
import { Reveal } from "./Reveal";

export function Education() {
  return (
    <section id="education" className="scroll-mt-20 pb-8 pt-20 sm:pt-24">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">Education &amp; certifications</p>
          <h2 className="mt-3 text-[clamp(1.65rem,3.6vw,2.35rem)] leading-[1.15]">
            Credentials
          </h2>
        </Reveal>

        <div className="mt-10">
          {education.map((item, i) => (
            <Reveal key={item.title} delay={0.05 * i}>
              <div className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-line py-5 transition-colors duration-300 hover:border-accent/40">
                <div>
                  <h3 className="text-[1rem] transition-colors duration-300 group-hover:text-accent">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[0.88rem] text-dim">
                    {item.org}
                    {item.detail && (
                      <span className="text-faint"> · {item.detail}</span>
                    )}
                  </p>
                </div>
                <span className="font-mono text-[0.78rem] text-faint">
                  {item.period}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
