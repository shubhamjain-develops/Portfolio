"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { skillLinks, skills } from "@/data/content";
import { StaggerGroup, staggerChild } from "./Reveal";
import { SectionHeading } from "./Section";
import {
  AngularIcon,
  AngularJSIcon,
  AzureDevOpsIcon,
  AzureIcon,
  ClaudeIcon,
  Css3Icon,
  CSharpIcon,
  CursorIcon,
  DockerIcon,
  DotNetIcon,
  GitIcon,
  GitHubCopilotIcon,
  Html5Icon,
  JwtIcon,
  MongoDBIcon,
  MySQLIcon,
  PlaywrightIcon,
  PostgresIcon,
  RedisIcon,
  SwaggerIcon,
  TypeScriptIcon,
} from "./Icons";

type SkillIcon = (props: { className?: string; size?: number }) => React.ReactElement;

/**
 * Real logos only where one unambiguously exists — abstract or compound
 * skills (Multi-Tenant Architecture, Prompt Engineering, Rate Limiting...)
 * have no brand mark to show and stay text-only rather than force one.
 * Azure and .NET Core are reused for their sub-products (Azure OCR,
 * ASP.NET Core) since those are the same brand, not a separate mark.
 */
const skillIcons: Record<string, SkillIcon> = {
  "C#": CSharpIcon,
  ".NET Core": DotNetIcon,
  "ASP.NET Core": DotNetIcon,
  Swagger: SwaggerIcon,
  PostgreSQL: PostgresIcon,
  MySQL: MySQLIcon,
  MongoDB: MongoDBIcon,
  Redis: RedisIcon,
  "Claude Code": ClaudeIcon,
  "GitHub Copilot": GitHubCopilotIcon,
  "Cursor IDE": CursorIcon,
  Azure: AzureIcon,
  "Azure OCR": AzureIcon,
  "Azure DevOps": AzureDevOpsIcon,
  Docker: DockerIcon,
  Git: GitIcon,
  Angular: AngularIcon,
  AngularJS: AngularJSIcon,
  TypeScript: TypeScriptIcon,
  HTML: Html5Icon,
  CSS: Css3Icon,
  Playwright: PlaywrightIcon,
  JWT: JwtIcon,
};

const PILL =
  "rounded-md border border-line bg-surface2 text-[0.8rem] text-dim transition-[opacity,background-color,border-color,color] duration-200 hover:border-accent/40 hover:text-ink";

export function Skills() {
  const reduce = useReducedMotion();
  // Hovering a skill keeps the skills it is used with lit and dims the rest.
  const [active, setActive] = useState<string | null>(null);

  const partners = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const [a, b] of skillLinks) {
      if (!map.has(a)) map.set(a, new Set());
      if (!map.has(b)) map.set(b, new Set());
      map.get(a)!.add(b);
      map.get(b)!.add(a);
    }
    return map;
  }, []);

  const highlight = (item: string) => {
    if (!active) return "";
    if (item === active) return "!border-transparent !bg-accent !text-accent-ink";
    if (partners.get(active)?.has(item)) return "!border-accent/55 !bg-accent/10 !text-ink";
    return "opacity-35";
  };

  return (
    <section id="skills" className="relative scroll-mt-20 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <SectionHeading eyebrow="Skills" title="What I build with" />

        <div onPointerLeave={() => setActive(null)}>
          <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((group) => {
              const iconItems = group.items.filter((item) => skillIcons[item]);
              const plainItems = group.items.filter((item) => !skillIcons[item]);

              return (
                <motion.div
                  key={group.title}
                  variants={reduce ? undefined : staggerChild}
                  className="group rounded-xl border border-line card-surface p-5 transition-colors duration-300 hover:border-accent/40"
                >
                  <h3 className="font-mono text-[0.74rem] font-semibold uppercase tracking-[0.13em] text-accent">
                    {group.title}
                  </h3>

                  {iconItems.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {iconItems.map((item) => {
                        const Icon = skillIcons[item];
                        return (
                          <span
                            key={item}
                            onPointerEnter={() => setActive(item)}
                            className={`inline-flex items-center gap-1.5 py-1 pl-1.5 pr-2.5 ${PILL} ${highlight(item)}`}
                          >
                            <Icon size={16} className="shrink-0 opacity-80" />
                            {item}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {plainItems.length > 0 && (
                    <div
                      className={`flex flex-wrap gap-1.5 ${iconItems.length > 0 ? "mt-1.5 border-t border-dashed border-line/70 pt-3" : "mt-4"}`}
                    >
                      {plainItems.map((item) => (
                        <span
                          key={item}
                          onPointerEnter={() => setActive(item)}
                          className={`px-2.5 py-1 ${PILL} ${highlight(item)}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
