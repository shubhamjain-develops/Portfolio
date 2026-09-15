---
slug: portfolio-personality-pass
tier: 3
confidence_pre: 64
confidence_post: 70
repo: Portfolio
base: origin/feat/portfolio-motion-pass @ f9bb2c2 (rebase --onto origin/main after PR #2 merges)
branch: feat/portfolio-personality-pass
phase: pushed
created: 2026-09-15
---

# Give the hamster a day of its own and the site an engineer's voice

## 1. Original issue

> give me some creative and unique ideas i can add to the hamster or in general to the website.

> Hamster: 1, 2, 3, 4(just make him exited no text.), 6. website: 1,2,4,6. /quest take this up.

> redesign the hamster a bit...

The numbered ideas being selected (from the brainstorm the owner answered):
- Hamster 1: sleeps at night (after ~11pm local, z-z-z; click wakes it with a yawn, then it eats).
- Hamster 2: cheeks fill through the day (each feed puffs more; at 5 it waddles off to stash and returns empty).
- Hamster 3: section props (laptop on Skills, hard hat on Experience, envelope on Contact).
- Hamster 4: excited when hovering Résumé/Email.
- Hamster 6: reacts to theme (sunglasses in light, nightcap in dark).
- Website 1: `whoami` terminal in the hero (`whoami`, `experience --current`, `skills | grep postgres`), answered from content.ts.
- Website 2: status-page parody footer ("All systems operational", uptime-style bars, "Available for hire", "Coffee: degraded", "Hamster: fed N× today").
- Website 4: Experience timeline toggle to a `git log --graph` view.
- Website 6: case studies as postmortems.

Decisions given by the owner:
- "Ship motion-pass first (Recommended)": PR #2 opened.
- "Yes, design preview first (Recommended)".
- Postmortems: "Existing facts only (Recommended)". Impact = outcome, Root cause = problem, Fix = what I did; no Timeline or Lessons.

## 2. What this change does

**Before:**
- The hamster looks and behaves the same at 3pm and 3am, in every section and theme.
- The hero shows a static thesis card.
- The footer is a copyright row.
- Experience has one view, and case studies have one format.

**After:**
- Late at night the hamster is asleep in a nightcap until clicked.
- Its cheeks visibly fill with each feed, and every fifth feed it waddles off to stash the food.
- It wears a hard hat on Experience, holds a laptop on Skills and an envelope on Contact.
- It's thrilled, with no text, when a visitor points at or tabs to Résumé/Email.
- It pushes sunglasses up in light mode; the nightcap is reserved for sleeping.
- The hero thesis is the resting output of a small terminal that answers from the site's own content.
- The footer opens with a status-page joke.
- The Kaveri case study can be read as a postmortem.

## 3. Where it touches

| File | What changes | Why |
|---|---|---|
| `src/lib/useActiveSection.ts` (new) | Nav scroll-spy moved into one module-level store, plus a rAF-deferred ResizeObserver | Nav and hamster must agree (H3) |
| `src/components/Nav.tsx` | Consumes the hook; also re-evaluates after layout changes | Single source of truth |
| `src/lib/hamsterCount.ts` | Rejects stored counts above 9999; `cheekLevel`, `isAsleep` pure helpers | H1/H2 testable outside a browser |
| `src/lib/useHamsterCount.ts` (new) | Read/write, same-tab event, cross-tab `storage` | Hamster, footer and terminal share one count |
| `src/components/Hamster.tsx` | Redesign, state priority, sleep, cheeks/stash, props, thrill, accessories | H0-H6 |
| `src/app/globals.css` | Hamster keyframes for new poses, reduced-motion statics | H1-H6 |
| `src/components/Terminal.tsx` (new) | Command table, log, history, completion | W1 |
| `src/components/Hero.tsx` | Thesis card replaced by `<Terminal />` with an SSR resting state | W1 |
| `src/components/StatusBoard.tsx` (new) | Status rows | W2 |
| `src/components/Contact.tsx` | Renders StatusBoard above the copyright row; narrow-screen bottom padding | W2 |
| `src/components/CaseStudyModal.tsx` | Case study / Postmortem toggle | W6 |
| `src/components/HeroCanvas.tsx` | Burst filter also ignores `input, [data-no-burst]` | Terminal clicks must not burst |
| `docs/portfolio-internals.html` | Architecture notes updated | The owner's interview prep stays true |
| `src/data/content.ts` | New `playful` block (terminal help, status labels, postmortem labels) | All copy in content.ts |

**Blast radius:**
- The nav scroll-spy (refactored).
- The existing localStorage key (read by three consumers now).
- The hero's first screen, as seen by crawlers and link previews (SSR resting output must still contain the thesis).
- The case-study modal focus trap (toggle inside it).
- Footer layout with the fixed hamster.

**Deliberately NOT touched:**
- `ThemeToggle`, `SpotlightCard`, `Skills` and `SectionHeading` from PR #2.
- The availability card copy.
- The old `Shubham_Jain_Resume.pdf`.
- The PDF CV wording.
- No analytics.

## 4. Tier and why

| Axis | Score | Evidence |
|---|---|---|
| Blast radius | T2 | Nav refactor, hero first screen, modal focus trap; all client-side |
| Reversibility | T2 | Revert the merge; no data shape change. Publication/caching is the only irreversible part |
| Unknowns | T3 | Nine features, an unchosen redesign direction, state interactions across H1-H6 |
| Verification | T3 | Mostly visual/interactive; time-of-day and theme combinations; no test runner in repo |
| Contract | T2 | localStorage shape unchanged; new consumers of it |
| Data / security | T2 | One new untrusted input (terminal text) plus stored count displayed in three places |

**Tier 3, set by the Unknowns and Verification axes, and by the owner's choice of a design preview first.**

### Design

#### A1. Problem statement
Today (open, unmerged PR #2, "motion pass"): a hamster sits fixed bottom-left, a named `<button>` at z-40. Click feeds it. A per-local-day count is stored in localStorage `portfolio-hamster-fed-daily` as {day,count}, validated by a pure `readCount` (stale, malformed or negative -> 0), with an in-memory fallback when storage is unavailable. Its eyes follow the cursor, and it gets excited when the cursor is near. It renders only after mount, and it looks the same all day. The rest of the page is a conventional portfolio: hero thesis card, a plain copyright row in the footer, one timeline format, one case-study format.

Needed: the nine features the owner chose:
- H0: light redesign
- H1: night sleep
- H2: cheeks fill, stash every 5
- H3: section props
- H4: excited on Résumé/Email, no text
- H6: theme accessories
- W1: hero `whoami` terminal
- W2: status-page footer
- W4: `git log --graph` timeline view
- W6: postmortem case-study view

Cost of the gap: no functional cost. The cost that matters is getting it wrong on a recruiter-facing page: hidden content, invented facts, clutter, accessibility regressions, or breaking the agreed colour and reduced-motion rules. Every choice below is judged against that.

#### A2/A3. Choices and rejections

##### Shared plumbing

**`useActiveSection()`**
- Chosen: the nav's existing scroll-spy moves into one hook, consumed by Nav and the hamster. The spy is: last section whose offsetTop has passed 32% of the viewport; last section wins at page bottom; "" above 120px scroll.
- One deliberate behaviour change for Nav: the hook also recomputes from a ResizeObserver on `<main>`. The git-log toggle or a height change then re-evaluates without a scroll. Today the nav pill can be stale until the next scroll after such a change.
- Rejected: IntersectionObserver with a -32%/-68% rootMargin plus a bottom sentinel. It would be equivalent, but it rewrites verified nav logic rather than moving it, and gains nothing over the existing offsetTop rule.
- Rejected: a hand-copied second listener, which can disagree with the nav.

**`useHamsterCount()`**
- Chosen: one hook around `hamsterCount.ts`. It dispatches a same-tab `CustomEvent("hamster:fed")` and listens to `storage` for other tabs.
- Every storage access is wrapped in try/catch; reads fall back to the in-memory value, because blocked site data throws SecurityError on read.
- `readCount` treats any stored count above 9999 as malformed (-> 0). There is no clamp, so the counter can never get stuck.
- Consumers: Hamster (read/write), the status footer row (read), the terminal `hamster` command (read).
- Why a hook rather than each consumer calling `readCount`: same-tab sync. A feed must update the footer immediately, and `storage` never fires in the tab that wrote.

**Copy**
- All new copy goes into `content.ts` under a new `playful` block: terminal help and errors, status labels and the coffee joke, postmortem labels.
- Facts are read from the existing exports only, never restated: thesis, jobs, periods, tech, skills, projects, availability, location, links.
- `content.ts` is hand-edited; no script generates it.

**Rendering**
- The hamster and every state that depends on clock, theme, storage or scroll stays mount-only: H0-H6 and the footer count. There are no server/client mismatches, and there is no layout cost because the hamster is fixed-position.
- The terminal's resting output (thesis) is plain content, identical on server and client.

##### H0 redesign
- Options in the preview: A golden-refined (recommended), B winter-white, C flat mascot. The owner picks before slicing.
- Accessory colours are finalised after the pick. For example, B needs a non-cream pompom and envelope to stay visible against white fur.
- Why not B: lower fur contrast on the light theme, and it reads as a new character.
- Why not C: its bold outline clashes with the site's soft illustration style.

##### Hamster state (H1-H6 combined)

**Pose**, highest priority first: stashing > yawning > chewing > asleep (curled low, eyes closed, z's) > thrilled (H4) > excited (cursor near) > idle.

**Headwear:**
- Asleep: nightcap.
- Otherwise, on Experience: hard hat.
- Otherwise: the theme accessory. Light theme gets sunglasses pushed up on the forehead; dark theme gets a nightcap.
- Trade-off: in dark mode the awake and asleep hamster share headwear. The curled pose, closed eyes and z's distinguish them, and so does the static "z" glyph under reduced motion.

**Held item:**
- Nothing while asleep or stashing.
- While chewing, the treat. The prop is set down and returns after chewing.
- Otherwise: laptop on Skills, envelope on Contact.

**Input:**
- Click, Enter or Space during stash, yawn or chew is ignored. The busy window is ~0 under reduced motion.
- H4 is ignored while asleep or stashing.
- A feed arriving from another tab updates cheek level only and never replays the stash walk.

**Accessible name:**
- The existing `aria-label` gains state: "Wake the hamster" while asleep; "Feed the hamster. Fed N times today." otherwise.
- The existing polite live pill announces the count change.
- No text is shown for H4.

##### H1 sleep
**Rule:**
- The hamster starts asleep on load when the visitor's local hour is >= 23 or < 6. 06:00 is our pick; the owner said "after ~11pm".
- Only a click, Enter or Space wakes it: a yawn, then it eats.
- Once awake, it stays awake while the visitor is active anywhere on the page (scroll, pointer move, key press, focus change; throttled).
- It falls back asleep after 2 minutes with no page activity, but never mid-chew.
- Proximity and H4 do not wake it.
- The 60s tick and `visibilitychange` re-check the hour. A tab open across 23:00 sends it to sleep at the next idle moment; across 06:00 it wakes.

**Trade-off:** night sleep is the owner's explicit request, so a late-night visitor sees it asleep until they click it.

**Rejected:** daytime idle sleep. The owner didn't ask for it, and it would hide the eye tracking during normal browsing.

##### H2 cheeks
- Cheek puff = count mod 5, derived; there is no second key.
- On a feed that makes the count a multiple of 5, it waddles left within its dock (stays on screen, 1.8s) and returns with empty cheeks.
- A reload at a multiple of 5 shows empty cheeks, with no replay.
- Under reduced motion there is no walk; the cheeks empty instantly.
- Rejected: a second pouch counter, which could drift from the displayed count.

##### H3 props
- Driven by `useActiveSection`. The bottom-of-page rule covers Contact on tall screens.

##### H4 excited on Résumé/Email

**Detection:**
- Delegated document `pointerover`/`pointerout`, ignored when `pointerType === "touch"`.
- `pointerout` only clears when `relatedTarget` is outside the same link, so moving between an icon and text inside one button doesn't flicker.
- `focusin`/`focusout` are ignored for 600ms after a touch `pointerdown`. Android focuses tapped links, and a tap must not stick.
- `pagehide` and `visibilitychange` clear the state, so it doesn't stick after a mailto handoff.

**Matching:**
- `closest("a[href]")`, then `href.startsWith("mailto:")` or `new URL(a.href).pathname === site.resumePath`.
- There is no content-built CSS selector, so no escaping problem.

**State:** faster hop, ear wiggle, three coral sparkles. No text.

**Rejected:**
- Data attributes in Hero/Nav/Contact: three components for one behaviour.
- A speech bubble: the owner said no text.

##### Eyes for non-mouse visitors
- On `focusin` of any element, the eyes glance toward it. On touch, they look toward the last tap point.
- The enlarged eye movement is then visible on phones and keyboard navigation too.
- Under reduced motion, tracking stays off, as shipped in PR #2.

##### H6 accessories
- Sunglasses are pushed up, never over the eyes.
- Rejected: lenses over the eyes, which would hide the eye movement the owner asked for.

##### Colour
- The budget is unchanged:
  - teal accent
  - the existing blue
  - coral only in the current-role node, the hero burst and the hamster
- Hamster additions use only its own fur/pink/cream, ink neutrals, teal and coral, with final tints set per chosen direction.
- Git log: graph teal, HEAD ref coral.
- Hashes are blue but `aria-hidden`.
- Rejected: "props use their own illustration colours", which reintroduces the rejected rainbow.

##### Docs
- `docs/portfolio-internals.html` (the owner's interview-prep architecture notes) is updated in the same PR. It then covers the hero terminal, the status footer, the `useActiveSection`/`useHamsterCount` hooks and the hamster state priority, so the notes never describe a site that no longer exists.

##### Motion-pass interplay
- HeroCanvas's click-burst filter extends from `a, button` to `a, button, input, [data-no-burst]`, and the terminal carries `data-no-burst`. Typing and selecting output never fires bursts.
- The constellation is canvas-positioned, not anchored to the thesis card, so it is unaffected.

##### W1 terminal

**Placement:** replaces the hero thesis card, same position.

**Structure:**
- A pinned resting block, `$ whoami` then name, role and `site.thesis`. It is never removed, capped, or scrolled away.
- Below it, a scrolling log region of fixed height (~7 lines) for command output, `role="log"`, capped at 60 rows, oldest dropped.
- `clear` empties the log only, never the pinned block. It is kept because the pinned block makes it safe.

**Commands:** help, whoami, experience [--current], skills [| grep term], projects, contact, resume, hamster, clear.
- `experience --current` prints the jobs with `current: true`, or "no current role" if none.

**Input:**
- A `<form>` wrapper, so the mobile Go key submits.
- A visible `$` label plus an accessible name.
- `aria-describedby` hint: "Type help. → completes, ↑ recalls."
- `maxLength` 80, 16px, never autofocused.
- Tab is untouched.

**Example chips:** a single tab stop with roving tabindex (arrow keys move). The terminal adds two tab stops before the CTA row.

**Output:**
- React text children only, plus `<a>` elements whose href comes from content.
- `hamster` only reads the count.

**Height gate:** the hero's rendered height at 400px and 1440px must be within +24px of today's. If it isn't, the log region shrinks before merge.

**Rejected:**
- A terminal below the CTA row: the hero gets taller by the whole terminal.
- A terminal as a tab on the thesis card: it hides one of the two by default, and a recruiter who never clicks the tab never sees the terminal.
- A hidden terminal mode: nobody finds it.

##### W2 status footer
**Layout:** a compact block above the existing copyright row. Headline: "All critical systems operational", consistent with one degraded non-critical row.

**Rows:** each row is a dot plus a text state, so status is never shown by colour alone.
- Availability: `availability.status`, already public on the site. The row is omitted when empty.
- Location: `site.location`.
- Hamster: "Fed N times today". Mount-only, in a fixed-width slot; an em dash before mount.
- Coffee: "Degraded".

**No uptime history bars:** varied bars would be invented history, and uniform bars are clutter.

**Hamster overlap:**
- The footer gains bottom padding on narrow screens, so the fixed hamster never covers a row at the end of the scroll.
- The hamster dock fades out on ≤640px while a text input has focus, so it never covers the terminal above the phone keyboard.

**Rejected:** a full status section; a nav status pill.

##### W4 git log
**Toggle:** a segmented control (Timeline | git log) of `aria-pressed` buttons. Default: Timeline.

**History:**
- Linear, on main; no branch or merge.
- One commit per job, newest first. HEAD sits on the job with `current: true`, or on the newest job if none is current.
- Education is the root commit. It is labelled `(root)` with its period, which is true: the degree precedes every job.

**Details:**
- The 7-hex hash is derived from title+company+period. The hash and graph glyphs are `aria-hidden`, so screen readers hear title, company, period, tech.
- The timeline re-measures its stops on remount.

**Rejected:**
- An SVG lane graph: more code for the same information.
- Both views at once: clutter.

##### W6 postmortem
**Toggle:** inside the case-study modal. The buttons persist, so focus stays. Default: Case study.

**Labels,** as the owner framed them:
- Impact = metrics + `result`
- Root cause = `problem`, verbatim
- Fix = `approach` steps, verbatim, as a plain list with decorative ticks
- Tech

**Left out:** no Timeline, no Lessons, no "Status: Resolved".

**Open trade-off, put to the owner before build:**
- In real postmortems, "Impact" means damage and "Root cause" means a fault.
- On Kaveri, "Root cause" still frames a named government system as at fault. On product projects (360° feedback, hospital intake), it reads oddly.
- The owner chose these labels. The alternative is to show the toggle only on Kaveri, the one project whose problem was a production degradation.

##### Reduced motion
**Already in PR #2:** the rAF loop is off, so no eye tracking, and the pose is static.

**Added in this change:**
- The z's are static glyphs.
- There is no yawn, hop or wiggle; the thrilled state shows perked ears and static sparkles.
- The stash empties the cheeks instantly, and the busy windows are ~0.
- The terminal caret is static.
- Toggles swap instantly.

#### A4. Rollout
Static front-end on Vercel (Next.js server build, not `output: export`). No data migration. The storage shape is unchanged.

**Branch and base:**
- Branch from `feat/portfolio-motion-pass`.
- After PR #2 merges, run `git rebase --onto origin/main feat/portfolio-motion-pass-at-branch-point` (the recorded fork SHA). This replays only this quest's commits, whether #2 was merge- or squash-merged.
- Before the first push, no force-push is needed.

**Waiting on PR #2:** the owner chooses one of two options.
- (a) Keep the branch local until #2 merges. The risk is a single local copy for the duration; the mitigation is a local bundle backup (`git bundle`) after each slice.
- (b) Push now as a draft PR stacked on #2. The post-merge rebase then needs a force-push to this feature branch, which is confirmed at that time.

**Deploy:**
- Vercel builds a preview for the pushed branch, and deploys main to production on merge.
- All features go live together. Stale-chunk errors in tabs opened before a deploy are pre-existing behaviour for every deploy of this site, not introduced here.

**Rollback:**
- Unit: the PR.
  - If merged with a merge commit (as PR #1 was): `git revert -m 1 <merge>`.
  - If squash-merged: `git revert <squash>`.
  - Either way the revert goes through a PR, then deploy.
- Slices are ordered so the tree builds after each one. Hamster slices share one component and are not claimed to revert independently.

**Point of no return: the first push.**
- The repo is public, and Vercel preview URLs are reachable.
- From then on, the copy and framing (the `playful` block, the HEAD/root labels, postmortem labels on named employers' projects) can be cached or archived.
- Mitigation: no new facts are published; every fact already appears on the site. The one framing risk that names third parties (W6 labels) is decided by the owner before build, not after.

#### A5. Observability
**Production signals:** there is no backend. Vercel Analytics (`@vercel/analytics`) already records page views. No custom events are added, since that would be new data collection.

**Healthy on the Vercel preview:**
- No console errors or hydration warnings.
- `/` first-load JS ≤ 190 kB; 180 kB was measured on PR #2, motion pass included.
- Lint and build green.
- Hero height within +24px of today's at 400px and 1440px, and unchanged after 10 commands.
- Lighthouse CLS unchanged.
- The nav pill and hamster prop agree while scrolling, and after toggling git log.

**Checks before push:**
- **Keyboard-only:** tab order hero → terminal input → chips (one stop) → CTAs → toggles → modal → hamster; → completion; no traps.
- **Screen reader:** names on the terminal input, log, chips, toggles and the hamster's asleep label.
- **Contrast** in both themes for the new coloured text: teal graph, coral HEAD ref, status states, and terminal dim text on the terminal ground, at ≥4.5:1.
- **Environments:** both themes; 400px width including the phone keyboard over the terminal; OS reduced motion on; night forced by overriding `Date` in the page; site data blocked, where the page must still render.
- **Pure node checks:** `isAsleep`, `cheekLevel`, `readCount` above 9999, `commitHash` uniqueness across jobs+education, and terminal command output vs the content exports. Each check is mutation-tested.

**Unhealthy signals:**
- A hydration warning naming Hamster, Terminal or StatusBoard.
- Hero or footer height changing after mount.
- A burst firing from a terminal click.

#### A6. Threat model

**13. Inputs**
- (a) **Terminal text.**
  - Matched against a fixed command table. grep is `toLowerCase().includes()`, never a RegExp built from input.
  - Output is React text children, plus `<a>` elements whose href comes from content, never from input.
  - Assumption: no terminal, status or postmortem path uses `dangerouslySetInnerHTML` or `innerHTML`.
- (b) **localStorage.**
  - Untrusted and possibly unavailable. Every access is try/catch with an in-memory fallback.
  - `readCount` rejects stale, malformed, negative and >9999 values.
  - A NaN count can never reach the cheek level, the footer or the terminal.
- (c) **Visitor clock and timezone.** They affect only the sleep pose; worst case is the wrong pose.
- (d) **Link hrefs** encountered by H4. They are read via `URL` parsing and compared as strings. Nothing is interpolated into selectors.
- (e) **content.ts.** Trusted, repo-controlled, hand-edited plain strings.

**14. Identity and tenancy:** none.

**15. Data lifecycle:** nothing new is stored. Terminal history is component state, capped, and gone on reload.

**16. Secrets:** none.

**17. Rollback safety:**
- A revert leaves no stored state behind.
- The only key was introduced by PR #2 and keeps its shape, so PR #2's code still reads it after a revert. This holds provided #2 itself is not reverted first.
- The `>9999 -> 0` rule only rejects values no real visitor can reach.

#### Cycle 3 amendments (folded into A1-A6; these override the text above where they differ)

#### H1 sleep: exact rule
Sleep applies only when the visitor's local hour is between 23:00 and 06:00. At 06:00 the hamster simply wakes: that is not "night", so the "only a click wakes it" rule no longer applies. Outside that window it never sleeps.

Inside the window:
- **On load:** it starts asleep.
- **Waking:** a click, Enter or Space runs yawn → chew. If that feed is the fifth, stash follows. The sequence is always chew then stash, and the treat is always seen being eaten.
- **Falling back asleep:** after 2 continuous minutes with no page activity.

The accessible name while asleep is "Wake and feed the hamster".

#### Feed rate
Every feed has a hard minimum interval of 400ms, including under reduced motion, and key auto-repeat (`event.repeat`) is ignored. Holding Enter cannot flood the count or the live region. Real visitors stay far below 9999 a day, so rejecting values above 9999 only ever catches corrupt storage.

#### Shared state
- **Count:** `useHamsterCount` is backed by one module-level store (value, in-memory fallback, subscribers). All consumers read the same value even when storage throws. The `hamster:fed` event carries the count.
- **Midnight rollover:** the existing Hamster sync (60s tick plus `visibilitychange`, which compares `localDay()`) moves into that store, so the footer and terminal roll over at midnight too.
- **Active section:** `useActiveSection` is likewise one module-level subscription, so Nav and the hamster can never disagree. Its ResizeObserver callback is deferred to rAF, so it cannot raise a "ResizeObserver loop" error.

#### W1 terminal
**Pinned block:**
- It shows `$ whoami`, then the thesis only. The name and role are already the hero heading, so they aren't repeated.
- The thesis is set in the site's sans at today's card size, not monospace, so non-technical readers get the same sentence they get today.

**Input:**
- `autocapitalize="off"`, `autocorrect="off"`, `spellcheck="false"`.
- Commands match case-insensitively after trimming.
- → completes only when the caret is at the end of the input.

**Log:**
- The log region is `tabindex="0"` with an accessible name, so keyboard users can scroll it.
- Links printed by `contact`/`resume` are ordinary tab stops that appear after output. Stated tab order: nav → hero heading area → terminal input → log → chips (one stop) → CTAs.
- The log scrolls with `behavior: "auto"`, never smooth.
- Errors never repeat the input: "command not found — try help". The prompt echo line is kept, because it only shows what the viewer themselves typed.
- There is no URL parameter or other way to pre-fill or run commands.
- External links get `rel="noopener noreferrer"` and `target="_blank"`.
- The terminal prints only fields that the site already shows.

**Height gate:**
- Measured at 400px and 1440px against today's hero.
- The log never drops below 3 lines.
- If the gate fails at 3 lines, build stops and it goes to the owner. Chips are not squeezed out.

**Trade-off:** a recruiter who never types sees the thesis plus a quiet prompt, roughly today's card with one extra line.

#### H4 scope
The link matcher ignores links inside `[role="dialog"]`, where the hamster is covered, and inside the terminal log.

#### Colour and contrast
- **Current-job coral** (`--c-warm` 201 78 44) on the light ground measures about 4.4:1, below 4.5:1 for small text.
  - So the git-log HEAD ref uses ink text with a coral dot and outline.
  - The dark theme (255 146 107 on near-black) passes.
- **Status footer:**
  - The degraded dot is a hollow ring in the dim neutral, with the text "Degraded". No warning colour is introduced.
  - Blue hashes are included in the 4.5:1 contrast check, even though they are `aria-hidden`.

#### W4 git log history
Linear history is correct against the content. Job periods are Aug 2021–May 2023, Jun 2023–Mar 2025, Apr 2025–Apr 2026 and May 2026–Present, with no overlaps. The degree runs 2016–2021, ending before the first job starts in Aug 2021. There are no internships in the content.

#### Decisions put to the owner, not taken alone
- **W2 wording:** "All systems operational" plus bars, vs "All critical systems operational" without bars. If the owner wants bars, they are built from real data: one bar per calendar year since the first job, filled from job periods. Also whether "Available for hire" or the existing `availability.status` is shown.
- **W6 labels:** on all four projects, or on Kaveri only.
- **Delivery:** (a) local until PR #2 merges, one PR. (b) A stacked draft PR now; GitHub keeps pre-force-push commits under `refs/pull/N/head`. (c) One PR per slice.
- **Wake time:** 06:00.

#### A4 point of no return, corrected
There are two irreversible steps:

1. **Merging this PR.** After that, PR #2 cannot be reverted on its own, because Nav's hook, Hamster and the HeroCanvas filter build on it. Rollback reverts this PR first, then #2 if needed.
2. **Public exposure.** Production visibility starts at that merge. Whether Vercel preview URLs are public depends on the project's Deployment Protection setting, which isn't known from the repo. Under option (b), the branch's commits become permanent on GitHub at the first push.

**Backup under (a):** the `git bundle` is only useful if it is copied off this machine. Otherwise the single-copy risk stands, and that is stated as a risk, not mitigated.

**Fork point:** recorded as a SHA in section 7 of the score file at branch time, never as a ref name.

#### A5 corrections
- **Pure checks:** they run as `node check-*.mts` using Node 24's native type stripping with relative imports, exactly as in PR #2 (`check-hamster-count.mts`). No dependency, no path aliases. They are not wired into CI, since the repo has none; they gate this quest's verification only.
- **Night testing:** the `Date` override is installed with a Chrome DevTools "run on new document" snippet before reload, so it is in place before hydration.
- **Reduced motion:**
  - The dock fade on input focus becomes an instant hide.
  - `useReducedMotion` from framer-motion is live, so an OS toggle takes effect without a reload.
- **Hamster overlap at 400px:** the fixed dock overlapping left-aligned content is pre-existing from PR #2. The new git-log graph column gets left padding equal to the dock width at ≤640px only while at the page bottom; otherwise this is accepted and checked by screenshot.

### Owner decisions at approval (override anything above that differs)

Approved by the owner on 2026-09-15, after seeing the preview (v2) and all three doubt-cycle tables.

**H0: direction A (golden, refined).** Owner: "go with the first one but remove the hat." Asked which hat: "Nightcap in dark mode".

**Headwear rule (replaces the rule in A3):**
1. Asleep: nightcap.
2. Otherwise, on Experience: hard hat.
3. Otherwise, light theme: sunglasses pushed up on the forehead.
4. Otherwise, dark theme: no headwear.

The A3 trade-off that awake and asleep share a nightcap in dark mode no longer exists. The nightcap now signals sleep and nothing else.

**W2: as designed.** No bars. Headline "All critical systems operational". Rows: Availability (`availability.status`), Location, Hamster, Coffee.

**W6: Kaveri only.** The Case study / Postmortem toggle appears only on the `kaveri` project. The other three show the case study with no toggle.

**Delivery: one PR after PR #2 merges.**
- Build locally.
- Once #2 merges, run `git rebase --onto origin/main <fork SHA>`.
- Open one PR against `main`.
- Never a stacked PR, never a force-push.

**Wake time: 06:00.** Offered as the default and not objected to.

**W1 height gate failed and went to the owner (2026-09-15).**

Measured in the browser at the 608px desktop card width, before the decision:

| Layout | Height | vs old card |
|---|---|---|
| Old thesis card | 93px | — |
| Terminal as built, at rest (`$ whoami` label, prompt row, example chips) | 190px | +97px |
| The same terminal after the first command (output log open) | 285px | +192px |
| Compact: thesis plus prompt row only | 125px | +32px |

The gate was +24px, so per the cycle 3 amendment the build stopped here and asked.

**Layout: owner chose "Compact; chips on phones".**
- The `$ whoami` label is dropped; the prompt row stays.
- The tap-to-run chips show only below 640px.

**Output area: owner chose "Open on first command".**
- The log is zero-height until the visitor runs a command. It then opens once (about 94px) and scrolls inside a fixed height.
- Page load never shifts. A shift caused by the visitor's own input doesn't count toward CLS.

The owner accepted +32px on desktop over the +24px gate. As built: 121px at rest on desktop (+28px); a 360px phone card with the one-row scrolling chips is +89px; the log adds 94px after the first command and clear collapses it again.


### Doubt cycle

Cycles run: 3

| # | Finding (cycle 1) | Class | Resolution |
|---|---|---|---|
| 1 | IntersectionObserver rejected for a false reason; a copied scroll-spy can drift from the nav | valid + actionable | Nav logic moved into shared `useActiveSection`, used by nav and hamster |
| 2 | Stacked PR retarget/squash can resurface commits or need a force-push | valid + actionable | Don't push until #2 merges; rebase locally before first push (never pushed, so no force-push). Stacked option put to owner |
| 3 | "Already-shipped counter" is false; it lives in an unmerged PR | valid + actionable | A6-17 reworded |
| 4 | localStorage, clock and terminal side effects not in the threat model | valid + actionable | A6-13 now lists the terminal, localStorage (clamped), the clock and content trust; `resume`/`contact` print content links; `hamster` read-only |
| 5 | Point of no return is publication, not "none" | valid + actionable | A4 names publication; no new facts are published ("Open to new roles" is already on the site: contract gap, noted) |
| 6 | Hamster slices can't revert independently | valid + actionable | Rollback unit is the PR; not claimed per slice |
| 7 | Hydration mismatches guaranteed | valid + actionable | Hamster stays mount-only (fixed, no layout); terminal SSRs the resting output; footer hamster row fixed-width slot |
| 8 | Terminal output growth shifts the CTA row | valid + actionable | Fixed-height log, internal scroll |
| 9 | Missing keyboard/SR/night/dark/mobile/reduced-motion checks; budget unjustified | valid + actionable | Added to A5; budget ≤190 kB against 180 kB measured on PR #2 |
| 10 | No state priority across H1-H6 | valid + actionable | Explicit pose/headwear/held-item priority and input rules |
| 11 | Time sleep hides tracking at night; 06:00 invented; timer can sleep mid-play | valid + actionable / trade-off | Rolling 2-min awake window after any interaction; 06:00 flagged to owner; late-night trade-off stated |
| 12 | Hat hides theme accessory; crowding near eyes | valid trade-off | Hat wins on Experience (stated); accessories stay above the eyes; judged in preview |
| 13 | Toggle/terminal height changes move the active section | valid + actionable | ResizeObserver on `<main>` in the hook; terminal fixed height |
| 14 | Timeline measurements stale after toggle; coral in git log unspecified | valid + actionable | Timeline re-measures on remount; HEAD ref coral (current role) |
| 15 | Contact may never trigger on tall screens | noise | Nav already has a bottom-of-page rule; the shared hook keeps it |
| 16 | Hamster covers footer rows at end of scroll | valid + actionable | Footer bottom padding on narrow screens |
| 17 | No sync between hamster and footer count | valid + actionable | `useHamsterCount` with same-tab event plus `storage` |
| 18 | Stash walk leaves frame; clicks/reload/reduced motion undefined | valid + actionable | Walks within dock, clicks ignored, no replay on reload, instant under reduce |
| 19 | "Root cause"/"Impact" frame projects as incidents; "Status: Resolved" invented | valid + actionable / trade-off | Status pill dropped; labels kept as the owner chose, default stays Case study; framing risk put to owner |
| 20 | Branch/merge graph invents history; hash collisions | valid + actionable | Linear history; hash of title+company+period |
| 21 | History bars are invented data or clutter; headline contradicts degraded row | valid + actionable | Bars dropped; "All critical systems operational" |
| 22 | "All copy from content file" is false | valid + actionable | New `playful` block in content.ts; facts read from existing exports |
| 23 | `clear` wipes thesis; client-only render loses it for crawlers | valid + actionable | No `clear`; resting output server-rendered |
| 24 | Terminal on phones is an unused input | valid trade-off | Tap-to-run chips; the resting state carries the thesis |
| 25 | "Own illustration colours" loophole reintroduces rainbow | valid + actionable | Accessories limited to ink, teal, coral and the hamster's own fur/pink/cream |
| 26 | B rejected for wrong reason (contrast unstated); accessories designed before pick | valid + actionable | Contrast reason added; accessories finalised after pick |
| 27 | Tab hijacked; no names/log role; autofocus; iOS zoom | valid + actionable | → completes, Tab untouched, `role=log`, label, no autofocus, 16px |
| 28 | H4 hover-only; touch sticks; child targets | valid + actionable | focusin/out, touch ignored, `closest()` |
| 29 | Exact href match fragile | valid + actionable | Selector built from `site.resumePath` |
| 30 | Hamster keyboard access unspecified | noise | Already a named `<button>` (PR #2) |
| 31 | Toggle semantics, modal focus, fake checkboxes, reading order | valid + actionable | `aria-pressed` buttons that persist (focus stays); decorative ticks on a plain list; newest-first matches the timeline |
| 32 | Reduced-motion specifics undefined | valid + actionable | Enumerated per state in A3 |
| 33 | Bar contrast | valid + actionable | Bars removed; dots paired with text states |

**Cycle 2 findings** (30 in total; numbered within the cycle):

| # | Finding (cycle 2) | Class | Resolution |
|---|---|---|---|
| 1 | The 60-row cap drops the thesis, and it scrolls away | valid + actionable | Thesis is a pinned resting block outside the capped log; `clear` restored, empties the log only |
| 2 | No evidence the terminal isn't taller than today's card | valid + actionable | Height gate: within +24px of today at 400/1440px, else shrink the log |
| 3 | IO rejection wrong; "verbatim" false once ResizeObserver added | valid + actionable | Rejection reworded; ResizeObserver stated as a deliberate nav behaviour change |
| 4 | Night+idle sleep hides tracking just like idle sleep | valid trade-off | Night sleep is the owner's explicit ask; daytime idle rejected as unrequested |
| 5 | `useHamsterCount` rejection a straw man | valid + actionable | Reason restated as same-tab sync |
| 6 | Plain `git rebase origin/main` replays #2's commits after squash | valid + actionable | `git rebase --onto origin/main <fork SHA>` |
| 7 | Squash vs merge assumptions contradict | valid + actionable | Rollback documented for both |
| 8 | Local-only branch has no backup; base can move | valid + actionable | Owner chooses local plus `git bundle` per slice, or an early stacked draft PR |
| 9 | Stale-chunk errors on deploy | noise | Pre-existing for every deploy of this site; not introduced |
| 10 | Point of no return is the first push (public repo, preview URLs) | valid + actionable | A4 moved to the first push |
| 11 | Cached framing about third parties | valid trade-off | HEAD is true; W6 labels decided by owner before build |
| 12 | localStorage read can throw and now takes down footer/terminal | valid + actionable | try/catch on every access, in-memory fallback |
| 13 | Content-built CSS selector unescaped | valid + actionable | URL-parse and compare pathname; no selector interpolation |
| 14 | Hydration from clock/theme/scroll | contract misread | Hamster already mount-only; stated explicitly in A3 |
| 15 | No current job → HEAD wrong | valid + actionable | HEAD on current or newest; `--current` prints "no current role" |
| 16 | 9999 clamp freezes the counter | valid + actionable | >9999 treated as malformed → 0; no clamp |
| 17 | Hero burst fires on terminal clicks | valid + actionable | Burst filter adds `input, [data-no-burst]` |
| 18 | `docs/portfolio-internals.html` goes stale | valid + actionable | Updated in the same PR |
| 19 | A résumé-sync generator could overwrite `playful` | noise | No generator exists; scripts are dev/build/start/lint only |
| 20 | Fixed hamster covers chips/input on phones | valid + actionable | Dock fades on ≤640px while a text input has focus; 400px check |
| 21 | Nightcap means both asleep and dark mode | valid trade-off | Curled pose, closed eyes and z's distinguish; owner's own pairing |
| 22 | Wake rules contradict; initial state unspecified | valid + actionable | Starts asleep at night; only click/Enter/Space wakes; proximity/H4 never wake |
| 23 | "Idle" meant cursor-not-near | valid + actionable | Any page activity keeps it awake once woken |
| 24 | Food vs prop held at once | valid + actionable | Prop set down while chewing |
| 25 | Cross-tab stash replay | valid + actionable | Storage-event feeds update cheeks only |
| 26 | Accessory colours fixed before direction pick | valid + actionable | Finalised after pick |
| 27 | Terminal adds tab stops before CTAs; completion undiscoverable; no form | valid + actionable | Chips a single roving tab stop; `aria-describedby` hint; `<form>` |
| 28 | Hashes read aloud; no contrast check | valid + actionable | Hashes `aria-hidden`; contrast ≥4.5:1 checks in A5 |
| 29 | "Impact"/"Root cause" invert meaning | valid trade-off | Owner decides before build: labels as chosen, or toggle on Kaveri only |
| 30 | Busy/asleep feedback; eyes invisible on touch/keyboard; hover flicker; Android focus stick | valid + actionable | State-aware aria-label; eyes glance at focus/tap; relatedTarget check; focus ignored 600ms after touch; clear on pagehide |

| # | Finding (cycle 3) | Class | Resolution |
|---|---|---|---|
| 1 | Sleep rules contradict; the idle rule reads as daytime sleep | valid + actionable | Sleep only inside 23:00-06:00; exact rule written |
| 2 | In-memory fallback per hook instance diverges | valid + actionable | Module-level store; event carries count |
| 3 | Held Enter under reduced motion floods feeds, live region, and wraps at 9999 | valid + actionable | 400ms minimum interval, `event.repeat` ignored |
| 4 | Height gate infeasible with no floor; name/role duplicated from h1 | valid + actionable | Pinned block is thesis only (h1 confirmed at Hero.tsx:65); log floor 3 lines; gate failure goes to owner |
| 5 | Mobile auto-capitalisation breaks commands | valid + actionable | Case-insensitive matching; autocapitalize/autocorrect off |
| 6 | Log not keyboard-scrollable; output links add tab stops; → at any caret | valid + actionable | Log `tabindex=0`; tab order restated; → only at end |
| 7 | Coral HEAD text fails 4.5:1; degraded colour unspecified | valid + actionable | Computed ≈4.4:1 on light → ink text with coral dot; degraded = neutral ring |
| 8 | Owner's W2 wording and bars changed without asking | valid + actionable | Put to owner; real-data year bars offered |
| 9 | Linear history / education-as-root may be false | noise | Checked content: periods don't overlap, degree ends before first job |
| 10 | Fixed hamster covers left content at 400px | valid trade-off | Pre-existing from PR #2; checked by screenshot |
| 11 | `portfolio-internals.html` not listed | noise | Already added to design (Docs) during cycle 3's run |
| 12 | Résumé PDF may be untracked | noise | `git ls-files` shows it tracked on the branch; untracked copy is main checkout only |
| 13 | Merging makes #2 unrevertable alone; preview exposure depends on Deployment Protection | valid + actionable | A4 corrected: two irreversible steps named |
| 14 | Stacked option (b) conflicts, retargets, duplicates | valid trade-off | Risks stated with option (b); (a) recommended |
| 15 | Same-disk bundle isn't a backup | valid + actionable | Stated: copy off-machine, else accepted risk |
| 16 | Input echo spoofing, URL prefill, exported-but-unshown facts, link rel | valid + actionable | Errors never repeat input; no prefill; terminal prints only shown fields; rel/target set |
| 17 | Node checks have no runner; Date override after hydration | noise / valid | Node 24 type stripping as in PR #2; DevTools new-document snippet |
| 18 | W6 decision contradictory; view swap not announced | valid + actionable | Pending owner decision |
| 19 | 5th feed never visibly chews; wake+stash undefined | valid + actionable | Sequence yawn → chew → stash |
| 20 | "Wake the hamster" understates the feed | valid + actionable | "Wake and feed the hamster" |
| 21 | Tab order list wrong (modal, nav) | valid + actionable | Restated |
| 22 | Matcher fires in modal/terminal; data-attr rejection inconsistent | valid + actionable | Ignore links in `[role=dialog]` and the terminal log |
| 23 | Two useActiveSection instances; ResizeObserver loop error | valid + actionable | Module-level subscription; rAF-deferred callback |
| 24 | Monospace thesis less readable for non-technical readers | valid + actionable | Pinned thesis set in the site sans at today's size |
| 25 | Reduced-motion gaps (fade, log scroll, live media query) | valid + actionable | Instant hide, `behavior:auto`, framer's live hook |
| 26 | Footer count stale past midnight | noise | Existing midnight sync (Hamster.tsx:87) moves into the shared store |
| 27 | Mono font CLS / budget | noise / speculative | IBM Plex Mono is already self-hosted by the site; budget measured |

**Stop condition:** three cycles run (the cap). Cycle 3 still surfaced real, detail-level defects. None changed the approach; all are folded in above. The design has been reviewed by subagents that share this model's blind spots; no cross-model or human review was run.

### Slices (Phase B)

| Slice | What it does | Tier | Own pre-score | Depends on |
|---|---|---|---|---|
| S1 | Content `playful` block; `hamsterCount` rejects >9999, adds `cheekLevel` and `isAsleep`; `commitHash`; node checks | 2 | 80 → **82** (967c052): 20 state + 9 count + 5 hash checks pass; 5 mutants killed (idle re-sleep, ceiling, hour guard, cheek modulus, hash separator); lint/build green, 180 kB. Unknown: the copy block is unused until S5-S8 | — |
| S2 | Shared module-level stores: `useActiveSection` (Nav moved onto it) and `useHamsterCount` (Hamster moved onto it, behaviour unchanged) | 2 | 72 → **76** (95426a3): visible-tab run shows the nav pill tracking about/experience/work/skills/contact, none over the hero, contact at page bottom; a 300px layout shift with no scroll moved the pill and back; feed, mid-chew ignore, other-tab storage event and stale day all correct; no console errors; lint/build green. Unknown: blocked site data not yet exercised | S1 |
| S3 | Hamster direction A redesign, state priority, H1 sleep, H2 cheeks/stash, 400ms feed floor, state-aware label | 2 | 64 → **72** (32425df): visible tab with the Date forced: opens asleep at 23:30 (closed eyes, z, label "Wake and feed"), click yawns then eats, clicks during yawn/stash ignored, re-sleeps after 2 idle min, activity keeps it awake, awake at 14:00; cheeks 1-4, fifth feed chews full then stashes and returns empty; repeated Enter prevented. Found and fixed: a wall clock set back locked feeding out (now monotonic), regression re-run passes. Screenshot of the sleeping pose checked. Unknowns: reduced motion and phone width not yet run; idle time advanced by clock, not waited | S2 |
| S4 | Hamster H3 props, H4 thrill, headwear rule, eyes on focus/tap, dock hide on narrow input focus | 2 | 66 → **70** (5c58f6d): owner checked props, headwear and the Email/Résumé reaction in their browser ("I checked it is working."). Automated in a background tab: mail and résumé hover thrill; icon-to-text inside one link stays thrilled; leaving, touch hover, other links and a mailto inside role=dialog do not; synthetic focusin thrills, focusout clears, focus within 600ms of a tap ignored; visibilitychange clears. Native focus events do not fire in an unfocused window, so keyboard focus was exercised through the handler, not the browser. lint/tsc/build green, 182 kB. Unknowns: section props and night-over-hard-hat not re-run by me; phone-width dock hide unrun | S3 |
| S5 | W1 hero terminal (pinned thesis, log, chips) plus HeroCanvas burst filter | 2 | 68 → **72** (890732c): check-terminal.mts 21/21 on real content, 3 mutants killed (case folding, input echo, RegExp grep); server HTML contains the full thesis sentence; in the browser → completion, case-insensitive commands, ↑ recall, 60-row cap, log scrolled to end, typed markup rendered as text, clear keeps the thesis, contact links carry target/rel. Height gate failed (+97px) and went to the owner; compact layout shipped at +28px desktop / +89px phone. Unknowns: burst suppression not observed at runtime (background tab pauses the canvas), phone keyboard and real touch not run | S1, S2 |
| S6 | W2 status block in the footer | 2 | 78 → **80** (c3d170e): browser shows the headline and Availability / Location / Hamster / Coffee rows with text states; feeding the hamster moved the row from 8 to 9 in the same tab; the footer carries pb-44 until 2xl. Unknown: overlap with the fixed hamster at 400px not screenshotted | S2 |
| S7 | W4 Experience Timeline / git log toggle | 2 | 74 → **74** (c7cb8a7): toggle aria-pressed flips; 5 commits (4 roles + degree root), unique hashes hidden from assistive tech, HEAD with coral dot on the current role; screen-reader text reads title (current role), company, period, tech; toggling back shows the timeline. Unknown: nodes lighting after toggling back needs a visible-tab scroll (automation tab was in the background) | S1 |
| S8 | W6 postmortem toggle, Kaveri only | 2 | 80 → **82** (5f8e1c7): Kaveri modal offers Case study / Postmortem; Impact contains the outcome, Root cause equals the problem and Fix equals the 5 approach steps, all verbatim; no timeline/lessons/status headings; the 360° modal has no toggle; reopening Kaveri starts on Case study. Unknown: focus after a real keyboard press on the toggle (programmatic clicks do not move focus) | S1 |
| S9 | `docs/portfolio-internals.html` updated for S2-S8 | 1 | 82 → **80** (c14a156): §07 points at useActiveSection.ts; new §11 (stores, sleep rule, monotonic clock fix, headwear priority) and §12 (terminal, status footer, git log, postmortem); Q&A state answer, bundle sizes (162 → 186 kB) and the Section server-component claim corrected; snippets copied from the committed code. Unknown: not rendered in a browser; section numbers in older prose were spot-checked, not all re-read | S2-S8 |

Overall pre-implementation confidence = minimum across slices = **64** (S3).

The tree builds and lints after every slice. S5-S8 don't depend on the hamster slices, so a stop after any slice leaves a shippable site.

## 5. What good looks like

1. **Night sleep.**
   - Between 23:00 and 06:00 visitor-local, the hamster loads asleep: curled, eyes closed, z's, nightcap.
   - A click, Enter or Space runs yawn → chew.
   - While the visitor is active, it stays awake. After 2 idle minutes it sleeps again.
   - Outside those hours it never sleeps.
2. **Cheeks and stash.**
   - Cheeks visibly fill on feeds 1-4.
   - The 5th feed chews, then waddles left within the dock and returns with empty cheeks.
   - A reload at a multiple of 5 shows empty cheeks.
   - Holding Enter feeds at most once per 400ms.
3. **Props.** Hard hat while the nav pill says Experience, laptop on Skills, envelope on Contact, including at the page bottom on a tall screen.
4. **Excited on Résumé/Email (H4).**
   - Pointing at or tabbing to any Email or Résumé link makes it thrilled, with no text shown.
   - Leaving clears it.
   - A touch tap does not stick.
   - Links inside the modal or terminal log do nothing.
5. **Headwear.** Light theme: sunglasses pushed up with the eyes fully visible. Dark theme awake: no headwear. Asleep: nightcap. Experience: hard hat.
6. **Eyes.** They follow the cursor, glance at the focused element, and look toward the last tap.
7. **Hero terminal.**
   - The thesis sentence is present in the server HTML, pinned, in the site sans.
   - `whoami`, `experience --current`, `skills | grep postgres`, `projects`, `contact`, `resume`, `hamster` answer only with content that's already on the site. Matching ignores case.
   - → completes at the end of the line; ↑ recalls.
   - `clear` empties the log only. Errors don't repeat the input.
   - Clicks in the terminal cause no burst.
   - The hero height is within +24px of today's at 400px and 1440px.
8. **Status footer.**
   - "All critical systems operational" with Availability, Location, Hamster and Coffee rows, each a dot plus text, and no bars.
   - The hamster row updates in the same tab on a feed.
9. **Postmortem view.**
    - The Kaveri modal has a Case study | Postmortem toggle: Impact = metrics + result, Root cause = problem, Fix = approach, all verbatim.
    - The other three modals have no toggle.
10. **Quality floor.**
    - With reduced motion on, everything listed in A3 and the cycle 3 amendments is static.
    - The page renders and counts with site data blocked.
    - No hydration warnings or console errors.
    - New coloured text is ≥4.5:1 in both themes.
    - `/` first-load JS is ≤190 kB.
    - Lint and build are green.
11. **Architecture notes.** `docs/portfolio-internals.html` describes the new hero, footer, hooks and hamster state priority.

## 6. How it is verified

| # | Verifies | Command or manual step | Expected |
|---|---|---|---|
| 1 | §5.1 | `node scratchpad/check-hamster-state.mts` (isAsleep across hours 22:59/23:00/05:59/06:00 and idle windows), mutation: drop the hour guard | All pass; mutated run fails |
| 2 | §5.1 | Chrome with a new-document `Date` override set to 23:30, then reload; click; idle 2 minutes; override to 14:00 | Asleep, then yawn and chew, then asleep again; never sleeps at 14:00 |
| 3 | §5.2 | node check `cheekLevel` and `readCount` (>9999 → 0), mutation; browser: 5 feeds, reload at 5, hold Enter 3s | Cheek levels 1-4; stash after chew; empty after reload; ≤8 feeds in 3s |
| 4 | §5.3 | Scroll through all sections in the browser, comparing the nav pill and the hamster prop | Always agree |
| 5 | §5.4 | Real hover and Tab to hero/nav/contact Email and Résumé; synthetic touch pointer; open modal and hover links | Thrilled on, cleared on leave; no stick; no reaction in modal or log |
| 6 | §5.5, §5.6 | Screenshot light/dark awake, asleep, Experience; focus a CTA; tap event | Correct headwear; eyes visible and displaced toward the target |
| 7 | §5.7 | `curl` the built page and grep the thesis; `node check-terminal.mts` (command table vs content exports, case, errors don't echo input), mutation; browser: →, ↑, clear; canvas burst probe on terminal click; measure hero height against PR #2 at 400/1440 | Thesis in HTML; checks pass/fail as expected; no burst; height delta ≤24px |
| 8 | §5.8 | Browser: feed, read the footer row without reload | Row increments immediately |
| 9 | §5.9 | Open all four modals | Toggle only on Kaveri; text identical to content.ts |
| 10 | §5.10 | Chrome emulate reduced motion; block site data and reload; console read; contrast computed from tokens; `npm run build` size line; `npm run lint` | Static; no errors; ≥4.5:1; ≤190 kB; green |
| 11 | §5.11 | Diff review of the docs file against the final code | Every changed component described |

## 7. Risks and rollback

- **Risk:** the hamster state interplay (sleep, chew, stash, thrill, props) has timing edge cases. **Mitigation:** pure `isAsleep`/`cheekLevel` checks, one busy ref, an explicit priority order, and a forced-clock browser run.
- **Risk:** the hero height gate fails at 400px. **Mitigation:** log floor of 3 lines; if it still fails, stop and take it to the owner.
- **Risk:** PR #2 changes during review and moves the base. **Mitigation:** the fork SHA is recorded below; `rebase --onto` replays only this quest's commits, and conflicts get resolved locally before the first push.
- **Risk:** a single local copy while waiting for #2. **Mitigation:** accepted and stated. A `git bundle` helps only if the owner copies it off-machine.
- **Fork point:** `f9bb2c2dac36f698b0ab2714530fe93447fee53d` (origin/feat/portfolio-motion-pass at branch time).
- **Rollback:**
  - Before merge: delete the branch. Nothing is published.
  - After merge: `git revert -m 1 <merge>` for a merge commit, or `git revert <squash>` for a squash merge, via a PR, then Vercel redeploys.
  - The revert leaves the localStorage key and shape as PR #2 wrote them.
  - Reverting PR #2 requires reverting this PR first.
- **Rehearsal (Phase D), executed 2026-09-15:**
  - **What ran:** in a detached temporary worktree at `d6c6afd`, `git revert --no-edit f9bb2c2..HEAD` reverted all 17 commits.
  - **Result:** `git diff f9bb2c2 HEAD` came back empty, so the rolled-back tree is identical to the fork point that PR #2 already built and verified.
  - **Security floor item 17 (does the revert leave anything behind?):**
    - After the rollback, the hamster storage key `portfolio-hamster-fed-daily` and its `{day, count}` shape are unchanged.
    - None of the six new files remain.
    - There is no feature flag or new stored state that could leave a new code path live.
  - **Cleanup:** the temporary worktree was removed, and the branch head was not touched.
  - **Not rehearsed:** reverting the actual merge commit on main, because this PR is not merged yet. Both revert commands are listed above.

## 8. Confidence

**Pre-implementation: 64/100** (minimum across slices: S3)

| Judgment | Assessment | Evidence |
|---|---|---|
| Cause identified, not just symptom | Feature work: every requirement traces to an owner quote or answer | §1, owner decisions |
| Fix addresses the cause | Design reviewed across 3 adversarial cycles; 90 findings reconciled | Doubt cycle tables |
| No other call site has the same defect | Every consumer found: nav spy, 3 count consumers, burst filter, modal, docs | Recon greps of Nav, Hero, Contact, HeroCanvas and content |
| Verification distinguishes fixed from unfixed | Pure checks get mutation runs; interactive items rely on forced-clock and real-input browser runs | §6 |
| Blast radius fully examined | Hero first screen, nav, modal focus and footer overlap examined; Deployment Protection unknown | §3, A4 |

**What keeps this below 100:**
- S3's state machine timing (sleep × chew × stash × wake) can only be proven in a forced-clock foreground browser tab, and earlier in this project hidden automation tabs paused rAF.
- Whether the terminal fits the height gate at 400px is unknown until built.

**What would raise it:** a foreground forced-clock run of the full night sequence, and a measured hero height at 400px within the gate.

## 9. Security

Floor: tier 3. The design-time threat model is in A6. The security-floor checks from `08-security.md` run at step 7 on the composed branch.

| # | Check | Result | Note |
|---|---|---|---|
| 1 | Secret scan | pass | Across the 2,212-line branch diff, the only matches are this score file's own words ("Secrets", "Scan the diff") |
| 2 | Personal-data guard | pass | No email addresses or phone numbers added under `src` |
| 3 | Permission diff | pass | No `.claude`, Next/Tailwind/TS config, `.github`, Vercel or env paths changed |
| 4 | Manifest / lockfile | pass | `package.json` and `package-lock.json` unchanged |
| 5 | Repo guards | pass | `npm run lint` and `npm run build` green after every slice; final `/` first-load JS 186 kB (budget 190) |
| 6 | No hook bypass | pass | No `--no-verify` in any of the 17 commits |
| 7 | Input-trust review | pass | See the note below the table |
| 8 | Dependency review | n/a | No dependency added |
| 9 | Authorization touchpoints | n/a | No auth surface |
| 10 | Logging and output | pass | No `console.*` added; terminal errors never echo the input |
| 11 | Egress | pass | No fetch/XHR/beacon calls or new external URLs under `src` |
| 12 | `/security-review` | substituted | The skill reviews the main checkout's working tree, not this worktree. Instead, every changed `src` file was grepped for `dangerouslySetInnerHTML`, `innerHTML`, `new RegExp(`, `eval(` and `new Function(`, with no matches |
| 13 | Threat model | pass | A6 as designed; its one load-bearing assumption (no HTML sinks) verified by the grep in item 12 |
| 14 | Identity / tenancy | n/a | — |
| 15 | Data lifecycle | pass | No new storage keys; only the existing hamster key is read and written |
| 16 | Secret handling | pass | None handled |
| 17 | Rollback safety | pass | Rehearsal executed, see §7 |
| 18 | Per-slice re-check | pass | Lint, tsc and build per slice; each slice row records its evidence |

**Item 7, input-trust review:**
- **Terminal input:** matched against a fixed command table; grep is `includes()` on lowercased text; output is rendered as React text only.
- **localStorage:** read inside try/catch, and counts above 9999 are rejected.
- **Link hrefs:** parsed with `URL`; no CSS selector is built from content.
- **Tests:** mutants show `check-terminal.mts` catches both input echo and a RegExp-based grep.

**Open findings:** none.

## 10. Post-implementation

**Post-implementation confidence: 70/100** (pre was 64, delta +6). This is the minimum across slices, set by S4.

**Slice post-scores:** S1 82 · S2 76 · S3 72 · S4 70 · S5 72 · S6 80 · S7 74 · S8 82 · S9 80.

**What moved it:**
- **S3, the pre-score floor.** A foreground browser run with the clock forced to 23:30 proved the night sequence, the stash and the feed spacing. It also found a real defect: a wall clock set back locked feeding out. That is fixed, and the run was repeated.
- **S5's height gate.** It was measured instead of guessed. It failed, went to the owner, and shipped at the size they chose.
- **Pure logic.** 46 Node checks across three scripts (20 sleep and cheek, 5 hash, 21 terminal), plus the count check from PR #2. All 8 deliberate mutants were caught.
- **Rollback and security.** The rollback rehearsal was executed, and the security floor is clean.

**What is still unknown (why this isn't higher):**
- **Reduced motion:** verified by reading the CSS and JS branches, not at runtime.
- **Phones:** 400px width, the dock hiding while an input has focus, and real touch were not run.
- **Background-tab gap:** the hero burst staying quiet for terminal clicks needs a visible tab to observe live; the automation tab stayed in the background, where Chrome pauses rAF and scrolling.
- **S4 (props, headwear, Email/Résumé reaction):** confirmed by the owner in their own browser and by handler-level events, not by a scripted visible-tab run.

**Deviations from the approved design** (all recorded above):
- **Terminal height gate:** the owner chose the compact layout, +28px on desktop.
- **Feed count sync:** there is no `hamster:fed` CustomEvent; the module-level store makes it unnecessary.
- **Reduced motion:** the 700ms feed puff from PR #2 stays, and the 400ms floor still applies.
- **Unused copy:** `hamsterAsleep` was removed.

## 11. Post-approval change: W4 removed

After PR #2 merged and this branch was rebased onto `origin/main`, the owner reviewed the built site and asked to remove the Experience `git log` toggle (W4) entirely — quoted: "i donot like this git log thing... remove it."

**What was removed:**
- The Timeline | git log toggle and the `GitLog`/`Commit` components in `src/components/Experience.tsx`, restoring it to the pre-S7 version (verified identical to the rebased pre-slice-7 diff).
- `src/lib/commitHash.ts` (now unused).
- The `playful.experienceView` copy block in `src/data/content.ts`.
- The "git log view" bullet in `docs/portfolio-internals.html` §12.

**What this does to the record above:**
- §2, §3, §5 and §6 above have already been edited to describe the site as it now ships, with W4 removed.
- The **S7 row in the slice table** (§4, Phase B) is left as-is: it is an accurate historical record of what was built and verified at the time, not a description of what ships now.
- **Confidence is unaffected.** S7's score (74) was never the minimum; S4 (70) still is. Overall post-implementation confidence stays **70/100**.
- **Security and rollback are unaffected.** No new storage, no new external input; the change only removes a client-side view.
- `npm run lint`, `npx tsc --noEmit` and `npm run build` were re-run clean after the removal (see the commit for evidence).

**Push gate:**
- **Score:** 70 meets the threshold.
- **Owner decision:** push after PR #2 merges and this removal. PR #2 merged 2026-09-15; the branch was rebased with `git rebase --onto origin/main f9bb2c2`, rebuilt and re-linted clean before this removal.
- **Next steps:** commit the removal, rebuild/re-lint once more, then push and open one PR against `main`.
