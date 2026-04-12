# blade Trick Spinner

## Project Overview

A wheel-of-fortune style spinner web app for randomly selecting bladeboard (aggressive inline) grind tricks. Built with vanilla JS, HTML Canvas, and CSS. No build step required — ES modules loaded natively. Open `index.html` via a local server (e.g. VS Code Live Server).

## Key Files

- `index.html` — Main HTML page
- `blade.js` — Wheel logic, spin engine, UI event handling
- `src/blade.css` — All styling
- `src/data/groove-grinds.js` — 24 groove grind tricks
- `src/data/soul-grinds.js` — 14 soul grind tricks
- `src/data/special-name-grinds.js` — 11 special name grind tricks
- `src/data/variations.js` — 21 variations (used by variations overlay feature)
- `src/components/category-selector/index.js` — checkbox event handling, triggers wheel rebuild
- `src/components/category-selector/template.js` — HTML template
- `src/components/trick-modal/index.js` — custom trick selection modal logic
- `src/components/trick-modal/template.js` — modal HTML template
- `src/components/trick-modal/db.js` — IndexedDB persistence for custom selections
- `src/components/status-modal/index.js` — trick outcome tracking modal (landed/missed/skipped)
- `src/components/status-modal/template.js` — status modal HTML template

## Features

- Fixed 12-trick wheel from checked categories (groove, soul, special-name)
- Variations toggle — appends a random variation (e.g. "Topside", "Truespin") to the result
- Skip trick — excludes it for the session and auto-respins; cleared by reshuffle or category change
- Reshuffle — picks a fresh 12, clears exclusions and history
- Prevent immediate repeats — wheel rebuilds after each land, excluding the just-landed trick
- Custom trick mode — modal lets user hand-pick tricks and variations; persisted via IndexedDB
- Session history — last 5 tricks as colored pills with landed/missed/skipped status badges; click to update status

## Key State (blade.js)

- `excluded` — `Set` of trick labels the user has skipped; cleared on reshuffle/category change
- `lastLanded` — base trick label of the most recent result; used as `tempExclude` in next rebuild
- `sessionHistory` — array of `{label, color, status}` (status: `'landed'|'missed'|'skipped'`), max 5, most recent first
- `customMode` — boolean; true when user's custom selection is active
- `customTricks` — array of trick objects used in custom mode
- `customVariations` — array of variation objects for custom mode
- `customVariationsEnabled` — boolean
- `TARGET_COUNT = 12` — target number of sectors on the wheel
