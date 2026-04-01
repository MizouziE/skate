# Skate Trick Spinner

## Project Overview
A wheel-of-fortune style spinner web app for randomly selecting skateboard (aggressive inline) grind tricks. Built with vanilla JS, HTML Canvas, and CSS. Bundled with Parcel.

## Key Files
- `skate.html` — Main HTML page
- `skate.js` — Wheel logic, spin engine, UI event handling
- `src/skate.css` — All styling
- `src/data/groove-grinds.js` — 24 groove grind tricks
- `src/data/soul-grinds.js` — 14 soul grind tricks
- `src/data/special-name-grinds.js` — 11 special name grind tricks
- `src/data/variations.js` — 21 variations (imported but unused)
- `src/grabber.js` — Utility scraper (not part of app)

## Completed Improvements — Mobile-First Redesign

- [x] **1. Mobile Foundation**
  - Added `viewport-fit=cover` viewport meta tag
  - Dynamic canvas sizing: `Math.min(innerWidth - 32, visualViewport.height - 160, 480)`
  - Debounced resize handler; uses `visualViewport.height` for accurate available height

- [x] **2. Responsive Layout**
  - List selector converted to `<details>/<summary>` — collapsed by default to save space
  - Full-width wheel fitting viewport with padding, max 480px
  - Larger, styled, tappable pill-card checkbox labels (custom checkbox, red accent when checked)

- [x] **3. Visual Polish** — Dark & gritty theme
  - `#1a1a1a` background, bold uppercase heading with letter-spacing
  - Auto-contrast sector text (`getTextColor()` luminance check — dark or white per sector)
  - Dynamic font scaling in canvas — proportional to radius, shrinks for long labels
  - Wheel ring shadow via `border-radius: 50%` + `box-shadow` on `#wheel`
  - Spin button: dark default bg, smooth background transition while spinning
  - Restored `#spin::after` arrow pointer (was broken by `overflow: hidden`, now fixed)

- [x] **4. Interaction Improvements**
  - Pulse CSS animation (`@keyframes pulse`) on spin start
  - Result banner appears inline above the wheel when spin stops, auto-dismisses after 4s
    - Uses in-flow `max-height` expand animation (avoids `position: fixed` reliability issues on mobile)
    - Result placed between `#listSelector` and `#wheelOfFortune` in DOM
  - `fadeUp` entrance animation on wheel load
  - Fixed listener accumulation bug — listeners registered once at boot, not inside `init()`

- [x] **5. Color Data Fix**
  - Fixed broken hex `#f2de6` → `#0f2de6` in `special-name-grinds.js` (Kindgrind)
  - Auto-contrast text handles all existing sector colors correctly

## Dev
No build step required. Open `skate.html` via a local server (e.g. VS Code Live Server). ES modules are loaded natively by the browser.
