# Loading feedback

User-approved direction: thin top loading line, existing content stays visible. Work completed in `C:\Users\erenb\Desktop\Sandbox\vue-erenboluk.com.tr`.

## Files

- New `src/components/RouteLoadingBar.vue`: router before/after/error hooks, 120ms reveal threshold, indeterminate accessible progressbar, reduced motion, cleanup. No artificial route delay or full-screen overlay. Handles overlapping/cancelled navigation, including clicking the currently displayed route during a pending import. Fast cached transitions need not show the bar.
- New `src/components/ProgressiveImage.vue`: reserved aspect ratio, near-viewport loading (240px margin), finite 4.2s shimmer then static placeholder, 300ms image fade, native async decoding, cached-load check, source-change invalidation, localized error fallback and observer cleanup.
- Updated `src/App.vue`: mounts the global loading bar, preserving earlier Home cursor behavior.
- Updated `src/views/HomeView.vue`: high-priority eager portrait; original crop, alt, dimensions and ASCII settings preserved.
- Updated `src/views/AboutView.vue`: progressive portrait; existing crop/frame retained.
- Updated `src/views/PortfolioView.vue`: lazy project images and eager dialog image. Existing URLs, descriptions, filters, controls and dialogs retained.
- Updated `src/localize/langs/en.json`, `tr.json`: additive loading.page and loading.imageError strings.
- New `tests/browser/aura-loading.cjs`, `aura-loading-lifecycle.cjs`.
- New `docs/superpowers/plans/2026-10-19-loading-feedback.md`, this report and `docs/aura/review/loading/` artifacts.

Small local brand SVG icons remain regular images; unnecessary placeholders/lazy loading were not added to navigation icons. No package or hosting changes.

## Verification

New tests first failed against the missing placeholder implementation. Real delayed image/chunk requests subsequently passed in both development and production. The cancelled-current-route fixture exposed a stuck progress bar; its regression failed before the cancellation fix and passed afterward.

- `aura-loading.cjs`: delayed image placeholder, eager/high-priority Home, unchanged portrait geometry before/after load, real delayed route indicator, current content preserved, pointer-events:none, far-offscreen request deferral, scroll-triggered loading and reduced-motion shimmer suppression.
- `aura-loading-lifecycle.cjs`: cached image emits once, source changes, malformed-image fallback, current-route cancellation, overlapping navigation, rejected route import and unmount. Fixture uses a memory router without changing existing production import-error recovery behavior.
- `npm run build`: passed, 424 modules, 1.48s. Existing Node experimental localStorage/DEP0205 warnings remain; no build failure. No separate typecheck/lint script exists.
- Existing `aura-regression.cjs all`: 12/12 passed, including mocked contact success/failure/cooldown and CV downloads.
- Existing `aura-sitewide.cjs`: both project modes/all filters/exact inventories/dialog focus, mobile navigation, repeated routes and eight localized deep-route metadata checks passed.
- Four axe WCAG2/2.1 A/AA scans on production Home/Portfolio at 390/1440px: zero reported violations; no horizontal page overflow.
- `git diff --check` passed with working-copy CRLF notices only.

Screenshots: `review/loading/image-pending.png`, `route-pending.png`, `mobile-home.png`, `mobile-portfolio.png`. `hero-before.json` is the pre-change portrait geometry; `accessibility.json` contains the four scan results. Placeholder screenshots use intercepted/delayed responses to make a genuine pending state reviewable without slowing the actual app.

Limitations: Chromium automation, no physical-device/Safari/Firefox/screen-reader certification. The loader can appear only after Vue/bootstrap JavaScript executes; this is not a pre-JavaScript boot splash. Static files may load quickly enough that no bar or shimmer is noticeable, intentionally. Image failure shows a quiet fallback while preserving alt text and layout. No remote writes, commit, push or deployment.

Preview: http://127.0.0.1:5177/tr
