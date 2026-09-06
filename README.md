# Shubham Jain — Portfolio

Personal site for **Shubham Jain**, Backend &amp; Distributed Systems Engineer (Bengaluru, India).

Live source: https://github.com/shubhamjain-develops/Portfolio

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 3.4, CSS-variable palette |
| Animation | Framer Motion 11 |
| Theming | `next-themes` — follows the OS, remembers the visitor's choice |
| Fonts | Sora + IBM Plex Sans/Mono, **self-hosted** via `next/font/local` |
| Deploy | Vercel |

Fully static: every route prerenders, there is no server-side work and no runtime data fetching.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npm run lint
```

## Editing content

**All copy lives in one file: `src/data/content.ts`.** Headline, intro, stats, jobs, case
studies, skills, credentials and contact details are typed objects there — you should never
need to open a component to change a word.

A few fields worth knowing:

- `site.url` — set this to your real domain after deploying. It drives OpenGraph tags and
  `sitemap.xml`.
- `site.github` — set to `""` and every GitHub link disappears from the site. No dead links.
- `site.resumePath` — points at `public/Shubham_Jain_Resume.pdf`. **Replace that file with
  your own PDF** (keep the filename, or change this field) — the one in the repo was
  typeset to match the site.
- `projects[].repo` / `projects[].demo` — add a URL and the case study grows a "View code" /
  "Live site" button. Leave them off and `confidential: true` shows the "proprietary work"
  note instead.

## Project layout

```
src/
  app/
    layout.tsx        fonts, metadata, theme provider
    page.tsx          section order
    globals.css       palette (light + dark), base styles, motion-safety
    sitemap.ts robots.ts icon.svg
  components/
    Nav.tsx           sticky nav, scroll-spy pill, mobile menu
    Hero.tsx          parallax hero
    HeroCanvas.tsx    cursor-reactive constellation (theme-aware)
    About.tsx         bio, count-up stats, availability card
    Experience.tsx    timeline with a scroll-drawn spine
    Work.tsx          case-study cards
    CaseStudyModal.tsx  accessible dialog (focus trap, Esc, scroll lock)
    Skills.tsx Education.tsx Contact.tsx
    Reveal.tsx CountUp.tsx SpotlightCard.tsx MagneticButton.tsx
    ScrollProgress.tsx ScrambleText.tsx ThemeToggle.tsx
  data/content.ts     ← all copy
  fonts/              self-hosted woff2
public/
  Shubham_Jain_Resume.pdf
```

## Accessibility &amp; motion

Every animation is gated on `prefers-reduced-motion` — Framer Motion components read
`useReducedMotion()`, and `globals.css` neutralises anything CSS-driven. The site is fully
usable, and fully readable, with motion off. The scramble effect keeps the real text in the
accessibility tree at all times, so it costs nothing in SEO or for screen readers.

## Deploying to Vercel

First push this folder to GitHub:

```bash
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/shubhamjain-develops/Portfolio.git
git push -u origin main
```

Then:

1. Go to https://vercel.com/new and import the `Portfolio` repo.
2. Framework preset is detected as **Next.js** — no build settings to change.
3. Deploy. Every later `git push` to `main` redeploys automatically.
4. Add your domain under **Settings → Domains**, then set `site.url` in
   `src/data/content.ts` to match and push again.
