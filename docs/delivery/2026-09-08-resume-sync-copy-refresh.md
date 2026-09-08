---
slug: resume-sync-copy-refresh
tier: 2
confidence_pre: 78
confidence_post: null
repo: Portfolio
base: origin/main
branch: feat/resume-sync-copy-refresh
phase: branched
created: 2026-09-08
---

# Sync the portfolio with the new résumé and requested copy/UI changes

## 1. Original issue

> Changes to the portfolio:
> 1. Update the whole portofolio data with my new CV. that i will attach.
> 2. Where I've built things Part looks like a resume, just add sew sentences of what i did there with few metrics. Thats all.
> 3. Change Bengaluru, India · Open to remote Shubham Jain Backend & Distributed Systems Engineer Backend & Distributed Systems Engineer To something else also remove distributed systems engg.
> 4. Remove zero major incidents part from the website. Also remove ₹20,000+ crore part only from
> 5. need more icons then text over here, segregate if we need both text and icons.
> 6. Enable analytics.
>
> (From `Changes.docx`, which also carried 3 screenshots: the Vercel Analytics setup panel, the
> "What I build with" skills grid with no icons, and the About section showing the "₹20,000+
> crore" / stats card region.)
>
> User clarifications gathered in conversation before this quest started:
> - Item 3's new role: **"Full-Stack Engineer | AI-Native Engineering"**
> - Item 4's crore removal scope: **About section only** — keep it in the Experience bullet and
>   the Kaveri case study, matching the new résumé's own usage.

## 2. What this change does

Before: the site's hero title reads "Backend & Distributed Systems Engineer"; the About section
and one Experience bullet cite "zero major incidents" and the About narrative cites "₹20,000+
crore"; the Experience timeline reads as a condensed résumé bullet list; the Skills section is
text-only pills with no icons; the site has no analytics; and several résumé data points (new
Synexar metrics, a few technical-skill entries) aren't reflected in the site's copy yet.

After: the hero title reads "Full-Stack Engineer | AI-Native Engineering" everywhere it's derived
from `site.role` (h1, page title, meta description, OG/Twitter tags, JSON-LD); "zero major
incidents" is gone from the site entirely; "₹20,000+ crore" remains in Experience and the Kaveri
case study but is removed from the About narrative; each Experience entry opens with a short
narrative paragraph naming a metric, instead of dropping straight into resume bullets; concrete
technology skills (e.g. .NET, PostgreSQL, Redis, Angular, Azure, Docker) render with a small icon
next to the label, abstract skills stay text-only; and Vercel Web Analytics is wired in so page
views start being counted once deployed.

## 3. Where it touches

| File | What changes | Why |
|---|---|---|
| `src/data/content.ts` | `site.role`; `about.paragraphs` (drop crore line); `stats`/thesis highlight (drop "zero major incidents"); `experience[].summary` (expand with metrics); `experience[1].points` (drop "zero major incidents" bullet fragment); `skills` items gain optional `icon` tag; `languages` gains Java/Node.js; a few `skills` groups gain Entity Framework/Swagger/System Design & Architecture/SSO/Git | Single source of truth — every component reads from here |
| `src/app/layout.tsx` | `metadata.keywords` (drop "Distributed Systems", add "Full-Stack Engineer"/"AI-Native Engineering"); add `<Analytics />` from `@vercel/analytics/next` inside `RootLayout` | Keywords are a literal array, not derived from `site.role`; Analytics needs a render point |
| `src/components/Icons.tsx` | New hand-rolled SVG icon components for the concrete tech skills chosen in the approach-approval step | Matches the project's existing zero-dependency, hand-rolled icon convention |
| `src/components/Skills.tsx` | Render an icon next to the label when a skill item carries one; text-only otherwise | Implements the "some icons, not all" segregation the user asked for |
| `package.json` / `package-lock.json` | Add `@vercel/analytics` | Required by item 6 |

**Blast radius:** `content.ts` is imported by `Hero.tsx`, `About.tsx`, `Experience.tsx`,
`Work.tsx`, `Skills.tsx`, `Education.tsx`, `Contact.tsx`, `JsonLd.tsx`, and `layout.tsx` — every
page-visible section reads from it, which is why a single data file touches nearly the whole site
even though no component's *logic* changes except `Skills.tsx`. No API routes, no build-time data
fetching, no external consumers beyond the deployed static site itself.

**Deliberately NOT touched:**
- `education` array's two non-résumé entries (AlgoExpert assessment, SSRS Udemy course) — the
  résumé omits them, but they're true supplementary detail a personal site can carry that a
  one-page résumé can't; removing them wasn't asked for.
- `skills` groups' entries not on the résumé (`MongoDB`, `Idempotency`, `Code Review Automation`,
  `Reactive Forms`, `Schema Validation`) — same reasoning, left as site-only elaboration.
- `Work.tsx` ("Selected work" case studies) — item 2 named the Experience section
  ("Where I've built things") specifically; the case-study cards are a different, already
  narrative section and weren't called out.
- `robots.ts`, `sitemap.ts`, `JsonLd.tsx` internals — they consume `site.role`/`site.name`
  already and need no direct edits.

## 4. Tier and why

| Axis | Score | Evidence |
|---|---|---|
| Blast radius | T2 | 5 files change across data + 2 components + layout + manifest; no exported/public API surface |
| Reversibility | T1 | Plain `git revert` undoes any slice; no data migration, no external state |
| Unknowns | T1-T2 | Resolved via user's clarifying answers; residual judgment only in icon-set completeness/visual balance |
| Verification | T2 | Repo has zero test infrastructure (`verify.test: null`); realistic verification is `npm run build` + `npm run lint` + manual visual check in the dev server, not an automated test |
| Contract | T1 | No public export, API, or wire-format change |
| Data / security | T2 | Adds `@vercel/analytics` — new third-party script transmitting visitor page-view data (no PII form, no auth, no secrets, no cookies per Vercel's own model) |

**Tier 2, set by blast radius and the new dependency.** No hard escalator applies (no
auth/tenancy, no schema, no secrets, no billing, no deletion, no CI/CD/permission config changed).

### Approach

**Item 5 (Skills icons) — three options considered:**

- **A — Hand-rolled inline SVGs added to `Icons.tsx` (chosen).** Matches the existing pattern
  exactly: every current icon in the file is a hand-drawn inline SVG, and the project's fonts are
  explicitly self-hosted "so nothing leaves the visitor's browser to a third party" (comment in
  `layout.tsx`). Zero new dependency, full control over stroke weight to match the existing icon
  set. Trade-off: slower to produce than pulling a ready icon set, and I'm drawing/tracing each
  mark by hand rather than importing an authoritative brand logo.
- **B — An icon library (`react-icons` / `simple-icons` npm package) — rejected.** Fast, accurate
  brand logos. Rejected because it adds a second new dependency in the same quest (on top of
  Analytics), pulls in bundle weight for a purely decorative feature, and breaks the project's
  established zero-icon-dependency convention for no functional gain.
- **C — CDN-hosted logo references (e.g. simple-icons CDN URLs) — rejected.** No npm dependency,
  but adds a live third-party network request on every page load, directly contradicting the
  self-hosting philosophy already stated in this codebase.

## 5. What good looks like

1. The hero `<h1>` on the live site reads "Full-Stack Engineer | AI-Native Engineering", not
   "Backend & Distributed Systems Engineer", and the browser tab title / meta description /
   OpenGraph preview all reflect the new role too (all derived from `site.role`).
2. No page on the site contains the string "zero major incidents".
3. The About section paragraph no longer contains "₹20,000+ crore"; the Experience timeline entry
   for "Software Engineer" at Center for Smart Governance and the Kaveri case study modal still do.
4. Each Experience entry's opening paragraph is 2-3 sentences (not one) and names at least one
   concrete metric, for the Synexar and CSG-Software-Engineer entries in particular.
5. The Skills section renders a small icon to the left of the label for concrete technologies
   (.NET, PostgreSQL, MySQL, Redis, Azure, Docker, Angular, TypeScript, GitHub Copilot at minimum)
   and renders label-only for abstract/compound skills (e.g. "Multi-Tenant Architecture",
   "Prompt Engineering", "Rate Limiting").
6. `site.role`'s résumé-adjacent facts (Synexar's 40%/50% metrics, Java/Node.js in the skills
   list) appear somewhere on the site.
7. `npm run build` succeeds with `@vercel/analytics` installed, and `<Analytics />` is present in
   the rendered HTML `<body>` (a `<script>` tag pointing at Vercel's analytics endpoint, visible
   via view-source once deployed — cannot be confirmed for live data collection without an actual
   Vercel deployment, which is outside this quest's reach).

## 6. How it is verified

| # | Verifies | Command or manual step | Expected |
|---|---|---|---|
| 1 | §5.1, §5.3, §5.4, §5.6 | Manual: run `npm run dev`, visually scan Hero, About, Experience sections | Copy matches §5 exactly; recorded with what was actually observed |
| 2 | §5.2 | `git grep -i "zero major incidents"` on the final diff | No matches |
| 3 | §5.3 | `git grep "20,000"` / `git grep "crore"` on `content.ts` | Present in Experience + Kaveri case study, absent from About paragraph |
| 4 | §5.5 | Manual: `npm run dev`, open Skills section, inspect which pills carry icons | Concrete techs show icon+label, abstract ones show label-only |
| 5 | §5.7 | `npm run build` | Build succeeds; `grep` rendered output or dev HTML for the Analytics script tag |
| 6 | all | `npm run lint` | No new lint errors introduced |

No automated test exists or is being added — this repo has zero test infrastructure and adding a
framework is out of scope for a content/copy quest. This is a deliberate, recorded gap, not a
silent skip (per `verify.test: null` in the repo config).

## 7. Risks and rollback

- **Risk:** narrative expansion in Experience summaries drifts from strict resume accuracy while
  trying to sound less resume-like → **Mitigation:** every added sentence/metric is sourced
  directly from the new résumé PDF, not invented.
- **Risk:** the chosen icon set for Skills looks visually uneven (mixed stroke weights, sizes)
  since icons are hand-drawn rather than from one designed set → **Mitigation:** new icons are
  built to the same viewBox/stroke conventions as the existing `Icons.tsx` set, and reviewed
  visually in the dev server before the push gate.
- **Risk:** `@vercel/analytics` adds an unwanted third-party script if the user later prefers a
  different analytics tool or none at all → **Mitigation:** it's one import + one component; easy
  to remove in a single revert.
- **Rollback:** `git revert` on any of the three slice commits, or drop the whole branch — nothing
  here is a data migration or has an external side effect that outlives the deploy.

## 8. Confidence

**Pre-implementation: 78/100**

| Judgment | Assessment | Evidence |
|---|---|---|
| Cause identified, not just symptom | Yes — each of the 6 requested changes maps to a specific, named location in `content.ts`/`layout.tsx`/`Skills.tsx`, confirmed by reading the file, not guessed | File:line references in §3 |
| Fix addresses the cause | Yes for items 1, 3, 4, 6 (mechanical text/config edits); items 2 and 5 are subjective content/design work where "correct" isn't binary | N/A for subjective items — see confidence gap below |
| No other call site has the same defect | Checked — `zero major incidents` and `₹20,000+ crore`/`20,000` greped across `src/` before drafting this plan, all 3-4 occurrences of each are accounted for in §3/§4 | `Grep` results during recon |
| Verification distinguishes fixed from unfixed | Partial — `git grep` checks for items 3/4 are binary pass/fail; items 2 and 5 rely on manual visual/content review, which is inherently subjective | See §6 |
| Blast radius fully examined | Yes — every importer of `content.ts` enumerated in §3 | `Grep` for `from "@/data/content"` during recon |

**What keeps this below 100:** two of the six items are subjective, not verifiable by a mechanical
check — the exact wording/tone of the expanded Experience narratives, and the exact icon set and
its visual balance in Skills. Both are executed to the best judgment available, but "good" here is
a matter of taste the user may want to revise after seeing it, not a provable correctness claim.

**What would raise it:** the user reviewing the actual rendered narrative text and the actual
rendered icon set (not just the diff) and confirming both read the way they intended.

## 9. Security

Floor: tier 2. Results per `08-security.md`.

| # | Check | Result | Note |
|---|---|---|---|
| 1 | Secret scan on diff | pending | run before push gate, on the composed final diff |
| 2 | Personal-data guard | pending | run before push gate |
| 3 | Permission diff empty | pending | expect empty except `package.json`/`package-lock.json` (see check 4) |
| 4 | No manifest/lockfile movement | expected fail, pre-approved | `@vercel/analytics` is the one intentional dependency this quest adds — reviewed explicitly under check 8 before Slice C, not a silent side effect |
| 5 | Repo's own guards | n/a | `verify.security` is `null` — repo has no guard script |
| 7 | Input-trust review | n/a | no new input path — this quest touches only static copy/config and a client-side analytics snippet |
| 8 | Dependency review | pending | to be answered explicitly with the user before Slice C: what `@vercel/analytics` is, maintainer (Vercel, the platform this site already deploys to), release cadence, transitive deps, why nothing already in the tree does the job |
| 9 | Authorization touchpoints | n/a | no auth in this codebase |
| 10 | Logging/output review | n/a | no new logging, no error paths added |
| 11 | Egress review | pending | `@vercel/analytics` beacons page-view events to Vercel's analytics endpoint — named and to be confirmed with the user at the same time as check 8 |
| 12 | `/security-review` | pending | run on the final composed diff before the push gate |

**Open findings:** none yet — checks not yet run pending implementation; will be completed before
the push gate as required.

## 10. Post-implementation

_Appended after verification runs. Do not fill in before._
