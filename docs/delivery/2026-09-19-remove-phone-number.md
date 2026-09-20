---
slug: remove-phone-number
tier: 2
confidence_pre: 68
confidence_post: 72
repo: Portfolio
base: origin/main
branch: chore/remove-phone-number
phase: pushed
created: 2026-09-19
---

# Remove the phone number from the portfolio site's pages

## 1. Original issue

> remove my phone number from my portfolio website compeletly.

## 2. What this change does

Before: the phone number is visible as a "tel:" button in the Contact footer and is published to search engines as `telephone` in the schema.org JSON-LD.
After:  neither carries it. The Contact row keeps email, Copy, Résumé, LinkedIn and GitHub.

**This does not remove it "completely".** Both résumé PDFs served from `public/` still print the number in their header line, and the owner chose to supply replacement PDFs rather than have them edited in place. Until those land, the number remains downloadable through every Résumé button. The number also stays in public git history. The PR states both.

The number is intentionally not written in this file (it is committed to a public repo). Verification commands use a local `$PHONE_RE` variable holding the number in its spaced, dashed, unbroken and `tel:` forms.

## 3. Where it touches

| File | What changes | Why |
|---|---|---|
| `src/data/content.ts` | delete `site.phone` and `site.phoneHref` | the single source of the value; removing it turns any missed consumer into a build-time type error |
| `src/components/Contact.tsx` | remove the phone button and the `PhoneIcon` import | the visible display |
| `src/components/JsonLd.tsx` | remove `telephone` | the machine-readable copy sent to crawlers |
| `src/components/Icons.tsx` | remove the now-unused `PhoneIcon` export | dead code once Contact stops using it (`grep PhoneIcon src` shows one consumer) |

**Blast radius:** `site.phone` is read by `Contact.tsx` and `JsonLd.tsx` only; `site.phoneHref` by `Contact.tsx` only (`grep -rn "phone" src`). The `contact` command in `terminal.ts` already prints only email, LinkedIn and GitHub. No tests exist. Downstream: the rendered HTML and the JSON-LD script tag.

**Deliberately NOT touched:**
- **`public/Shubham_Jain_General.pdf` and `public/Shubham_Jain_Resume.pdf`.** Both contain the number (confirmed with `pdftotext`). Owner decision 2026-09-19: they will supply replacement PDFs.
- **Git history.** The repo is public and earlier commits (content.ts, both PDFs) contain the number. Removing it means rewriting history and force-pushing, which needs explicit approval and still would not reach forks, clones, caches or the Wayback Machine.
- `CV/Shubham_Jain_Resume.pdf` and `Changes.docx`: untracked local files, not served.
- `docs/*.png`: two of seven opened (hero-dark, mobile); neither shows the footer. The other five are named for sections other than Contact and were not opened.
- The deployed site: changes reach visitors only after merge and Vercel redeploy.

## 4. Tier and why

| Axis | Score | Evidence |
|---|---|---|
| Blast radius | T1 | 4 source files, one consumer chain |
| Reversibility | T1 | `git revert` restores everything |
| Unknowns | T1 | the PDF-editing question was resolved by scoping the PDFs out |
| Verification | T2 | no test suite; proof is a production build, curl of rendered HTML, and a browser check |
| Contract | T1 | JSON-LD loses one optional field; no API or schema change |
| Data / security | T2 | removes PII, adds none, no auth path. "PII" is a T3 keyword read literally; scored T2 because exposure only shrinks. |

**Tier 2, set by the Verification axis; the owner confirmed tier 2 on 2026-09-19.**

### Approach

Chosen (owner, 2026-09-19): **remove the value and every consumer in source; leave the PDFs for the owner to replace.**

- *Scrub both PDFs in place with pypdf.* Rejected by the owner in favour of supplying their own.
- *Scrub General.pdf and delete the older Resume.pdf.* Rejected: the older URL would 404 for anyone who has it linked.
- *Add a test framework for a committed test.* Rejected: a new dev dependency and config, larger than the removal itself. The mutation check runs on the verification commands instead (owner approved 2026-09-19).

## 5. What good looks like

1. The Contact footer shows no phone button, and the remaining buttons wrap cleanly at desktop and phone width.
2. The rendered HTML of `/` contains no phone digits, no `tel:` link and no `telephone` JSON-LD key.
3. No tracked text file on the branch contains the number in any form.
4. `npm run lint` and `npm run build` pass.
5. The PDFs are unchanged, and the PR states that they still carry the number.

Not claimed: that the number is gone from the internet, from git history, or from the PDFs.

## 6. How it is verified

| # | Verifies | Command or manual step | Expected |
|---|---|---|---|
| 1 | §5.2 | `npm run build`, `npm start`, `curl -s localhost:3000 \| grep -cE "$PHONE_RE\|telephone"` | branch: 0. The same command on `origin/main`: non-zero (proves the check can fail) |
| 2 | §5.1 | browser at 1440px and 400px, scroll to Contact, screenshot | no phone button; buttons wrap without a gap or orphan |
| 3 | §5.3 | `git grep -nIE "$PHONE_RE"` on the branch and on `origin/main` | branch: no output. main: hits in `content.ts` |
| 4 | §5.4 | `npm run lint`; `npm run build` | both exit 0 |
| 5 | §5.5 | `git diff --stat origin/main...HEAD -- public/` | empty |

**Mutation check (no test file, approved):** rows 1 and 3 are run against `origin/main` first and must report the number; then against the branch and must report none. The failing output from main is pasted in section 10 after it is run.

### Observed (run 2026-09-19, production build served on port 3111)

| # | Observed | Matches expected |
|---|---|---|
| 1 | **origin/main `src/`:** rendered `/` (117,127 bytes) contained the number 4 times (3 spaced, 1 unbroken), 1 `tel:` link and 2 `telephone` matches. **Branch:** 116,131 bytes, 0 matches for any of them. JSON-LD keys on the branch: `@context @type address alumniOf description email hasCredential jobTitle knowsAbout name sameAs url worksFor`, no `telephone`. Email, LinkedIn, `Shubham_Jain_General.pdf` and the JSON-LD script are still rendered | yes |
| 2 | **Wide desktop** (the window resize did not take, so `innerWidth` was 2552, not 1440): one row of email, Copy, Résumé, LinkedIn, GitHub; 0 `tel:` links. **400px** (a 400px-wide iframe, since the window would not resize): three centred rows (email / Copy + Résumé / LinkedIn + GitHub), no orphan, no horizontal overflow (scrollWidth 385) | yes, at those two widths only |
| 3 | branch: digits-only `git grep` exit 1, no matches. Word-level grep (`tel:`, `telephone`) matches only prose in this file. main: `content.ts` lines 14-15 and `JsonLd.tsx:14` | yes |
| 4 | `npm run lint`: no warnings or errors. `npx tsc --noEmit`: exit 0. `npm run build`: compiled, 7/7 pages, exit 0 | yes |
| 5 | `git diff --stat origin/main...HEAD -- public/`: empty | yes (PDFs untouched, as scoped) |

The baseline run used `git checkout origin/main -- src`, built and served it, then `git checkout HEAD -- src`; `git status` was clean afterwards.

## 7. Risks and rollback

- **Risk:** the removal reads as complete when it is not (PDFs, history, caches) → **Mitigation:** stated in §2, §3 and §5 and repeated under "Open items before merge" in the PR.
- **Risk:** the Contact button row looks unbalanced without the fifth item → **Mitigation:** row 2 checks it at two widths.
- **Risk:** the tier 2 "new test" rule is not met → **Mitigation:** owner-approved substitute (§4 Approach).
- **Rollback:** `git revert` the change commit. Safe: it only restores the number to a site that showed it before.

## 8. Confidence

**Pre-implementation: 68/100**

| Judgment | Assessment | Evidence |
|---|---|---|
| Cause identified, not just symptom | yes | every occurrence located; `grep` over the whole tree for every number form finds only `content.ts` in text files, plus the two PDFs |
| Fix addresses the cause | partly | the pages: yes. The PDFs: deliberately not in this change |
| No other call site has the same defect | yes for source | `grep -rn "phone\|tel:\|telephone" src`; the terminal command already omits it |
| Verification distinguishes fixed from unfixed | designed, not run | rows 1 and 3 run on main and on the branch |
| Blast radius fully examined | mostly | `docs/*.png` not all opened |

**What keeps this below 100:** the issue says "completely", and after this change the number is still downloadable from both PDFs until the owner replaces them, and stays in public git history and third-party caches.

**What would raise it:** the replacement PDFs landing (verified with `pdftotext`), plus a before/after pass of rows 1 and 3.

## 9. Security

Floor: tier 2. Results per `08-security.md`. Run on the clean tree before implementing and again on the final diff.

| # | Check | Result | Note |
|---|---|---|---|
| 1 | Secret scan | pass | added lines: this file plus deletions; no key headers, tokens or credentialed URLs |
| 2 | Personal-data guard | pass | no phone digits or email address in added lines; the change removes personal data and touches no ignore rule |
| 3 | Permission diff | pass | changed paths: this file and four files under `src/` |
| 4 | Manifest / lockfile | pass | `package.json` and `package-lock.json` unchanged; `npm install` in the worktree left the tree clean |
| 5 | Repo guards | n/a | `verify.security` is null and the repo has no guard script |
| 6 | No hook bypass | pass | no `--no-verify`, no force |
| 7 | Input-trust | n/a | no input path touched; only static constants and one rendered link removed |
| 8 | Dependency review | n/a | no dependency added |
| 9 | Authorization touchpoints | n/a | the site has no auth |
| 10 | Logging and output | pass | the change reduces personal data in page output and JSON-LD; nothing new is logged |
| 11 | Egress | n/a | no new outbound call |
| 12 | `/security-review` | no findings | the skill's embedded diff was of an earlier, already-merged commit (the skills "+N more" toggle), not this branch, so this branch's diff was reviewed inline with no sub-agents. It is 13 deleted lines plus a docs file |

**Open findings:** none.

## 10. Post-implementation

**Post-implementation confidence: 72/100** (pre was 68, delta +4)

**What moved it:** the verification that was only designed at pre-score now ran on the real path. The identical check found the number 4 times, a `tel:` link and the `telephone` key on `origin/main` and none of them on the branch, so the check can tell fixed from unfixed. The footer was measured at wide desktop and 400px, and lint, type-check and build pass. Removing `site.phone` also means a missed consumer would have failed type-checking, and none did.

**What is still unknown:** the issue said "completely". Both résumé PDFs served from `public/` still print the number, so it stays downloadable from every Résumé button until replacement PDFs are supplied. That gap is why the score is 72 and not higher. The number also remains in public git history, and in forks, search-engine caches and any archive that already captured it. Not checked: the other five `docs/*.png` screenshots, phone width through a real window (an iframe stood in), and the deployed site after redeploy.

**Owner override:** none needed. Post-score 72 clears the push threshold of 70; the owner directed the push on 2026-09-19 after seeing slice 1 and before seeing this verification.
