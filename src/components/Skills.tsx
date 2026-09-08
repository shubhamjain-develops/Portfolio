"use client";

import { motion, useReducedMotion } from "framer-motion";
import { skills } from "@/data/content";
import { Reveal, StaggerGroup, staggerChild } from "./Reveal";
import {
  AngularIcon,
  AzureIcon,
  CSharpIcon,
  DockerIcon,
  DotNetIcon,
  GitIcon,
  GitHubIcon,
  PostgresIcon,
  RedisIcon,
  TypeScriptIcon,
} from "./Icons";

type SkillIcon = (props: { className?: string; size?: number }) => React.ReactElement;

/**
 * Only the flagship, unambiguously-recognisable technologies get an icon —
 * the rest of a group stays text-only rather than force an icon onto
 * abstract or compound skills (e.g. "Multi-Tenant Architecture") where an
 * icon wouldn't actually help scanability.
 */
const skillIcons: Record<string, SkillIcon> = {
  "C#": CSharpIcon,
  ".NET Core": DotNetIcon,
  PostgreSQL: PostgresIcon,
  Redis: RedisIcon,
  "GitHub Copilot": GitHubIcon,
  Azure: AzureIcon,
  Docker: DockerIcon,
  Git: GitIcon,
  Angular: AngularIcon,
  TypeScript: TypeScriptIcon,
};

export function Skills() {
  const reduce = useReducedMotion();

  return (
    <section id="skills" className="relative scroll-mt-20 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">Skills</p>
          <h2 className="mt-3 text-[clamp(1.65rem,3.6vw,2.35rem)] leading-[1.15]">
            What I build with
          </h2>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group) => (
            <motion.div
              key={group.title}
              variants={reduce ? undefined : staggerChild}
              className="group rounded-xl border border-line card-surface p-5 transition-colors duration-300 hover:border-accent/40"
            >
              <h3 className="font-mono text-[0.74rem] font-semibold uppercase tracking-[0.13em] text-accent">
                {group.title}
              </h3>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {group.items.map((item) => {
                  const Icon = skillIcons[item];
                  return (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface2 px-2.5 py-1 text-[0.8rem] text-dim transition-colors duration-200 hover:border-accent/40 hover:text-ink"
                    >
                      {Icon && <Icon size={13} className="shrink-0 text-faint" />}
                      {item}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
