"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { projects, site, type Project } from "@/data/content";
import { SpotlightCard } from "./SpotlightCard";
import { CaseStudyModal } from "./CaseStudyModal";
import { StaggerGroup, staggerChild, Reveal } from "./Reveal";
import { ArrowIcon, GitHubIcon, LockIcon } from "./Icons";

export function Work() {
  const [selected, setSelected] = useState<Project | null>(null);
  const reduce = useReducedMotion();

  return (
    <section id="work" className="relative scroll-mt-20 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">Selected work</p>
          <h2 className="mt-3 text-[clamp(1.65rem,3.6vw,2.35rem)] leading-[1.15]">
            A few things worth a closer look
          </h2>
          <p className="mt-4 max-w-[54ch] text-[1rem] text-dim">
            Most of this ran in regulated environments, so the code isn&rsquo;t
            public. Open any card for the problem, the decisions and what
            actually came out the other side.
          </p>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <motion.div key={project.slug} variants={reduce ? undefined : staggerChild}>
              <SpotlightCard
                as="button"
                onClick={() => setSelected(project)}
                ariaLabel={`Open case study: ${project.title}`}
                className="h-full w-full cursor-pointer p-6 text-left sm:p-7"
              >
                <div className="flex h-full flex-col">
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.13em] text-faint">
                    {project.context}
                  </p>

                  <h3 className="mt-3 text-[1.1rem] leading-snug transition-colors duration-300 group-hover:text-accent">
                    {project.title}
                  </h3>

                  <p className="mt-2.5 text-[0.93rem] leading-relaxed text-dim">
                    {project.tagline}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                    {project.metrics.slice(0, 3).map((m) => (
                      <div key={m.label}>
                        <div className="font-mono text-[1.05rem] font-semibold text-accent">
                          {m.value}
                        </div>
                        <div className="text-[0.72rem] leading-tight text-faint">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {project.tech.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-line bg-surface2 px-2.5 py-[3px] font-mono text-[0.7rem] text-faint"
                      >
                        {t}
                      </span>
                    ))}
                    {project.tech.length > 3 && (
                      <span className="px-1 py-[3px] font-mono text-[0.7rem] text-faint">
                        +{project.tech.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <span className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-accent">
                      Read the case study
                      <span className="transition-transform duration-300 ease-smooth group-hover:translate-x-1">
                        <ArrowIcon size={15} />
                      </span>
                    </span>
                    {project.repo ? (
                      <span className="text-faint transition-colors group-hover:text-accent">
                        <GitHubIcon size={15} />
                      </span>
                    ) : (
                      project.confidential && (
                        <span
                          className="text-faint"
                          title="Proprietary — code not public"
                        >
                          <LockIcon size={14} />
                        </span>
                      )
                    )}
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </StaggerGroup>

        {site.github && (
          <Reveal delay={0.08}>
            <p className="mt-10 text-[0.92rem] text-dim">
              Side projects and experiments live on{" "}
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                GitHub
              </a>
              .
            </p>
          </Reveal>
        )}
      </div>

      <CaseStudyModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
