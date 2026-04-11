# Radiosync — Drug & Radiotherapy Explorer

A bilingual (FR/EN) reference web app, built under the aegis of the
[Société Française de Radiothérapie Oncologique (SFRO)](https://www.sfro.fr),
to help oncology clinicians decide **when and how long to stop systemic
anticancer therapies before radiotherapy**.

The app covers four radiotherapy modalities (normofractionated, palliative,
stereotactic, intracranial) and 158+ drugs across chemotherapy, endocrine
therapy, targeted therapy and immunotherapy.

---

## Quick start

```bash
npm install
npm run dev           # Vite dev server on http://localhost:3000
```

```bash
npm test              # Vitest, single run
npm run test:watch    # Vitest in watch mode
npm run build         # production bundle in build/
npm run preview       # serve the production build locally
npm run validate:data # sanity-check the drug catalog
```

The project uses **Vite + Vitest** (migrated from Create React App). Requires **Node.js 18+**.

## Project layout

```
index.html                Vite entry, CSP, OpenGraph, manifest, favicon
vite.config.js            build + Vitest config + dev CSP stripper
public/
  manifest.json           PWA manifest
  service-worker.js       offline cache (production only)
  sfro-logo.png, …        static assets served at /
src/
  App.jsx                 thin wrapper around DrugExplorer
  index.jsx               React entry point + service worker registration
  buildMeta.js            ⚠️ generated, do not edit
  components/
    DrugExplorer.js       orchestration: state, effects, main JSX
    translations.js       single source of truth for UI strings + drug class labels
    state/useAppStore.js  tiny in-memory store (theme, lang, filters, …)
    explorer/
      cards/DrugCard.js
      content/aboutContent.js
      hooks/useDebounce.js
      hooks/useModalA11y.js
      modals/AboutPopup.js
      modals/ColumnManagerModal.js
      modals/ErrorBoundary.js
      modals/HelpModal.js
      modals/ReferencesPopup.js
      search/SearchSuggestions.js
      ui/Badge.js
      ui/ColumnHeaderWithTooltip.js
      ui/LoadingFallback.js
  data/
    drugs.js              the drug catalog (single source)
    drugCatalog.js        wraps drugs.js, generates stable IDs
    references.js         bibliographic references keyed by string number
    ctProtocols.json      RT-CT protocol map
  utils/
    security.js           escapeCsvField, isSafeHttpUrl, readFavorites/writeFavorites
    text.js               getCellColor, highlightMatch, hasMeaningfulReferences, …
    markdown.js           tiny markdown renderer used by AboutPopup
scripts/
  generate-build-meta.js  prebuild step writing src/buildMeta.js
  validate-drugs.js       prebuild step validating the catalog
```

## Adding a new drug

1. Open `src/data/drugs.js` and add an object to the `allDrugs` array.
   The schema is:

   ```js
   {
     name: "Cisplatin",                // required, displayed in the table
     dci: "cisplatine",                // optional, INN
     commercial: "Platinol",           // brand name
     administration: "IV",             // "IV", "Oral", …
     class: "Platinum based drugs",    // must match a key in translations.fr.drugClasses
     category: "chemotherapy",         // chemotherapy | endocrine | targeted | immunotherapy
     halfLife: "30min to 2h",          // free-text, parsed for the half-life filter
     normofractionatedRT: "0",         // "0" | "24h" | "48h" | "3 days" | …
     palliativeRT: "0",
     stereotacticRT: "0",
     intracranialRT: "0",
     references: "[228,229]"           // comma-separated reference IDs in references.js,
                                       // or "[None]" to mark "no bibliography"
   }
   ```

2. If the drug class is new, add the French translation in
   `src/components/translations.js` under `fr.drugClasses`.
3. Add any new bibliographic references to `src/data/references.js`,
   keyed by their identifier string.
4. Run `npm run validate:data` — it checks that:
   - every required field is present
   - the category is one of the allowed buckets
   - the slugified id (`name`-`class`) is unique
   - every cited reference number exists in `references.js`
   - reports orphan (uncited) references as a non-blocking warning

CI fails the build if `validate:data` fails.

## Color semantics (radiotherapy delay cells)

| Color  | Meaning                       | Examples                  |
|--------|-------------------------------|---------------------------|
| Green  | No delay required             | `0`, `0 (except IV)`      |
| Yellow | Short delay (≤ 48h)           | `24h`, `48h`, `24h to 48h`|
| Red    | Long delay (> 48h, days/weeks)| `3 days`, `21 days`       |
| —      | Free-text note (no rule)      | `No concomitant association: …` |

The legend in the table footer reflects this.

## Keyboard shortcuts

| Shortcut    | Action                          |
|-------------|---------------------------------|
| `⌘K` / `Ctrl+K` | Focus the search input      |
| `?`         | Open the keyboard help modal    |
| `↑` / `↓`   | Navigate search suggestions     |
| `Enter`     | Pick the highlighted suggestion |
| `Esc`       | Close the active dialog         |

## Sharing a filtered view

The current filters, search term and sort column are mirrored to the URL
query string (`?q=…&category=…&class=…&halfLife=…&sort=…&dir=…`). Use the
**Copy link** button next to the filter chips to copy a shareable URL.

## Offline / PWA

In production builds, `src/serviceWorkerRegistration.js` installs a small
service worker (`public/service-worker.js`) that:

- pre-caches the app shell on install
- serves navigation requests network-first with a fallback to the cached shell
- serves static assets cache-first with background revalidation

Once the main JS chunk has been cached, the entire drug catalog is bundled
inside it, so the app keeps working without a network connection.

## Tests

```bash
npm test                       # all suites
npm test -- --watchAll=false   # CI mode, single run
```

The test suites cover the security/text helpers and a smoke test for
`<App />`. Component-level tests live alongside their components in
`src/components/explorer/**`.

## Deployment

```bash
npm run build
```

Outputs static assets in `build/` ready to serve from any CDN. Deployed on
Vercel; the `Analytics` and `SpeedInsights` components are imported in
`src/App.js`.

## Contact / contributing

Suggestions, corrections and new molecules can be sent to
[contact@sfro.fr](mailto:contact@sfro.fr).

## License

© SFRO — Société Française de Radiothérapie Oncologique. All rights reserved.
