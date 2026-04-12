# Contributing to blade

Contributions welcome — tricks, bug fixes, features, UI improvements. Here's how.

---

## Local setup

```bash
git clone https://github.com/MizouziE/blade.git
cd blade
npm install
```

Open `index.html` via a local server (native ES modules won't load from `file://`):

```bash
# VS Code Live Server extension, or:
npx serve .
```

---

## Running tests

```bash
npm test              # run once
npm run test:watch    # watch mode
```

Tests use [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) + [Chai](https://www.chaijs.com/) and run in Chrome. Test files live next to the code they cover: `src/**/*.test.js`.

---

## Adding tricks (good first issues)

Trick data lives in `src/data/`. Each file exports an array of objects:

```js
// src/data/groove-grinds.js
export const grooveGrinds = [
  { label: "Backside",  color: "#e63946" },
  { label: "Makio",     color: "#457b9d" },
  // ...
];
```

To add a trick:
1. Pick the right file (`groove-grinds.js`, `soul-grinds.js`, or `special-name-grinds.js`)
2. Add an entry with a unique `label` and a hex `color`
3. No tests required for pure data additions

Variations follow the same shape in `src/data/variations.js`.

---

## Code changes

- Write or update tests for any logic change — test files co-located with source
- Follow the existing module structure (no bundler, native ES modules)
- Prettier is configured (`.prettierrc`) — run it before committing:

```bash
npx prettier --write .
```

---

## Submitting a PR

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Ensure `npm test` passes locally
4. Open a PR to `main` — CI runs tests automatically
5. Add a short description of what changed and why

---

## Reporting bugs / requesting features

Use the issue templates — they're on the [New Issue](../../issues/new/choose) page.
