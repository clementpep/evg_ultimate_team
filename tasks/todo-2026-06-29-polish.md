# EVG Ultimate Team — Polish & Bugfix Session (2026-06-29)

## Goal
Fix the bugs Codex left behind. Clean, functional, mobile-first. Push to main = deploy.

## Tasks

### 1. App icon (the cup)
- [ ] Add `frontend/scripts/generate-icons.mjs` using `@resvg/resvg-js`
- [ ] Render `app-icon.svg` -> favicon-16/32, app-icon-192/512, apple-touch-icon (maskable safe padding)
- [ ] Visually verify each PNG is the gold cup on PSG gradient (not blank)

### 2. 5v5 pitch overlap
- [ ] Re-map each team into its own half (no overlap)
- [ ] Responsive height + chip/label sizing for mobile
- [ ] Ensure bench / referee / unplaced show every card
- [ ] Remove dead `chipSize` ternary

### 3. Squad discovery reveal (flat + black rectangle)
- [ ] Rebuild per-player reveal as premium FUT flip with branded card-back
- [ ] Clean transition between players, no black flash
- [ ] Keep progress counter + preload

### 4. Team view tap-to-close
- [ ] Tap anywhere closes the card modal (keep close button)
- [ ] Fix misleading hint text

### 5. Global review / dead code
- [ ] Remove unused `isReplay`, redundant `resetReveal()` in discovery-complete
- [ ] Remove unused imports / dead code found along the way

### Verification
- [ ] `tsc` / `npm run build` clean
- [ ] Run locally, confirm fixes visually (incl. mobile viewport)
- [ ] Commit step-by-step, push to main

## Review

All 5 tasks done, build clean, pushed to main (deploy triggered).

- **Icon**: root cause was blank PNGs (gradients never rasterized), not the SVG.
  Added `scripts/generate-icons.mjs` (@resvg/resvg-js), full-bleed bg for maskable.
  Verified the rendered 512px PNG = gold cup on PSG gradient.
- **Pitch**: root cause was both teams positioned across the full height (every
  role collided). Rebuilt as a flex column over a decorative pitch background.
  Verified collision-free at 390px width via Playwright screenshot (view + edit).
- **Discovery**: replaced flat fade with a FUT flip from a branded navy/gold
  card-back (no black face possible). Verified by build + structural reasoning.
- **Tap-to-close**: removed stopPropagation; tap anywhere closes; hint fixed.
- **Cleanup**: removed dead `isReplay`, redundant `resetReveal()`, localhost
  preconnect, dead `chipSize` ternary, unused `MouseEvent` import.

## Session 2 — Pack experience rework (2026-06-29)

- Integrated AI pack art (bronze/silver/gold/ultimate) + card templates.
- Compressed all heavy art to WebP (packs/cards ~50-180 KB, FUT cards ~150-190 KB
  from ~3 MB) via scripts/optimize-assets.mjs. App imports .webp.
- New shared `PackOpeningExperience`: pack -> burst -> reveal. Contour-safe
  (object-contain + drop-shadow, no rectangular bg -> kills the gold rectangle).
  Reward written into tier card template; player reveals use the FUT card.
- Reliable dismissal (button + tap), not animation-phase-gated -> fixes Android
  "stuck on card".
- PlayerCardReveal, PackOpeningModal, SquadDiscovery now delegate to it.
- First login: everyone opens an Ultimate pack -> own card; Paul then opens the
  "Pack Équipe" -> sequential teammate reveals -> compose CTA.
- PackCard redesigned around the real foil art.
- Verified via Playwright at 390px: pack phase, reward reveal, player reveal,
  packs grid.

### Follow-ups (not done, flagged to user)
- 6 player-card/wallpaper assets were modified before this session (left untouched).
- FUT card PNGs are ~3 MB each (~36 MB total, also duplicated in public/). Worth
  optimizing for mobile load, but out of scope for this bugfix pass.
- `react-card-flip` dep appears unused (hand-rolled flip instead).
