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
(to be filled at the end)
