/**
 * Every word on the site lives here.
 * Edit this file to change copy — you should never need to touch a component.
 */

export const site = {
  name: "Shubham Jain",
  initials: "SJ",
  role: "Full-Stack Engineer | AI-Native Engineering",
  location: "Bengaluru, India",
  /** Shown after the location in the hero. Set to "" to show the location alone. */
  availability: "",
  email: "shubhamjainiiitb@gmail.com",
  linkedin: "https://linkedin.com/in/shubham-jain-developer",

  /** Set to "" to hide every GitHub link on the site. */
  github: "https://github.com/shubhamjain-develops",

  /** This site's own repo — linked in the footer as a quiet "the source is here". */
  repo: "https://github.com/shubhamjain-develops/Portfolio",

  /** Free Vercel subdomain — swap for a custom domain later if you buy one. */
  url: "https://shubhamjain-develops.vercel.app",

  resumePath: "/Shubham_Jain_General.pdf",

  intro:
    "Full-stack engineer with five years across statewide government infrastructure and early-stage startup engineering — specialising in .NET, Angular and PostgreSQL, and in directing AI coding agents inside a human-in-the-loop workflow.",

  /** The one line a recruiter should remember. */
  thesis: {
    before: "Led backend architecture for a platform serving ",
    highlights: [
      { value: "69M+ residents", after: " — cut API latency " },
      { value: "70%", after: " across a 15M-request-a-day system." },
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
  { value: 1350, suffix: "K+", label: "Monthly active users secured" },
];

export const about = {
  heading: "Systems that hold up under real constraints",
  paragraphs: [
    "I work on the boundary between “it works” and “it works at scale.” Over the past five years that has meant architecting the backend for a statewide property-registration platform used by 69 million residents, rebuilding multi-tenant data isolation with real guarantees behind it, and — as a founding engineer at an AI-native healthcare startup — directing AI coding agents inside a structured, human-supervised workflow rather than either avoiding them or handing them the keys.",
    "The through-line is ownership. On Kaveri 2.0 I led a team of four with end-to-end responsibility for critical microservices underpinning the state's entire property-registration system. At Synexar I own requirements, architecture and validation while agents do the typing — which turns out to demand more engineering judgement, not less.",
    "I like problems with constraints that bite: regulatory requirements, data nobody can afford to lose, and traffic that doesn't ask permission before it spikes.",
  ],
};

/** Small card under the stats — the thing a recruiter is actually scanning for. */
export const availability = {
  title: "Currently",
  status: "Open to new roles",
  lines: [
    "Backend and full-stack roles.",
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
      "Sole owner and maintainer of Synexar's clinical platform codebase, directing AI coding agents inside a human-supervised engineering model rather than avoiding them or handing them the keys. I own the full patient journey and the admin module end to end while agents do the typing, which so far has cut SSO login time by 50% and manual front-desk data entry by 40%.",
    points: [
      "Sole owner/maintainer of Synexar's clinical platform codebase, stabilising existing functionality and independently shipping major new capabilities for an AI-native healthcare startup.",
      "Directed a human-governed, guardrail-driven agentic engineering workflow for AI coding agents through Claude Code across the full SDLC — development, debugging, refactoring and testing — backed by structured change-impact verification.",
      "Own the full patient journey end to end (check-in through discharge, procedure capture, report generation) and the admin module (facility onboarding and configuration).",
      "Delivered a HIPAA-compliant centralised audit logging system with a reporting dashboard optimised for fast retrieval, indexing high-frequency columns and using keyset (cursor-based) pagination, validated end-to-end with Playwright for regression-safe deployments.",
      "Stabilised a key hospital front-office intake feature, resolving complex data-persistence defects and integrating Azure OCR to extract patient details from driving licences and insurance cards — cutting manual entry by 40%.",
      "Led core restructuring of the platform's multi-tenant architecture, redesigning master tenant tables and implementing PostgreSQL Row-Level Security (RLS) to model real-world clinic and hospital structures with stronger data isolation.",
      "Reduced SSO login time by 50% by streamlining the authentication flow and optimising auth validation to minimise redundant user verification.",
    ],
    tech: [".NET", "Angular", "PostgreSQL", "Azure", "Playwright"],
  },
  {
    title: "Software Engineer 3",
    company: "Center for Smart Governance",
    location: "Bengaluru, India",
    period: "Apr 2025 — Apr 2026",
    summary:
      "Backend architecture for Kaveri 2.0, the Government of Karnataka's statewide property-registration platform, serving 69M+ residents and 15M+ API requests a day. Schema redesign, indexing and query-optimisation work here cut API latency by 70%, and I leaned on AI-assisted tooling — GitHub Copilot, Cursor IDE — to keep delivery speed up while doing it.",
    points: [
      "Architected and optimised backend microservices for a platform serving 69M+ residents and 15M+ daily API requests, achieving a 70% reduction in API latency and query execution time through schema redesign, indexing strategy and query optimisation.",
      "Designed idempotent, transactionally safe .NET Core REST APIs, documented with Swagger, for 9,000+ daily registrations supporting ₹20,000+ crore in annual government revenue, engineered for fault tolerance and high availability under peak load.",
      "Enforced secure authentication and authorisation using JWT, RBAC, API keys, schema validation and Redis rate limiting, ensuring compliance and auditability for 60,000 daily active users in a highly regulated environment.",
      "Leveraged AI-assisted development tools (GitHub Copilot, Cursor IDE) to accelerate feature development, refactoring and test-case generation, improving delivery speed and code quality.",
      "Optimised an MIS dashboard covering 30+ reports, improving report generation speed by 27% on average through streamlined third-party data flows and database query optimisation — indexing, joins and pagination.",
    ],
    tech: [".NET Core", "PostgreSQL", "Redis", "Swagger", "Microservices"],
  },
  {
    title: "Software Engineer 2",
    company: "Center for Smart Governance",
    location: "Bengaluru, India",
    period: "Jun 2023 — Mar 2025",
    summary:
      "Angular frontend engineering for Kaveri 2.0's core registration workflows, serving a 1,350,000-monthly-active-user base, plus the Azure DevOps CI/CD pipelines behind the platform's releases. I also led a team of four developers with end-to-end ownership of several critical microservices.",
    points: [
      "Engineered Angular frontends with reactive forms and lazy loading, supporting real-time validation, dynamic valuations and secure data handling for authenticated and guest users across a 1,350,000 MAU base.",
      "Established Azure DevOps CI/CD pipelines for automated deployment, testing and monitoring of high-availability microservices, accelerating delivery cycles and supporting platform reliability under peak load.",
      "Led a team of 4 developers on the property-registration workflow track, owning critical microservices end to end from architecture through production — serving as the main technical point of contact with stakeholders, delivering features with zero major incidents.",
      "Established a pull-request-based code review process for the team, enforcing coding standards and catching defects before merge.",
    ],
    tech: ["Angular", "Reactive Forms", "Azure DevOps", "CI/CD"],
  },
  {
    title: "Software Engineer 1",
    company: "Center for Smart Governance",
    location: "Bengaluru, India",
    period: "Aug 2021 — May 2023",
    summary:
      "Built foundational Kaveri 2.0 workflow screens from the ground up, integrating statewide land-record systems like Bhoomi and e-Aasthi. Also designed and shipped an internal 360° Feedback product solo, end to end, for 500+ users.",
    points: [
      "Built Kaveri 2.0 modules from the ground up, delivering complex workflow screens such as fee calculation and integrating multiple statewide land and property record systems, including Bhoomi and e-Aasthi, via SOAP and XML-based web services.",
      "Single-handedly designed and launched the in-house 360° Feedback application (.NET Core MVC, Angular, MySQL, Entity Framework) with role-based authentication, enabling peer and upward feedback for 500+ users — earning two promotions.",
    ],
    tech: [".NET Core MVC", "Angular", "MySQL", "Entity Framework"],
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
      "70% reduction in API latency and query execution time, and a platform serving 60K daily / 1.35M monthly active users without special handling at peak.",
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
    tagline: "Designed, built and launched solo for 500+ users.",
    context: "Center for Smart Governance · Internal product",
    metrics: [
      { value: "500+", label: "Users" },
      { value: "1", label: "Engineer" },
    ],
    problem:
      "The organisation had no structured way to run peer and upward feedback, and no budget line for a vendor tool.",
    approach: [
      "Designed the data model and review cycle from scratch — reviewers, subjects, question sets, anonymity rules.",
      "Built it as a .NET Core MVC + Angular application on MySQL with role-based authentication separating participants, managers and administrators.",
      "Took it from proposal to launch alone, including rollout to 500+ staff.",
    ],
    result:
      "Shipped and adopted across the organisation.",
    tech: [".NET Core MVC", "Angular", "MySQL", "RBAC"],
    confidential: true,
  },
];

export type SkillGroup = {
  title: string;
  items: string[];
  /** How many of `items` (in order) show by default before a "+N more" toggle reveals the rest. */
  headline?: number;
};

export const skills: SkillGroup[] = [
  {
    title: "Backend & Architecture",
    headline: 8,
    items: [
      "C#",
      ".NET Core",
      "ASP.NET Core",
      "Entity Framework",
      "REST APIs",
      "Microservices",
      "Distributed Systems",
      "System Design & Architecture",
      "Dapper",
      "LINQ",
      "SOAP",
      "Swagger",
      "Multi-Tenant Architecture",
      "Idempotency",
      "SOLID Principles",
      "Design Patterns",
      "Clean Architecture",
      "Event-Driven Architecture",
      "CQRS",
      "API Versioning",
      "Horizontal Scaling",
      "High-Availability Systems",
    ],
  },
  {
    title: "Data & Caching",
    headline: 5,
    items: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "Query Optimisation",
      "Row-Level Security",
      "Indexing",
      "Schema Design",
      "Transaction Management",
    ],
  },
  {
    title: "AI-Native Engineering",
    headline: 4,
    items: [
      "Claude Code",
      "AI Agent Orchestration",
      "GitHub Copilot",
      "Cursor IDE",
      "Prompt Engineering",
      "Code Review Automation",
      "Human + AI Collaboration",
    ],
  },
  {
    title: "Cloud & DevOps",
    headline: 5,
    items: ["Azure", "Azure DevOps", "CI/CD", "Docker", "Git", "Azure Functions", "Azure OCR", "Application Insights"],
  },
  {
    title: "Frontend",
    headline: 4,
    items: ["Angular", "TypeScript", "HTML", "CSS", "AngularJS", "Reactive Forms"],
  },
  {
    title: "Testing & Security",
    headline: 5,
    items: [
      "Playwright",
      "JWT",
      "RBAC",
      "SSO",
      "Rate Limiting",
      "Unit Testing",
      "Integration Testing",
      "OAuth2",
      "Schema Validation",
    ],
  },
];

export const languages = ["C#", "Java", "Node.js", "SQL", "TypeScript", "Python"];

/**
 * Skills that are used together. Hovering one skill on the site keeps its
 * partners lit and dims the rest. Both names must match an item in `skills`.
 */
export const skillLinks: [string, string][] = [
  ["C#", ".NET Core"],
  ["C#", "ASP.NET Core"],
  [".NET Core", "ASP.NET Core"],
  [".NET Core", "Entity Framework"],
  [".NET Core", "Azure"],
  ["ASP.NET Core", "REST APIs"],
  ["REST APIs", "Swagger"],
  ["REST APIs", "Idempotency"],
  ["REST APIs", "Microservices"],
  ["Microservices", "Distributed Systems"],
  ["Microservices", "Docker"],
  ["Microservices", "Redis"],
  ["Distributed Systems", "System Design & Architecture"],
  ["System Design & Architecture", "Multi-Tenant Architecture"],
  ["Multi-Tenant Architecture", "Row-Level Security"],
  ["Row-Level Security", "PostgreSQL"],
  ["PostgreSQL", "Entity Framework"],
  ["PostgreSQL", "Query Optimisation"],
  ["PostgreSQL", "Indexing"],
  ["MySQL", "Entity Framework"],
  ["MySQL", "Query Optimisation"],
  ["MongoDB", "Indexing"],
  ["Query Optimisation", "Indexing"],
  ["Redis", "Rate Limiting"],
  ["Rate Limiting", "Schema Validation"],
  ["JWT", "RBAC"],
  ["JWT", "SSO"],
  ["RBAC", "Multi-Tenant Architecture"],
  ["Azure", "Azure OCR"],
  ["Azure", "Azure DevOps"],
  ["Azure DevOps", "CI/CD"],
  ["CI/CD", "Git"],
  ["CI/CD", "Docker"],
  ["CI/CD", "Playwright"],
  ["Angular", "AngularJS"],
  ["Angular", "TypeScript"],
  ["Angular", "Reactive Forms"],
  ["Angular", "HTML"],
  ["HTML", "CSS"],
  ["Claude Code", "AI Agent Orchestration"],
  ["Claude Code", "Prompt Engineering"],
  ["Claude Code", "Code Review Automation"],
  ["GitHub Copilot", "Code Review Automation"],
  ["Cursor IDE", "Prompt Engineering"],
  ["AI Agent Orchestration", "Prompt Engineering"],
  ["AI Agent Orchestration", "Human + AI Collaboration"],
  ["Claude Code", "Human + AI Collaboration"],
  [".NET Core", "Dapper"],
  [".NET Core", "LINQ"],
  ["Dapper", "Entity Framework"],
  ["LINQ", "Entity Framework"],
  ["REST APIs", "SOAP"],
  ["System Design & Architecture", "SOLID Principles"],
  ["SOLID Principles", "Design Patterns"],
  ["Design Patterns", "Clean Architecture"],
  ["Clean Architecture", "System Design & Architecture"],
  ["Microservices", "Event-Driven Architecture"],
  ["Event-Driven Architecture", "CQRS"],
  ["REST APIs", "API Versioning"],
  ["Distributed Systems", "Horizontal Scaling"],
  ["Horizontal Scaling", "High-Availability Systems"],
  ["High-Availability Systems", "Microservices"],
  ["PostgreSQL", "Schema Design"],
  ["PostgreSQL", "Transaction Management"],
  ["Schema Design", "Query Optimisation"],
  ["Azure", "Azure Functions"],
  ["Azure DevOps", "Application Insights"],
  ["JWT", "OAuth2"],
  ["OAuth2", "SSO"],
  ["Playwright", "Unit Testing"],
  ["Playwright", "Integration Testing"],
  ["Unit Testing", "Integration Testing"],
];

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
  body: "Based in Bengaluru. Email is the fastest way to reach me — I read everything.",
};

/**
 * The site's jokes: the hero terminal, the status footer, the git-log and
 * postmortem views. Only labels and punchlines live here — every fact they
 * show (roles, skills, projects, availability, location) is read from the
 * exports above, so there is still one place to change it.
 */
export const playful = {
  terminal: {
    title: "shubham@portfolio: ~",
    placeholder: "type help",
    inputLabel: "Terminal command",
    hint: "Type help. Right arrow completes a command, up arrow recalls the last one.",
    logLabel: "Terminal output",
    examplesLabel: "Example commands",
    examples: ["help", "experience --current", "skills | grep postgres", "hamster"],
    help: [
      ["whoami", "who I am, in one line"],
      ["experience [--current]", "roles, newest first"],
      ["skills [| grep term]", "what I build with"],
      ["projects", "selected work"],
      ["contact", "how to reach me"],
      ["resume", "download my résumé"],
      ["hamster", "how the hamster is doing"],
      ["clear", "clear this output"],
    ],
    // Errors never repeat what was typed.
    notFound: "command not found — try help",
    noCurrentRole: "no current role",
    noSkillMatch: "no skills match that term",
    hamsterFed: { one: "fed 1 time today", many: "fed {n} times today" },
  },
  status: {
    headline: "All critical systems operational",
    availability: "Availability",
    location: "Location",
    hamster: "Hamster",
    coffee: "Coffee",
    coffeeState: "Degraded",
    hamsterFed: { one: "Fed 1 time today", many: "Fed {n} times today" },
  },
  postmortem: {
    /** Only projects whose problem was a production incident read naturally as postmortems. */
    projects: ["kaveri"],
    label: "Case study view",
    caseStudy: "Case study",
    postmortem: "Postmortem",
    impact: "Impact",
    rootCause: "Root cause",
    fix: "Fix",
  },
};
