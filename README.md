# 4A0X1 CDC Study Guide — Redesign

A full visual redesign of [builtbysai/4a0x1-study-guide](https://github.com/builtbysai/4a0x1-study-guide)
(the Air Force 4A0X1 Health Services Management CDC quiz app). The original repo is untouched;
this is a standalone re-skin built to kill AI-slop patterns.

## Design thesis — "Flight line at dawn"

A study tool for airmen prepping for high-stakes CDC exams should feel like a calm mission brief,
not a casino. Warm paper (`#F6F3EA`), ink blue-black (`#1A2332`), one brass accent (`#8C6D1B`),
pine for correct, brick for incorrect. Barlow Condensed display / Barlow body / IBM Plex Mono
labels — all self-hosted, no CDN. Real typographic hierarchy (size, space, weight contrast),
a deliberate 4/6/10px radius system, purposeful iconography only where it aids scanning,
and human copy with no em-dash stuffing. Dark mode is a proper night-study theme, not a toggle.

## What changed

- **Visual layer only** — all quiz logic, spaced repetition, store, and question data are untouched.
- Killed: bold-everything headlines, 27 decorative lucide icons, rounded-2xl everywhere, em-dash copy.
- New: mission-brief home, ledger-style module list, calm session UI, typographic stats,
  recolored confetti, self-hosted type.

## Develop

```bash
npm install
npm run dev        # local dev
npm run build      # production build (base '/')
```

## Deploy (GitHub Pages, project site)

```bash
GH_BASE=/4a0x1-study-guide-redesign/ npm run build
cp dist/index.html dist/404.html   # SPA fallback
# push dist/ to the gh-pages branch
```

Live: https://builtbysai.github.io/4a0x1-study-guide-redesign/
