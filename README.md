# 🛼 Wheel of Skate

> A spin-the-wheel trick randomiser for aggressive inline skating — pick your grind and go.

---

## What is it?

A mobile-first web app that puts **49 aggressive inline grind tricks** on a colour-coded spinning wheel. Tap spin, land a trick, repeat. Great for session warm-ups, trick challenges, or just breaking out of muscle memory.

---

## Features

|                              |                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 🎡 **Fixed 12-sector wheel** | Always shows ~12 tricks regardless of how many categories you select — the wheel never feels sparse or overwhelming |
| 🔀 **Reshuffle**             | One tap picks a fresh random 12 from your selected categories, without changing your settings                       |
| ⏭️ **Skip a trick**          | Can't (or won't) do that one? Skip it — it's excluded from the session until you reshuffle                          |
| 🎲 **Variations overlay**    | Toggle on "Add Variation" to append a random modifier to each result — _Makio — Topside_, _Soul — Fakie_, etc.      |
| 🕑 **Session history**       | Last 5 results as colour-coded pills — tap a pill to mark it landed, missed, or skipped                             |
| 🚫 **No immediate repeats**  | After landing a trick the wheel quietly refreshes, making it impossible to land the same trick twice in a row       |
| 🎛️ **Custom trick mode**     | Hand-pick exactly which tricks and variations go on the wheel — selection is saved to IndexedDB between sessions    |
| 📱 **Mobile-first**          | Wheel scales to fill whatever screen you're on, up to 480px. Tap targets are large, no pinching needed              |

---

## Trick categories

```
Groove Grinds  ·  24 tricks   →  Backside, Makio, Royale, Mizou, X-Grind …
Soul Grinds    ·  14 tricks   →  Acid, Soul, Torque Soul, Mistrial, UFO …
Special Names  ·  11 tricks   →  Kindgrind, Fishbrain, Cab Driver, Porn Star …
Variations     ·  21 modifiers →  Topside, Fakie, Truespin, Alleyoop, Darkside …
```

Tick any combination of categories — the wheel always fills to 12.

---

## How it works

```
skate.html          ← single page, no framework
skate.js            ← wheel engine, spin physics, state, UI event handling
src/skate.css       ← all styles: dark theme, animations, responsive layout
src/data/
  groove-grinds.js        ← 24 tricks with hex colour per sector
  soul-grinds.js          ← 14 tricks
  special-name-grinds.js  ← 11 tricks
  variations.js           ← 21 variation modifiers
src/components/
  category-selector/      ← checkbox UI, triggers wheel rebuild on change
  trick-modal/            ← custom trick picker modal + IndexedDB persistence
  status-modal/           ← landed/missed/skipped outcome tracking
```

### Spin engine

The wheel is drawn on an HTML `<canvas>` element. Each tick of `requestAnimationFrame`:

1. Angular velocity is multiplied by a friction constant (`0.99`) until it drops below `0.002 rad/frame`
2. The canvas rotates via `transform: rotate()`
3. The sector under the pointer is read from `ang` and shown live on the centre button
4. When velocity hits zero, the result is locked in and shown

### Sector sampling

Every rebuild samples from the combined trick pool like this:

```
all tricks from checked categories
  → filter out skipped tricks (excluded Set)
  → filter out last-landed trick (prevent repeat)
  → shuffle
  → take first 12
```

If filtering leaves fewer than 3 candidates, the full pool is used as fallback so the wheel never goes empty.

---

## Running locally

No build step needed — the app uses native ES modules.

1. Clone the repo
2. Open `skate.html` via any local server

```bash
# e.g. with the VS Code Live Server extension, or:
npx serve .
```

---

## Colour system

Each trick has its own hex colour baked into the data files. Text on each sector is auto-contrasted — dark text on light sectors, white text on dark sectors — using a luminance check:

```js
(0.299·R + 0.587·G + 0.114·B) / 255 > 0.55  →  '#111'  else  '#fff'
```

---

_Built for the streets. No frameworks, no bundler, no nonsense._
