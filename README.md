# Carbon Footprint Tracker

A privacy-first React app that estimates your annual carbon footprint from a short lifestyle quiz and suggests personalised actions to reduce it. All processing happens in the browser — there is no backend and no data leaves your device.

## Development

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
```

## Security

This application is designed with a minimal attack surface:

### Client-side only

- The app runs entirely in the browser. Quiz answers and results are never sent to a server, third-party API, or analytics endpoint.
- Persistence uses `localStorage` on the user's device only (`cft_quiz_results` key).

### Content Security Policy (CSP)

`index.html` sets a strict CSP meta tag for the production build:

- `default-src 'self'` — only same-origin resources by default
- `script-src 'self'` — no inline scripts or `unsafe-eval`
- `style-src 'self' 'unsafe-inline'` — stylesheets from this origin; inline styles permitted for React/Vite runtime styling
- `img-src 'self' data:` — local images and inline SVG/data URIs only
- `connect-src 'self'` — no external network requests
- `object-src 'none'`, `frame-ancestors 'none'` — blocks plugins and embedding

### localStorage validation

Data loaded from `localStorage` is parsed with `JSON.parse` and validated at runtime before use (`src/lib/storage.ts`). Each stored result must match the expected shape (string ID, numeric timestamp, complete quiz answers with string values, numeric totals and breakdown). Malformed, tampered, or version-mismatched data is rejected and the app falls back to an empty history rather than trusting an unchecked type cast.

### Dependency audit

Run `npm audit` before releases. The project targets zero known vulnerabilities in production dependencies.

### Linting

`eslint-plugin-security` is enabled to flag common JavaScript security anti-patterns during development.

## Emission data sources

Emission factors are drawn from DEFRA 2023, EPA inventories, IEA grid averages, and peer-reviewed dietary lifecycle research. See `src/data/emissionFactors.ts` for values and references.
