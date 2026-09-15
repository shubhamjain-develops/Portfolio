import type { Job, Project, SkillGroup, playful, site } from "../data/content";

/*
 * The hero terminal's commands, as a pure function of the site's content.
 * Output is text parts, plus links whose href comes from content, and never
 * HTML: nothing a visitor types can become markup.
 */

export type Tone = "cmd" | "dim" | "strong";
export type Part = { text: string; tone?: Tone; href?: string; external?: boolean; download?: boolean };
export type Line = Part[];

export type TerminalData = {
  site: typeof site;
  experience: Job[];
  skills: SkillGroup[];
  projects: Project[];
  copy: (typeof playful)["terminal"];
  hamsterCount: number;
};

export type Result = { kind: "lines"; lines: Line[] } | { kind: "clear" };

/** Everything the → key can complete to. */
export const COMMANDS = [
  "help",
  "whoami",
  "experience",
  "experience --current",
  "skills",
  "skills | grep ",
  "projects",
  "contact",
  "resume",
  "hamster",
  "clear",
];

/** What → completes the typed text to: the longest prefix all matching commands share. */
export function complete(typed: string): string | null {
  const start = typed.toLowerCase();
  if (!start.trim()) return null;
  const matches = COMMANDS.filter((command) => command.startsWith(start) && command !== start);
  if (!matches.length) return null;
  let shared = matches[0];
  for (const match of matches) {
    while (!match.startsWith(shared)) shared = shared.slice(0, -1);
  }
  return shared.length > start.length ? shared : null;
}

const lines = (rows: Line[]): Result => ({ kind: "lines", lines: rows });
const withoutScheme = (url: string) => url.replace(/^https?:\/\//, "");

export function thesisText(s: typeof site): string {
  return s.thesis.before + s.thesis.highlights.map((h) => h.value + h.after).join("");
}

export function runCommand(raw: string, data: TerminalData): Result {
  // Phones capitalise the first letter; commands match whatever the case.
  const command = raw.trim().replace(/\s+/g, " ").toLowerCase();
  const { site: s, copy } = data;

  switch (command) {
    case "help":
      return lines(copy.help.map(([name, what]) => [{ text: name.padEnd(24), tone: "strong" }, { text: what, tone: "dim" }]));
    case "whoami":
      return lines([[{ text: `${s.name} — ${s.role}`, tone: "strong" }], [{ text: thesisText(s) }]]);
    case "experience":
    case "experience --current": {
      const jobs = command === "experience" ? data.experience : data.experience.filter((job) => job.current);
      if (!jobs.length) return lines([[{ text: copy.noCurrentRole, tone: "dim" }]]);
      return lines(
        jobs.map((job) => [
          { text: job.period.padEnd(22), tone: "dim" },
          { text: job.title, tone: "strong" },
          { text: ` · ${job.company}` },
        ])
      );
    }
    case "skills":
      return lines(data.skills.map((group) => [{ text: `${group.title}: `, tone: "strong" }, { text: group.items.join(", ") }]));
    case "projects":
      return lines(data.projects.map((p) => [{ text: p.title, tone: "strong" }, { text: ` — ${p.tagline}`, tone: "dim" }]));
    case "contact": {
      const rows: Line[] = [
        [{ text: "email     ", tone: "dim" }, { text: s.email, tone: "strong", href: `mailto:${s.email}` }],
        [{ text: "linkedin  ", tone: "dim" }, { text: withoutScheme(s.linkedin), tone: "strong", href: s.linkedin, external: true }],
      ];
      if (s.github) {
        rows.push([{ text: "github    ", tone: "dim" }, { text: withoutScheme(s.github), tone: "strong", href: s.github, external: true }]);
      }
      return lines(rows);
    }
    case "resume":
      return lines([[{ text: "download  ", tone: "dim" }, { text: s.resumePath, tone: "strong", href: s.resumePath, download: true }]]);
    case "hamster": {
      const template = data.hamsterCount === 1 ? copy.hamsterFed.one : copy.hamsterFed.many;
      return lines([[{ text: template.replace("{n}", String(data.hamsterCount)) }]]);
    }
    case "clear":
      return { kind: "clear" };
  }

  // A plain substring match: what's typed is never turned into a RegExp.
  const grep = command.match(/^skills ?\| ?grep (.+)$/);
  if (grep) {
    const term = grep[1].trim();
    const hits = data.skills
      .map((group) => ({ title: group.title, items: group.items.filter((item) => item.toLowerCase().includes(term)) }))
      .filter((group) => group.items.length);
    if (!hits.length) return lines([[{ text: copy.noSkillMatch, tone: "dim" }]]);
    return lines(hits.map((group) => [{ text: `${group.title}: `, tone: "dim" }, { text: group.items.join(", "), tone: "strong" }]));
  }

  // Never repeat the input back in an error.
  return lines([[{ text: copy.notFound, tone: "dim" }]]);
}
