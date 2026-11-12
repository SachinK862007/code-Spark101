# Project Guidance

## User Preferences

- Design only: the interface is a static visual prototype with illustrative sample data
- Warm, premium, editorial style; avoid excessive gradients, aggressive colours and generic glassmorphism
- Violet is the main interactive colour, marigold used sparingly, status colours only for meaning
- Desktop designed at 1440px with responsive tablet and 390px mobile frames
- The result should look like a real production-ready platform, not a generic admin dashboard
- Only basic functions need to work: clickables and visual interaction states

## Accepted Requirements

- Complete static frontend design for all URJA screens from the PDF
- Home / Ask Urja screen with cinematic hero, ask input and suggestion chips
- Ask Urja conversation screen with chat result cards
- Urja Voice Assistant screen with orb, states, controls and transcript panel
- Explore Map screen with static map, filters and location detail card
- Public Services Directory with categories, statistics and listing table
- Individual Public Service Detail with official vs public information panels
- Energy Intelligence Dashboard with metrics, charts and state comparison
- Energy Market Forecast API Explorer with endpoint explorer and response preview
- Method / About Urja editorial page
- Global navigation, search command palette and shared footer
- Responsive desktop and mobile layouts
- All content uses clearly labelled static sample data
- No feature is functional — design and visual interaction states only
- Persistent sidebar dashboard shell with top bar and stakeholder role selector
- Overview dashboard with KPI cards, energy mix, trends and quick actions
- D1 energy mix dashboard with filters and charts
- D2 RPO compliance tracker with calculator and configurable policy rates
- D3 rooftop solar ROI calculator
- D4 green jobs board with search, filters and detail view
- D5 green finance comparison engine
- D6 circular economy and recycler mapping module
- D7 environmental impact dashboard
- D8 energy forecasting and storage planner
- D9 role-based stakeholder portals
- Data sources and provenance screen with pipeline visual
- API explorer screen with sample endpoints
- Basic clickable interactions and visual interaction states only

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Frontend commands run from src/frontend/: typecheck `pnpm typecheck`, lint fix `pnpm fix`, build `pnpm build`; bindings via `pnpm bindgen` from the root.
- src/frontend/src/App.tsx is the routed app shell; src/frontend/src/components/layout/* holds Header, Footer, UrjaLogo, SearchPalette and Layout; src/frontend/src/components/shared/index.tsx holds the reusable presentation components; src/frontend/src/data/sampleData.ts holds the illustrative content; src/frontend/src/pages/* holds the nine page bodies.
- Biome rejects role="dialog" on a div (useSemanticElements) and requires a <title> child on inline SVGs (noSvgWithoutTitle); it also rejects <label> wrapping a Radix Select trigger (noLabelWithoutControl) and backtick strings without interpolation (noUnusedTemplateLiteral).
- src/frontend/index.html ships social meta tags (description, og:title, og:description, og:type, og:image, og:image:alt, twitter:card, twitter:image) that must never be removed, only updated.
- The design system lives in src/frontend/src/index.css and tailwind.config.js with cream, violet and marigold tokens and Fraunces, General Sans and JetBrains Mono fonts in src/frontend/public/assets/fonts/.
- The regression suite lives in src/frontend/src/__tests__ and the page test files; run it with `pnpm --dir app/src/frontend test`.
- D1 Energy Mix nav entry lives in DASHBOARD_NAV in src/frontend/src/data/greenGridData.ts; its route must also be added to DASHBOARD_PREFIXES in src/frontend/src/App.tsx to render inside the dashboard shell.
- The /energy/api route is absent from DASHBOARD_PREFIXES in src/frontend/src/App.tsx, so it renders in the public Layout shell while its sidebar link lives in the dashboard shell.
- ApiExplorerPage.tsx is a static design page with no queries or mutations; its request builder region selector and endpoint overview cards are asserted by src/frontend/src/pages/ApiExplorerPage.test.tsx.
- FilterChip from src/frontend/src/components/shared accepts data-* attributes via JSX even though its props type omits them; typecheck stays green.
- Biome rejects role="dialog" and role="group" on div, requires <title> on inline SVGs, rejects <label> wrapping a Radix Select trigger, and rejects backtemplates without interpolation.
