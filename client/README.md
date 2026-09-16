# FitCore web

React + TypeScript + Vite front end for FitCore. It renders; the API decides.

```
src/
  lib/       api client, types, formatting, catalogs, the demo store
  state/     language and theme
  components/ shell, design-system primitives, the wordmark
  screens/   sign in, onboarding, home, meals, add food, diet, training, session, progress, profile
```

## Two modes

| | |
|---|---|
| **Demo** (no `VITE_API_BASE`) | everything runs in the browser against `localStorage`, so the app can be opened and tried before the API is deployed |
| **Connected** (`VITE_API_BASE` set) | every screen talks to the ASP.NET API; Firebase Auth supplies the ID token |

`src/lib/engine.ts` carries the same formulas as `FitCore.Application` **only** to keep demo mode
honest. Once the API is in play the server is the single source for every number.

## Running it

```bash
npm install
npm run dev            # http://localhost:5173, /api proxied to http://localhost:5126
npm run build          # type-check then bundle
```

`.env.local`:

```
VITE_API_BASE=https://api.fitcore.app
VITE_FIREBASE_API_KEY=…
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_APP_ID=…
# VITE_HASH_ROUTER=1   only for static hosting with no rewrite to index.html
```

## Design

The palette is generated from the prototype's `tokens.json`, so the two never drift: colours are
CSS variables (`--c-surface`, …) and Tailwind reads them through `rgb(var(--c-x) / <alpha-value>)`.
`html.light` swaps the whole set, `dir` follows the language, and the wordmark ships in two cuts so
it stays visible in both themes.

Numbers render in the reader's own digits (`src/lib/format.ts`), except in fields that are about to
be typed over — those stay Latin so the keyboard behaves.
