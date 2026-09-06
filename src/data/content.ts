/**
 * Every word on the site lives here.
 * Edit this file to change copy — you should never need to touch a component.
 */

export const site = {
  name: "Shubham Jain",
  initials: "SJ",
  role: "Backend & Distributed Systems Engineer",
  location: "Bengaluru, India",
  availability: "Open to remote",
  email: "shubhamjainiiitb@gmail.com",
  phone: "+91 94069 00025",
  phoneHref: "tel:+919406900025",
  linkedin: "https://linkedin.com/in/shubham-jain-developer",

  /** Set to "" to hide every GitHub link on the site. */
  github: "https://github.com/shubhamjain-develops",

  /** This site's own repo — linked in the footer as a quiet "the source is here". */
  repo: "https://github.com/shubhamjain-develops/Portfolio",

  /** Update after your first Vercel deploy — used for OpenGraph + sitemap. */
  url: "https://shubhamjain.dev",

  resumePath: "/Shubham_Jain_Resume.pdf",

  intro:
    "Full-stack engineer with five years across statewide government infrastructure and early-stage startup engineering — specialising in .NET, PostgreSQL and distributed systems, and in directing AI coding agents inside a human-in-the-loop workflow.",

  /** The one line a recruiter should remember. */
  thesis: {
    before: "Led backend architecture for a platform serving ",
    highlights: [
      { value: "69M+ residents", after: " — cut API latency " },
      { value: "70%", after: " and held " },
      { value: "zero major incidents", after: " across a 15M-request-a-day system." },
    ],
  },
} as const;

export const nav = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

export type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
};

export const stats: Stat[] = [
  { value: 5, suffix: "+", label: "Years in production systems" },
  { value: 69, suffix: "M+", label: "Residents served on Kaveri 2.0" },
  { value: 15, suffix: "M+", label: "Daily API requests handled" },
  { value: 900, suffix: "K+", label: "Monthly active users secured" },
];

export const about = {
  heading: "Systems that hold up under real constraints",
  paragraphs: [
    "I work on the boundary between “it works” and “it works at scale.” Over the past five years that has meant architecting the backend for a statewide property-registration platform used by 69 million residents, rebuilding multi-tenant data isolation with real guarantees behind it, and — as a founding engineer at an AI-native healthcare startup — directing AI coding agents inside a structured, human-supervised workflow rather than either avoiding them or handing them the keys.",
    "The through-line is ownership. On Kaveri 2.0 I led a team of four with end-to-end responsibility for critical microservices carrying ₹20,000+ crore in annual government revenue. At Synexar I own requirements, architecture and validation while agents do the typing — which turns out to demand more engineering judgement, not less.",
    "I like problems with constraints that bite: regulatory requirements, data nobody can afford to lose, and traffic that doesn't ask permission before it spikes.",
  ],
};

/** Small card under the stats — the thing a recruiter is actually scanning for. */
export const availability = {
  title: "Currently",
  status: "Open to new roles",
  lines: [
    "Backend, full-stack and platform engineering roles.",
    "Remote, or Bengaluru on-site / hybrid.",
    "Happy to talk through architecture in a first call.",
  ],
};

export type Job = {
  title: string;
  company: string;
  companyUrl?: string;
  location: string;
  period: string;
  current?: boolean;
  summary: string;
  points: string[];
  tech: string[];
};

export const experience: Job[] = [
  {
    title: "Founding Software Engineer",
    company: "Synexar, Inc.",
    location: "Bengaluru — Remote",
    period: "May 2026 — Present",
    current: true,
    summary:
      "Full-stack ownership at an AI-native healthcare startup, working inside a human + AI agentic engineering model.",
    points: [
      "Build and ship full-stack features end to end — SSO login optimisation, centralised audit logging and reusable UI components — spanning backend APIs, frontend and database engineering.",
      "Direct AI coding agents through development, debugging, refactoring and testing while owning technical direction, requirements, architecture and validation myself.",
      "Helped design a structured AI-agent workflow covering change-impact analysis, implementation and local verification, measurably improving the reliability of agent-driven development.",
      "Delivered and stabilised the hospital front-office intake flow, fixing data-persistence defects and integrating Azure OCR to read patient details from driving licences and insurance cards.",
      "Led the restructuring of the platform's multi-tenant architecture — redesigned master tenant tables and implemented PostgreSQL Row-Level Security for stronger data isolation.",
      "Built end-to-end Playwright coverage for post-deployment validation and automated regression verification.",
    ],
    tech: [".NET", "Angular", "PostgreSQL", "Azure", "Playwright"],
  },
  {
    title: "Software Engineer",
    company: "Center for Smart Governance",
    location: "Bengaluru, India",
    period: "Apr 2025 — Apr 2026",
    summary:
      "Backend architecture for Kaveri 2.0, the Government of Karnataka's statewide property-registration platform.",
    points: [
      "Architected and optimised backend microservices for a platform serving 69M+ residents and 15M+ daily API requests, achieving a 70% reduction in API latency and query execution time through schema redesign, indexing strategy and query optimisation.",
      "Designed idempotent, fault-tolerant REST APIs in .NET Core with transactional integrity for 9,000+ daily property registrations, supporting ₹20,000+ crore in annual government revenue.",
      "Implemented authentication and authorisation using JWT, RBAC, API keys, schema validation and Redis rate limiting — meeting compliance and auditability requirements for 40K DAU / 900K MAU.",
      "Built Azure DevOps CI/CD pipelines for automated deployment, testing and monitoring of high-availability microservices.",
      "Led a team of four with end-to-end ownership of multiple critical microservices — delivered on schedule with zero major incidents.",
    ],
    tech: [".NET Core", "PostgreSQL", "Redis", "Azure DevOps", "Microservices"],
  },
  {
    title: "Associate Software Engineer",
    company: "Center for Smart Governance",
    location: "Bengaluru, India",
    period: "Jun 2023 — Mar 2025",
    summary:
      "Core property-registration workflows, plus one internal product designed and shipped solo.",
    points: [
      "Developed .NET APIs and Angular applications for core registration workflows — reactive forms and lazy loading — for a 40,000 daily-active-user base.",
      "Single-handedly designed and launched an in-house 360° Feedback application with role-based authentication, enabling peer and upward feedback for 500+ users — work that earned two promotions.",
    ],
    tech: [".NET Core MVC", "Angular", "MySQL"],
  },
  {
    title: "Junior Software Engineer",
    company: "Center for Smart Governance",
    location: "Bengaluru, India",
    period: "Aug 2021 — May 2023",
    summary: "Government technology solutions across the stack.",
    points: [
      "Built Angular applications, .NET backend services and REST APIs for government technology solutions.",
    ],
    tech: ["Angular", ".NET", "REST"],
  },
];

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  context: string;
  metrics: { value: string; label: string }[];
  problem: string;
  approach: string[];
  result: string;
  tech: string[];
  /** Optional public repo or live URL. Omit for proprietary work. */
  repo?: string;
  demo?: string;
  /** Shown on the card when there's no public code to link to. */
  confidential?: boolean;
};

export const projects: Project[] = [
  {
    slug: "kaveri",
    title: "Kaveri 2.0 — Backend at Civic Scale",
    tagline:
      "Statewide property registration for 69M+ residents, rebuilt to survive its own traffic.",
    context: "Center for Smart Governance · Government of Karnataka",
    metrics: [
      { value: "70%", label: "Lower API latency" },
      { value: "15M+", label: "Daily API requests" },
      { value: "9,000+", label: "Registrations / day" },
    ],
    problem:
      "Kaveri 2.0 carries every property registration in Karnataka — 9,000+ transactions a day underwriting ₹20,000+ crore in annual revenue. Query execution and API response times were degrading under peak load, and in a registration system a slow write is indistinguishable from a failed one to the citizen at the counter.",
    approach: [
      "Profiled the hot paths and redesigned the underlying schema around the access patterns that actually dominated traffic, rather than the normalised model the system started from.",
      "Reworked the indexing strategy and rewrote the worst offending queries — the 70% figure is latency and query execution time measured together, not a synthetic benchmark.",
      "Made the write APIs idempotent so retries at the network edge could never double-register a property, and kept transactional integrity across microservice boundaries.",
      "Layered JWT, RBAC, API keys, schema validation and Redis rate limiting in front of it for auditability under a regulated compliance regime.",
      "Shipped it through Azure DevOps CI/CD with automated deployment, testing and monitoring, and led a team of four owning the critical services end to end.",
    ],
    result:
      "70% reduction in API latency and query execution time, zero major incidents across the period I owned the services, and a platform serving 40K daily / 900K monthly active users without special handling at peak.",
    tech: [".NET Core", "PostgreSQL", "Redis", "Microservices", "Azure DevOps", "JWT / RBAC"],
    confidential: true,
  },
  {
    slug: "multi-tenant-rls",
    title: "Multi-Tenant Rebuild with Row-Level Security",
    tagline:
      "Moved tenant isolation out of application code and into the database, where it can't be forgotten.",
    context: "Synexar, Inc. · Healthcare platform",
    metrics: [
      { value: "DB-enforced", label: "Isolation boundary" },
      { value: "0", label: "Trusted app-layer filters" },
    ],
    problem:
      "Tenant isolation depended on every query remembering to filter by tenant. That is a correctness guarantee resting on developer discipline — and in healthcare, a single missed WHERE clause is a data breach, not a bug.",
    approach: [
      "Redesigned the master tenant tables so tenancy was a first-class part of the data model instead of a column convention.",
      "Implemented PostgreSQL Row-Level Security policies so the isolation boundary is enforced by the database for every query, including ad-hoc ones.",
      "Migrated existing data and access paths onto the new model without downtime for tenants already on the platform.",
    ],
    result:
      "Isolation became a property of the schema rather than of the code reviewing it. I owned the decision, the migration and the verification end to end.",
    tech: ["PostgreSQL RLS", "Multi-Tenancy", ".NET", "Schema Migration", "System Design"],
    confidential: true,
  },
  {
    slug: "hospital-intake",
    title: "Hospital Intake — OCR-Automated Onboarding",
    tagline: "Took manual data entry out of the hospital front desk.",
    context: "Synexar, Inc. · Healthcare platform",
    metrics: [
      { value: "2", label: "Document types parsed" },
      { value: "Front-office", label: "Workflow replaced" },
    ],
    problem:
      "Reception staff retyped patient details from driving licences and insurance cards at admission — slow at the desk, and every transcription is a chance to get a patient's identity or coverage wrong.",
    approach: [
      "Integrated Azure OCR (Cognitive Services) to extract patient and insurance-card fields directly from a photo of the document.",
      "Mapped extracted fields into the intake form with human confirmation before commit — the operator stays in the loop, the typing doesn't.",
      "Traced and fixed the data-persistence defects that were losing intake records, then stabilised the flow for production use.",
    ],
    result:
      "A front-office intake path that reads documents instead of asking staff to retype them, delivered and stabilised end to end.",
    tech: ["Azure Cognitive Services", ".NET", "Angular", "OCR"],
    confidential: true,
  },
  {
    slug: "feedback-360",
    title: "360° Feedback Platform",
    tagline: "Designed, built and launched solo for 500+ users. Earned two promotions.",
    context: "Center for Smart Governance · Internal product",
    metrics: [
      { value: "500+", label: "Users" },
      { value: "1", label: "Engineer" },
      { value: "2", label: "Promotions earned" },
    ],
    problem:
      "The organisation had no structured way to run peer and upward feedback, and no budget line for a vendor tool.",
    approach: [
      "Designed the data model and review cycle from scratch — reviewers, subjects, question sets, anonymity rules.",
      "Built it as a .NET Core MVC + Angular application on MySQL with role-based authentication separating participants, managers and administrators.",
      "Took it from proposal to launch alone, including rollout to 500+ staff.",
    ],
    result:
      "Shipped and adopted across the organisation. The work directly earned two promotions.",
    tech: [".NET Core MVC", "Angular", "MySQL", "RBAC"],
    confidential: true,
  },
];

export type SkillGroup = { title: string; items: string[] };

export const skills: SkillGroup[] = [
  {
    title: "Backend & Architecture",
    items: [
      "C#",
      ".NET Core",
      "ASP.NET Core",
      "REST APIs",
      "Microservices",
      "Distributed Systems",
      "System Design",
      "Multi-Tenant Architecture",
      "Idempotency",
    ],
  },
  {
    title: "Data & Caching",
    items: ["PostgreSQL", "Row-Level Security", "MySQL", "MongoDB", "Redis", "Query Optimisation", "Indexing"],
  },
  {
    title: "AI-Native Engineering",
    items: [
      "AI Agent Orchestration",
      "Claude Code",
      "GitHub Copilot",
      "Cursor IDE",
      "Prompt Engineering",
      "Code Review Automation",
    ],
  },
  {
    title: "Cloud & DevOps",
    items: ["Azure", "Azure OCR", "Azure DevOps", "CI/CD", "Docker"],
  },
  {
    title: "Frontend",
    items: ["Angular", "AngularJS", "TypeScript", "Reactive Forms", "HTML", "CSS"],
  },
  {
    title: "Testing & Security",
    items: ["Playwright", "JWT", "RBAC", "Rate Limiting", "Schema Validation"],
  },
];

export const languages = ["C#", "SQL", "TypeScript", "Python"];

export type Credential = {
  title: string;
  org: string;
  detail?: string;
  period: string;
};

export const education: Credential[] = [
  {
    title: "Master's Degree, Computer Programming",
    org: "International Institute of Information Technology, Bangalore (IIIT-B)",
    detail: "Integrated M.Tech with Electronics & Communication",
    period: "2016 — 2021",
  },
  {
    title: "Systems Design Assessment",
    org: "AlgoExpert",
    period: "2025",
  },
  {
    title: "Microsoft SQL Server Reporting Services (SSRS)",
    org: "Udemy",
    period: "2021",
  },
];

export const contact = {
  heading: "Let's talk about what you're building.",
  body: "Based in Bengaluru and open to remote. Email is the fastest way to reach me — I read everything.",
};
