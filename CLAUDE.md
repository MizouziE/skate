# Skate Trick Spinner

## Project Overview

A wheel-of-fortune style spinner web app for randomly selecting skateboard (aggressive inline) grind tricks. Built with vanilla JS, HTML Canvas, and CSS. No build step required — ES modules loaded natively. Open `skate.html` via a local server (e.g. VS Code Live Server).

## Key Files

- `skate.html` — Main HTML page
- `skate.js` — Wheel logic, spin engine, UI event handling
- `src/skate.css` — All styling
- `src/data/groove-grinds.js` — 24 groove grind tricks
- `src/data/soul-grinds.js` — 14 soul grind tricks
- `src/data/special-name-grinds.js` — 11 special name grind tricks
- `src/data/variations.js` — 21 variations (used by variations overlay feature)
- `src/grabber.js` — Utility scraper (not part of app)

## Completed Improvements — Mobile-First Redesign

- [x] **Mobile Foundation** — `viewport-fit=cover`, dynamic canvas sizing with `visualViewport.height`, debounced resize handler
- [x] **Responsive Layout** — `<details>/<summary>` collapsible list selector, full-width wheel (max 480px), tappable pill-card checkbox labels with red accent
- [x] **Visual Polish** — `#1a1a1a` dark theme, auto-contrast sector text (`getTextColor()` luminance), dynamic font scaling, wheel ring shadow, spin button bg transition
- [x] **Interaction Improvements** — Pulse animation on spin, inline result banner with `max-height` expand animation, `fadeUp` on load, fixed listener accumulation bug
- [x] **Color Data Fix** — Fixed `#f2de6` → `#0f2de6` (Kindgrind), fixed `#44e40` → `#044e40` and `#d8b0b` → `#d8b00b` in variations.js

## Completed Improvements — Functionality Revamp

- [x] **Fixed wheel count** — Always shows ~12 tricks regardless of how many category checkboxes are ticked. Replaces the old double-`getRandomHalf` approach (which yielded ~4 tricks with one category, ~13 with three). Pool is: all tricks from checked categories → filter exclusions → shuffle → take min(12, available).
- [x] **Reshuffle button** — "Reshuffle" button below the wheel picks a fresh random 12 without changing category selection. Also clears the skip exclusion list and last-landed state.
- [x] **Variations overlay** — "Add Variation" toggle in the category list. When on, a random variation (e.g. "Topside", "Fakie", "Truespin") is appended to the result label after each spin.
- [x] **Skip a trick** — "Skip" button on the result toast. Permanently excludes that trick from the wheel for the current session and immediately re-spins. Cleared by Reshuffle or category change.
- [x] **Session history** — Last 5 landed tricks shown as a horizontal scrolling row of colored pills below the reshuffle button. Opacity fades older entries.
- [x] **Prevent immediate repeats** — After a trick lands, the wheel quietly rebuilds (400ms delay, while result is visible) excluding that trick, so the next spin can't immediately repeat it.

## Key State (skate.js)

- `excluded` — `Set` of trick labels the user has skipped; cleared on reshuffle/category change
- `lastLanded` — base trick label of the most recent result; used as `tempExclude` in next rebuild
- `sessionHistory` — array of `{label, color}` (max 5), most recent first
- `TARGET_COUNT = 12` — target number of sectors on the wheel
