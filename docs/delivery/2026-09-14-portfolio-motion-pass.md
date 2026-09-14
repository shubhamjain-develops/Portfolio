---
slug: portfolio-motion-pass
tier: 2
confidence_pre: 74
confidence_post: 78
repo: Portfolio
base: origin/main
branch: feat/portfolio-motion-pass
phase: scored
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
> Standing decisions from the proposal sessions (recommended options, not overridden by the user):
> - The Résumé buttons download the new General CV. Keep the old PDF until the user confirms deleting it.
> - Hamster: one treat at a time; treats rotate seed → strawberry → blueberry; smaller on phones; under reduced motion it stays still and only puffs its cheeks.
> - The theme switch uses View Transitions and is instant where unsupported.
> - Founding Software Engineer title unchanged. The 70% figure stays only as the existing text.
> - The skills highlight is included as the optional last step.
>
> **Added mid-quest by the user (2026-09-14), all during verification:**
> - "Remove open to remote. as i am open to hybrid or onsite also. suggest some thing else, if i like it we use that else scrape it". Offered three rewordings; the user chose **remove it**.
> - "1. also is it possible for the hamster to be more animated and it looks at your curser always. 2. remove  — the work that earned two promotions." Shown the five places the claim appears; the user chose **everywhere on the site**.
> - "it is still a bit static, like the body and eyes move but it is not that clear." Then: "i do not need much of body movment, it is fine as it is, i need iys eyes to move more".
> - Later ideas (sleeping hamster, props, whoami terminal, status footer, git-log timeline, postmortems, a hamster redesign) were deliberately split out into a follow-up quest stacked on this branch. The user chose to ship this one first.

## 2. What this change does

**Before:**
- Motion is the existing reveal-on-scroll and the hero constellation.
- The Résumé buttons download `Shubham_Jain_Resume.pdf`.
- The Center for Smart Governance roles read Junior / Associate / Software Engineer.
- The hero says "Open to remote".
- Two roles and a case study claim "earned two promotions".
- There's no hamster.

**After:**
- **Hero:** blue request packets hop between the teal nodes, and a click sends a coral burst out from the nearest node.
- **Section headings:** the eyebrow types in, the title's words rise out of a clip, and a short teal underline draws in.
- **Timeline:** each role's dot lights up when the drawn scroll line reaches it and its dates flip in. The current role glows coral.
- **Project cards:** a teal light circles the border on hover or keyboard focus.
- **Theme toggle:** the new theme opens as a circle from the toggle.
- **Hamster:** sits in the bottom-left corner.
  - Clicking feeds it, and "Fed N times today" resets at local midnight.
  - Its eyes follow the cursor anywhere on the page, its body leans gently toward it, and it gets excited when the cursor comes close.
- **Skills:** hovering one keeps related skills lit and dims the rest.
- **Content:**
  - The Résumé buttons download `Shubham_Jain_General.pdf`.
  - The three CSG roles read Software Engineer 1 / 2 / 3.
  - The hero shows just "Bengaluru, India", and the contact line reads "Based in Bengaluru."
  - The promotions claims are gone.

Visitors who ask their device to reduce motion get today's static site.

## 3. Where it touches

| File | What changes | Why |
|---|---|---|
| `public/Shubham_Jain_General.pdf` | Added, byte-identical to the ai-job-search copy | New CV the Résumé buttons serve |
| `src/data/content.ts` | `resumePath`; three CSG job titles; `skillLinks` pairs; `availability: ""` and the contact body; promotions claims removed | All copy/data lives here |
| `src/app/globals.css` | `--c-warm` token (both themes); hamster styles incl. the excited state and 168/124px size; `::view-transition-*` rules | Token + the slices that need plain CSS |
| `tailwind.config.ts` | `warm` colour | Tailwind access to the token |
| `src/components/HeroCanvas.tsx` | Packets along links; click fan-out burst and ring, listened for on the hero section | Hero |
| `src/components/Section.tsx` | New exported `SectionHeading`. The unused `Section` is unchanged | Shared heading |
| `About.tsx`, `Experience.tsx`, `Work.tsx`, `Skills.tsx`, `Education.tsx` | Inline eyebrow + h2 swapped for `SectionHeading` | Heading reveal in all five |
| `src/components/Experience.tsx` | Nodes light from the spine's sprung scroll progress, measured against the track; current role coral; dates flip in | Timeline |
| `src/components/SpotlightCard.tsx` | Masked conic edge light turning while hovered/focused | Cards |
| `src/components/ThemeToggle.tsx` | `startViewTransition` + circular clip, applying the theme class inside the callback | Theme |
| `src/lib/hamsterCount.ts` (new) | Pure `localDay` / `readCount` / `recordFeed` | Testable day rollover |
| `src/components/Hamster.tsx` (new) | SVG hamster, feed sequence, daily counter, cursor-following eyes and lean, excited state, reduced-motion path | Hamster |
| `src/app/page.tsx` | Mount `<Hamster />` | Place it on the page |
| `src/components/Skills.tsx` | Hover highlight using `skillLinks` | Optional last slice |
| `src/components/Hero.tsx` | Renders " · availability" only when non-empty | Show the location alone |

**Blast radius:**
- **Headings:** markup changes in every section that renders a heading, but the copy doesn't change.
- **Hero canvas, cards and theme toggle:** `HeroCanvas` only affects the hero background, `SpotlightCard` is used only by `Work.tsx`, and `ThemeToggle` is only in `Nav.tsx`.
- **Content:** `resumePath` is read by `Hero.tsx`, `Nav.tsx` (×2) and `Contact.tsx`. Job titles render only in `Experience.tsx`. `site.availability` is read only by `Hero.tsx`.
- **Hamster:** a new fixed element at z-40, which sits under the nav (z-50) and the case-study modal (z-70). It adds one window `pointermove` listener and one rAF loop, both skipped under reduced motion.
- **Unchanged:** no API routes, server data, metadata or JSON-LD changes, and no new npm packages.

**Deliberately NOT touched:**
- The old `Shubham_Jain_Resume.pdf`, kept until the user confirms deletion.
- `Contact.tsx`'s centred heading and the unused `Section` component.
- The hero title sweep and the 70% text.
- The "Currently" card's "Remote, or Bengaluru on-site / hybrid" line and Synexar's "Bengaluru — Remote" location.
- The General CV's own wording, which the user owns.
- The follow-up ideas listed in §1, which are a separate stacked quest.

## 4. Tier and why

| Axis | Score | Evidence |
|---|---|---|
| Blast radius | **T2** | 17 files across data, styles and 11 components. No exported contract |
| Reversibility | T1 | `git revert` per commit; the localStorage key is namespaced |
| Unknowns | **T2** | next-themes 0.4.6 applies the class in a `useEffect` after `setTheme`; aligning node ignite with the sprung spine |
| Verification | **T2** | No test suite. New Node checks with mutation runs, plus browser verification in a live dev server |
| Contract | T1 | No public API, schema or wire change |
| Data / security | T1 | localStorage holds `{day, count}` only; no new egress; no auth |

**Tier 2, set by the blast radius, unknowns and verification axes.** No hard escalator applies.

### Approach

- **Theme circle (chosen: View Transitions, applying the class ourselves).** Rejected: `startViewTransition(() => setTheme(x))` (snapshot shows the old theme), and a flat-colour overlay.
- **Timeline ignite (chosen: derived from the spine's own `scrollYProgress`).** Rejected: per-node `whileInView`.
- **Headings (chosen: `SectionHeading` in the existing `Section.tsx`).** Rejected: five inline copies.
- **Daily counter (chosen: pure helper in `src/lib/hamsterCount.ts`).** Rejected: logic inline in the component.
- **Hamster tracking (chosen: one rAF loop writing SVG attributes on refs).** Rejected: React state per pointer move, which would re-render the component every frame.
- **Implementation note:** the prototype's CSS keyframes were ported as framer-motion values inside components, keeping each slice to its own files.

### Mid-flight notes

- **Timeline defect.** Browser verification showed the lower nodes lighting immediately. While an article's Reveal wrapper is still transformed, Chrome makes it the article's `offsetParent`, so `offsetTop` read 0 (articles 3-4 at 0 instead of 1541 / 2092px). Fixed in its own commit by summing offsets up to the track, then re-sampled. Same file, same approach, so no escalation.
- **Scope additions by the user during verification.** The tagline removal (`content.ts` plus a one-line conditional in `Hero.tsx`), the promotions removal (`content.ts`), and the cursor-following hamster in two iterations (`Hamster.tsx`, `globals.css`). Each was requested explicitly, and each is a copy change or confined to the hamster files. No axis moves.

## 5. What good looks like

1. The Résumé buttons (hero, desktop nav, mobile menu, contact) download `/Shubham_Jain_General.pdf`, and that URL serves the PDF.
2. The timeline reads Founding Software Engineer, Software Engineer 3, 2, 1. No "Associate"/"Junior" or "SE1-3" titles remain.
3. Hero: blue packets travel between teal nodes; clicking the hero (not a link or button) sends a coral burst from the nearest node.
4. About, Experience, Work, Skills and Education headings play the reveal once on first view. Screen readers get plain text.
5. Timeline: nodes light when the scroll line reaches them, in order. Synexar's node is coral, the rest teal. Dates flip in.
6. Project cards: a teal light circles the border on hover and keyboard focus.
7. Theme toggle: where View Transitions run, the new theme spreads as a circle from the button; otherwise it switches instantly. The choice is saved.
8. Hamster feeding: bottom-left, below the nav and modal. Clicking plays eat → chew → hearts → next treat and increments "Fed N times today", ignoring clicks mid-chew. The count survives a same-day reload and reads 0 on a new day.
9. Skills: hovering a skill keeps related skills lit and dims the rest; leaving the grid restores all. Hover-only.
10. Colour: coral only in the current timeline node, the hero burst and the hamster. No violet, pink or rainbow.
11. Reduced motion: no hero loop, heading/timeline/card/theme animation, hamster idle animation or cursor tracking.
12. The hero eyebrow reads "Bengaluru, India", the contact line "Based in Bengaluru.", and "Open to remote" appears nowhere.
13. No "promotion" text anywhere on the site.
14. Hamster tracking:
    - The eyes follow the cursor anywhere on the page, fully turned about 80px away, up to 5.5 / 3.6 SVG units, with the sparkles moving further.
    - The body leans at most 7°.
    - It hops, perks its ears and sniffs faster when the cursor is within about 220px, except while eating.
    - With no cursor it glances around.
    - It's 168px wide (124px on phones).
15. `npm run lint` and `npm run build` pass.

## 6. How it is verified

| # | Verifies | Command or step | Observed |
|---|---|---|---|
| 1 | §5.8 day logic | `node check-hamster-count.mts src/lib/hamsterCount.ts` | 9/9 pass |
| 2 | §5.8 mutation | Same checks against a copy with the day comparison removed | "a new day reads 0" and "first feed of a new day is 1" **FAIL**; the real helper passes 9/9 |
| 3 | §5.8 browser | Dev server, JS clicks on the real button | Mid-chew click ignored; 2 feeds → "Fed 2 times today", stored `{"day":"2026-09-14","count":2}`; reload keeps 2; yesterday's stored value reads 0; dock at left 16px / bottom 12px, z-40 vs nav z-50 |
| 4 | §5.1 | `curl` the rendered page and the PDF | 3 rendered links → `/Shubham_Jain_General.pdf` (mobile menu renders on open); `200 application/pdf`, 69,618 bytes |
| 5 | §5.2 | Count titles in the rendered HTML | Founding / Software Engineer 3 / 2 / 1 once each; Associate, Junior, SE1-3 zero |
| 6 | §5.3 | Canvas pixel probe in a visible tab around a synthetic hero click | Coral pixels 92 → 865 within 200ms, 426 after 2s; blue steady at ~180 |
| 7 | §5.7 | Wrapped `startViewTransition` / `Element.animate`, toggled twice | `ready` resolved both times; the clip on `::view-transition-new(root)` grows from the toggle over 560ms; saved. In a hidden tab it rejected with "Document hidden" and the theme still switched (fallback works) |
| 8 | §5.4 | Computed styles after scrolling to About; rendered HTML | Eyebrow typed, caret faded, underline at full scale, all 7 words risen; all 5 headings have plain `sr-only` text |
| 9 | §5.5 | Reload from the top, step the scroll through the timeline | Before the fix: articles 3-4 measured at `offsetTop` 0. After: `0000` at load, nodes lit at the computed reach points 1037 / 1909 / 2743 / 3361px (2 samples lag one step: spring); coral/teal/teal/teal |
| 10 | §5.6 | Real mouse hover on the first card | `:hover` true, edge-light opacity 1, angle 140° → 197° in 400ms |
| 11 | §5.9 | Synthetic pointer events on the pills | Redis from heading: 2 partners lit, 39 dimmed. Angular: 4 partners, 37 dimmed. Leaving resets. `skillLinks` check 4/4, and a misspelt copy fails |
| 12 | §5.10 | `grep` src for colour tokens | `--c-warm` only in the token, hamster CSS, the Experience current node and the HeroCanvas burst |
| 13 | §5.11 | Read every reduced-motion branch | HeroCanvas, SectionHeading, Experience, SpotlightCard, ThemeToggle, and Hamster (feed and tracking) each guarded. Code-review evidence, not runtime |
| 14 | §5.12, §5.13 | Rendered HTML | Eyebrow "Bengaluru, India"; 0 × "Open to remote"; contact line updated; 0 × "promotion"; 360° card tagline "Designed, built and launched solo for 500+ users." |
| 15 | §5.14 | Browser probe + user review | **Partially verified.** The probe tab was hidden (rAF paused), so pointer-driven values stayed frozen. After two real-mouse hovers the eye transform read `translate(0.84 -1.87)` and the lean 3.2°, so the loop runs, but not a controlled measurement. The user viewed the first version and asked for bigger eye movement; the enlarged version (5.5 / 3.6 units, 168px) was hot-reloaded with no errors but has not been observed by me or explicitly confirmed by the user |
| 16 | §5.15 | `npm run lint`, `npm run build` (dev server stopped, fresh `.next`) | Pass at every slice; `/` first-load JS 180 kB |

## 7. Risks and rollback

- **Risk:** View Transition snapshot timing with next-themes. **Mitigation:** the class is applied inside the callback; verified both ways (#7).
- **Risk:** the heading refactor shifts spacing. **Mitigation:** classes match the originals; the underline adds 19px below each title, as intended.
- **Risk:** the hamster, now 168px, covers bottom-left content on small screens. **Mitigation:** z-40 and 124px under 640px. **Not checked at phone width.**
- **Risk:** a window-level pointer listener and a continuous rAF loop for the hamster cost CPU. **Mitigation:** the loop writes three attributes per frame with no React renders, and rAF pauses in hidden tabs. Skipped under reduced motion.
- **Risk:** after merge, `git pull` on local `main` refuses because the untracked `public/Shubham_Jain_General.pdf` would be overwritten. **Mitigation:** flagged in the PR.
- **Rollback:** each slice is its own commit; `git revert` any of them.

## 8. Confidence

**Pre-implementation: 74/100**

| Judgment | Assessment | Evidence |
|---|---|---|
| Cause identified, not just symptom | Feature work; each requirement maps to named files | §3 |
| Fix addresses the cause | The timeline port defect was found by verification and fixed | §4 mid-flight notes |
| No other call site has the same defect | `resumePath` 4, `SpotlightCard` 1, titles 1, `availability` 1; offsetTop measuring only in Experience; "promotion" 0 after the fix | grep |
| Verification distinguishes fixed from unfixed | Mutation runs for day logic and `skillLinks`; the timeline probe showed broken and fixed | §6 #2, #9, #11 |
| Blast radius fully examined | All heading sites and content consumers read | recon |

## 9. Security

Floor: tier 2, run on the composed branch diff `origin/main...HEAD`.

| # | Check | Result | Note |
|---|---|---|---|
| 1 | Secret scan | pass | Added lines grepped for key headers, AWS ids, bearer/Authorization, `user:pass@`, GitHub/`sk-` tokens, api_key/password assignments: no matches (re-run at push gate) |
| 2 | Personal-data guard | accepted | `public/Shubham_Jain_General.pdf` carries the user's phone and email, already public in `content.ts` and the tracked `Shubham_Jain_Resume.pdf`; publishing it is the user's explicit request |
| 3 | Permission diff | pass | No `.claude/`, `.github/`, `.gitignore` or `package.json` in the diff |
| 4 | Manifest/lockfile movement | pass | None |
| 5 | Repo guards | n/a | `verify.security: null` |
| 6 | No hook bypass | pass | Plain `git commit`; one amend on an unpushed HEAD to fix a count in its message |
| 7 | Input-trust review | pass | Only new input is localStorage, parsed in try/catch with a string day and a finite/positive count. Pointer events contribute coordinates only. No HTML sinks |
| 8 | Dependency review | n/a | None added |
| 9 | Authorization touchpoints | n/a | No auth |
| 10 | Logging/output | pass | No `console.*` added |
| 11 | Egress | pass | No network calls or new URLs in added code |
| 12 | `/security-review` | manual | The skill reads git context from the session cwd (the main checkout); instead, added `src` lines were grepped for HTML sinks, eval, network calls and URLs (none), plus #7 |

**Open findings:** none.

## 10. Post-implementation

**Post-implementation confidence: 78/100** (pre was 74, delta +4)

**What moved it:**
- **Up:** the two named pre-implementation unknowns were settled by runtime evidence. The View Transition resolved with the clip requested in both directions (§6 #7), and the timeline's line/node sync was sampled against computed geometry (§6 #9). Verification also caught and re-proved a real port defect, and the mutation checks fail when broken.
- **Down:** the earlier re-score draft sat at 82 before the user's late additions. The final hamster tracking tweak has not been observed in a browser by me or confirmed by the user (§6 #15), which is what takes it to 78.

**What is still unknown:**
- **Hamster eyes:** whether the enlarged movement now reads clearly to the user, and it hasn't been measured in a visible tab.
- **Reduced motion:** verified by reading every branch, not at runtime.
- **Skills highlight:** proven via React's pointer path with synthetic events, not a real-mouse hover.
- **Phone width:** not checked.
- **Browsers:** Chrome only; Firefox/Safari rely on the View Transition fallback and unprefixed `mask-composite`.
