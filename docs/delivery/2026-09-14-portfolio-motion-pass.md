---
slug: portfolio-motion-pass
tier: 2
confidence_pre: 74
confidence_post: null
repo: Portfolio
base: origin/main
branch: feat/portfolio-motion-pass
phase: branched
created: 2026-09-14
---

# Add the approved motion pass, hamster and new CV to the portfolio

## 1. Original issue

> /quest take this up and raise a pr once ready.
>
> "This" is the motion-pass proposal at
> https://claude.ai/code/artifact/222bc834-d49a-4325-892b-049f4365e716 (version 5), built from these user requests, quoted as they arrived:
>
> 2026-09-13: "add a file Shubham_Jain_General from that repo to put it here, also i want you to plan a upgrade to our portfolio website, like not full change stype or anything, improvments, mostly visual like better and more animations unique ideas, also a feature where there is a hamster on the bottonm left and it is trying to eat someting, when you click on the hamster it eats it, and the test above it says how many time it was fed, every thin is front end only along with number. plan this and other thing and let me know. the hamster should look good."
>
> 2026-09-13: "make it cuter, also i like everything exxcept insted of saying jse ase and se say se1,se2,se3 also dont give 70% metric like that. also tyry to meke it a bit more color full."
>
> 2026-09-14: "I do not like the current color changes, like the rainbow colors, when i asked for add colors, I ment some places only... re thing the color changes."
>
> 2026-09-14: "make the se1,2,3 as software engineer 1,2,3. make the fed counter per day wise. like it should say fed 3 times today. then reset every day."
>
> Standing decisions from the proposal sessions (recommended options, not overridden by the user): the Résumé buttons download the new General CV; keep the old PDF until the user confirms deleting it; one treat at a time; treats rotate seed → strawberry → blueberry; hamster smaller on phones; reduced motion keeps the hamster still and only puffs its cheeks; theme switch uses View Transitions and is instant where unsupported; Founding Software Engineer title unchanged; the 70% figure stays only as the existing text; the skills highlight is included as the optional last step.

## 2. What this change does

**Before:**
- Motion is the existing reveal-on-scroll and the hero constellation.
- The Résumé buttons download `Shubham_Jain_Resume.pdf`.
- The Center for Smart Governance roles read Junior / Associate / Software Engineer.
- There's no hamster.

**After:**
- **Hero:** blue request packets hop between the teal nodes, and a click sends a coral burst out from the nearest node.
- **Section headings:** the eyebrow types in, the title rises line by line, and a short teal underline draws in.
- **Timeline:** each role's dot lights up as the scroll line reaches it and its dates flip in. The current role glows coral.
- **Project cards:** a teal light circles the border on hover.
- **Theme toggle:** the new theme opens as a circle from the toggle.
- **Hamster:** sits in the bottom-left corner. Clicking feeds it, and "Fed N times today" resets at the visitor's local midnight.
- **Skills:** hovering one keeps related skills lit and dims the rest.
- **Content:** the Résumé buttons download `Shubham_Jain_General.pdf`, and the three Center for Smart Governance roles read Software Engineer 1 / 2 / 3.

Visitors who ask their device to reduce motion get today's static site.

## 3. Where it touches

| File | What changes | Why |
|---|---|---|
| `public/Shubham_Jain_General.pdf` | Added (copied from ai-job-search) | New CV the Résumé buttons serve |
| `src/data/content.ts` | `resumePath`; three CSG job titles; `skillLinks` pairs for the highlight | All copy/data lives here |
| `src/app/globals.css` | `--c-warm` token (both themes); keyframes/utilities for mask-rise, underline, caret, card trace (`@property --trace`), node ignite, date flip, View Transition rules, hamster styles | Styling for every slice |
| `tailwind.config.ts` | `warm` colour + new keyframes/animations | Tailwind access to the token and animations |
| `src/components/HeroCanvas.tsx` | Packets hopping along links, click fan-out burst and ring; reads `--c-accent-2` and `--c-warm` | Hero demo |
| `src/components/Section.tsx` | New exported `SectionHeading` (eyebrow typing, masked title lines, underline). The existing unused `Section` stays as is | Shared heading. This is the existing "shared section chrome" file |
| `About.tsx`, `Experience.tsx`, `Work.tsx`, `Skills.tsx`, `Education.tsx` | Swap the inline eyebrow + h2 for `SectionHeading` | Heading reveal applies to all five |
| `src/components/Experience.tsx` | Nodes ignite from the spine's scroll progress; current role in coral; dates flip in | Timeline demo |
| `src/components/SpotlightCard.tsx` | Border-trace pseudo-element on hover/focus | Card demo |
| `src/components/ThemeToggle.tsx` | `document.startViewTransition` with a circular clip from the button; applies the `dark` class synchronously inside the callback, then persists via `setTheme` | Theme demo |
| `src/lib/hamsterCount.ts` (new) | Pure `readCount` / `recordFeed` for the daily count, with the date and storage injected | Testable day rollover |
| `src/components/Hamster.tsx` (new) | SVG hamster, feed interaction, hearts/+1, daily counter, reduced-motion path | Hamster feature |
| `src/app/page.tsx` | Mount `<Hamster />` | Place it on the page |
| `src/components/Skills.tsx` | Hover/focus highlight of related skills using `skillLinks` | Optional last slice |

**Blast radius:**
- **Hero, headings, timeline, cards:** every section that renders a heading changes markup, but not copy. `HeroCanvas` only affects the hero background. `SpotlightCard` is used only by `Work.tsx`.
- **Theme toggle:** `ThemeToggle` is only in `Nav.tsx`.
- **Content:** `resumePath` is read by `Hero.tsx`, `Nav.tsx` (×2) and `Contact.tsx`. Job titles render only in `Experience.tsx`. No API routes and no server data.
- **Hamster:** a new fixed element at z-40, which sits under the nav (z-50) and the case-study modal (z-70).
- **Metadata:** SEO, metadata and JSON-LD are untouched.

**Deliberately NOT touched:**
- The old `Shubham_Jain_Resume.pdf`, kept until the user confirms deletion.
- `Contact.tsx`'s heading, which has a different centred card layout and no eyebrow.
- The unused `Section` component.
- The hero title sweep and the copy, including the 70% text.
- The General CV's own wording, which still says "zero major incidents", "Rs. 20,000+ crore" and Junior/Associate titles. The user owns that document.
- No new npm packages.

## 4. Tier and why

| Axis | Score | Evidence |
|---|---|---|
| Blast radius | **T2** | About 15 files across data, styles and 9 components. No exported contract |
| Reversibility | T1 | `git revert` per commit; localStorage key is namespaced and harmless if orphaned |
| Unknowns | **T2** | next-themes 0.4.6 applies the class in a `useEffect` after `setTheme` (read from `node_modules/next-themes/dist/index.mjs`), so the View Transition needs a synchronous DOM change; aligning node ignite with the sprung spine |
| Verification | **T2** | No test suite (`verify.test: null`). Needs a new check (node type-stripped run of `hamsterCount.ts` with a mutation check) plus manual browser verification in both themes |
| Contract | T1 | No public API, schema or wire change |
| Data / security | T1 | localStorage holds `{day, count}` only; no new egress; no auth |

**Tier 2, set by the blast radius, unknowns and verification axes.** Tier 1 is also disqualified by the >5 files rule. No hard escalator applies.

### Approach

- **Theme circle (chosen: View Transitions, applying the class ourselves).** Inside `startViewTransition`, toggle `html.dark` and `color-scheme` directly, then call `setTheme` to persist. Rejected: *`startViewTransition(() => setTheme(x))`*, because next-themes applies the class in an effect, so the snapshot would show the old theme. Also rejected: *framer overlay of the new background colour*, which only paints a flat colour, not the real page in the new theme.
- **Timeline ignite (chosen: derived from the spine's own `scrollYProgress`).** Each node gets the fraction of the track where it sits and ignites when progress passes it, so the light and the line agree. Rejected: *per-node `whileInView`*, which fires on viewport position rather than when the line reaches the node.
- **Headings (chosen: `SectionHeading` exported from the existing `Section.tsx`).** Rejected: *animating each of the five inline headings*, which duplicates the same motion five times.
- **Daily counter (chosen: a pure helper in `src/lib/hamsterCount.ts` with date and storage injected).** Rejected: *logic inline in the component*, which can't be exercised without a browser or a test framework.

## 5. What good looks like

1. The Résumé buttons in the hero, nav (desktop and mobile menu) and contact block download `/Shubham_Jain_General.pdf`, and that URL serves the PDF.
2. The timeline reads Founding Software Engineer, Software Engineer 3, Software Engineer 2, Software Engineer 1. No "Associate"/"Junior" titles or "SE1/SE2/SE3" remain on the page.
3. Hero: blue packets travel between teal nodes, and clicking the hero sends a coral burst from the nearest node.
4. About, Experience, Work, Skills and Education headings play the reveal (typed eyebrow, rising title, teal underline) once on first view. Their text is readable before and after the animation.
5. Timeline: nodes light up as the scroll line reaches them; Synexar's node is coral, the rest teal; dates flip in.
6. Project cards: a teal light circles the border on hover and keyboard focus.
7. Theme toggle: the new theme spreads as a circle from the button where View Transitions exist, and switches instantly elsewhere. The hero canvas re-tints either way.
8. Hamster: bottom-left, below the nav and modal. Clicking plays eat → chew → hearts → next treat, increments "Fed N times today" (singular "time" at 1), and ignores clicks mid-chew. The count survives a reload the same day and reads 0 on a new day, including in an open tab after midnight. It's keyboard-operable with a spoken label and smaller on phones.
9. Skills: hovering or focusing a skill keeps its related skills lit and dims the rest; leaving restores all.
10. Colour: coral appears only in the current timeline node, the hero burst, and the hamster (hearts, counter, twinkle). No violet, pink or rainbow gradients.
11. Reduced motion: no hero animation loop, no heading/timeline/card/theme animation, and the hamster doesn't idle-animate.
12. `npm run lint` and `npm run build` pass.

## 6. How it is verified

| # | Verifies | Command or manual step | Expected |
|---|---|---|---|
| 1 | §5.8 day logic | `node scratch/check-hamster-count.ts` against `src/lib/hamsterCount.ts` (Node 24 type stripping): same day keeps the count, next day resets, malformed storage reads 0 | All assertions pass |
| 2 | §5.8 mutation | Remove the day comparison in `hamsterCount.ts`, rerun #1 | The next-day assertion **fails**; restore, passes again |
| 3 | §5.1 | `curl -I localhost:3000/Shubham_Jain_General.pdf`; grep rendered HTML for resume links | 200 `application/pdf`; all links point at the General PDF |
| 4 | §5.2 | `grep` rendered HTML and `content.ts` for "Associate Software Engineer", "Junior Software Engineer", "SE3" | No matches; "Software Engineer 1/2/3" present |
| 5 | §5.3–5.9 | Dev server + Chrome, in light and dark: hero click, heading reveal, timeline scroll, card hover, theme toggle, hamster feed ×2 + reload, skills hover | Each behaves as §5 states; record what was seen |
| 6 | §5.8 midnight | In the browser console, write yesterday's date into the storage key and reload; separately, advance the stored day under an open tab and fire `visibilitychange` | Reads 0 today |
| 7 | §5.10 | `grep` the diff for colour tokens; visual check in #5 | Coral used only in the three places |
| 8 | §5.11 | Read every reduced-motion branch in the diff; Chrome can't toggle the media query from this harness | Each animation has an explicit `reduce` guard (recorded as code-review evidence, not runtime) |
| 9 | §5.12 | `npm run lint`, `npm run build` (dev server stopped first) | Both pass |

## 7. Risks and rollback

- **Risk:** View Transition snapshots before next-themes updates the DOM, so no circle or a flash. **Mitigation:** apply the class synchronously in the callback; verify in Chrome in both directions.
- **Risk:** the heading refactor subtly changes spacing in five sections. **Mitigation:** `SectionHeading` reproduces the existing classes exactly; before/after screenshots of each section.
- **Risk:** the hamster covers content or controls bottom-left on small screens. **Mitigation:** z-40 under the nav and modal, smaller on phones; checked at phone width.
- **Risk:** after merge, `git pull` on local `main` refuses because the untracked `public/Shubham_Jain_General.pdf` would be overwritten. **Mitigation:** flag it in the PR; the identical untracked copy can be deleted before pulling.
- **Rollback:** each slice is its own commit; `git revert` any of them. The localStorage key is namespaced and harmless if left behind.

## 8. Confidence

**Pre-implementation: 74/100**

| Judgment | Assessment | Evidence |
|---|---|---|
| Cause identified, not just symptom | Feature work. Each requirement maps to a named file and a working prototype in the artifact | §3; artifact v5 source files |
| Fix addresses the cause | Prototypes are proven in plain JS; porting to React/Tailwind/next-themes is where they can break | next-themes timing finding |
| No other call site has the same defect | `resumePath` has 4 consumers, all read the one constant; `SpotlightCard` has 1 consumer; job titles render in 1 place | grep during recon |
| Verification distinguishes fixed from unfixed | Day logic gets a real mutation check; the visual items rely on manual browser observation | §6 |
| Blast radius fully examined | All five heading sites and the resume consumers were read | recon reads |

**What keeps this below 100:**
- The theme circle is untested against next-themes. It's designed around the effect-timing issue but not run.
- Visual fidelity of seven animations ported into a different styling system, in two themes, can only be judged by eye.
- Reduced-motion behaviour can't be exercised at runtime from this harness.

**What would raise it:** the circle working in Chrome in both directions with the canvas re-tinting; a clean before/after pass over all five headings; the user confirming the hamster and colours on the live preview deploy.

## 9. Security

Floor: tier 2. Results per `08-security.md`, filled in before the push gate.

| # | Check | Result | Note |
|---|---|---|---|
| 1 | Secret scan | pending | |
| 2 | Personal-data guard | pending | The General CV carries phone and email. Both are already public in `content.ts` and the tracked `Shubham_Jain_Resume.pdf`; adding it is the user's explicit request. Will record as accepted with that reason |
| 3 | Permission diff | pending | |
| 4 | No manifest/lockfile movement | pending | No dependency planned |
| 5 | Repo guards | n/a | `verify.security: null` |
| 6 | No hook bypass | pending | |
| 7 | Input-trust review | pending | localStorage JSON is parsed defensively |
| 8 | Dependency review | n/a | none added |
| 9 | Authorization touchpoints | n/a | no auth |
| 10 | Logging/output | pending | |
| 11 | Egress | pending | none expected |
| 12 | `/security-review` | pending | Last run picked up the wrong cwd; will run it against the worktree explicitly |

**Open findings:** none yet (checks not run).

## 10. Post-implementation

_Appended after verification runs. Do not fill in before._
