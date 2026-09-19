---
slug: remove-phone-number
tier: 2
confidence_pre: 68
confidence_post: null
repo: Portfolio
base: origin/main
branch: chore/remove-phone-number
phase: branched
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

Floor: tier 2. Results per `08-security.md`, filled after implementation.

| # | Check | Result | Note |
|---|---|---|---|

**Open findings:** not yet run.

## 10. Post-implementation

_Appended after verification runs. Do not fill in before._
