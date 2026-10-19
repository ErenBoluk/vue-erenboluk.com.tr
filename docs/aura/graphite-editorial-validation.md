# Graphite Editorial — sitewide validation

Date: 2026-10-19. Implemented by the main agent only, following the user's latest workflow instruction. All changes remain local and uncommitted in `C:/Users/erenb/.codex/worktrees/6ac1/vue-erenboluk.com.tr`. The original checkout and its existing work were preserved. No dependency installation, push, deployment or production environment change was performed in this phase.

## Delivered

The user-approved corrected homepage composition now supplies the shared header and visual vocabulary for Home, About, Portfolio and Hire Me. Typography, graphite surfaces, violet accents, framing, dividers, responsive spacing and controls are consistent across all eight localized routes. About retains its biography, four statistics, career narrative and four skill categories. Portfolio retains all nine metadata records, localized descriptions/highlights, category counts/filters, list/showcase modes, horizontal navigation and destinations. Contact retains its API URL normalization, exact request payload, submitting guard, success/reset, error handling and persisted 429 cooldown.

The global cursor remains available as a restrained 24px native-pointer-preserving ring. It is disabled for reduced motion/coarse pointers, hidden during keyboard/text entry/dialog interaction, and has no independent animation loop. Home keeps its approved local portrait movement. Other pages use scoped one-time section reveals with cleanup and visible static content.

## Changed or created files in this phase

Application changes:
- `src/App.vue` — shared header composition on every route, responsive clearance and route-change scroll reset.
- `src/assets/main.css` — shared editorial page, heading, section, metadata, tag and action styles.
- `src/components/SideMenu.vue` — shared brand/header and accessible name; mobile-only focus wrapping.
- `src/components/Cursor.vue` — restrained GSAP follower with capability/preference gating and cleanup.
- `src/components/CvDownloadModal.vue` — explicit Tab wrapping while retaining native dialog behavior and existing props/events.
- `src/views/HomeView.vue` — same approved design; clipboard-error email passed as a translation parameter.
- `src/views/AboutView.vue` — editorial profile, statistics, career and skills.
- `src/views/PortfolioView.vue` — editorial rows/showcase, filters/progress and accessible project dialog.
- `src/views/HireMeView.vue` — editorial contact layout, associated labels and accessible feedback; request/cooldown preserved.
- `src/localize/langs/en.json` and `tr.json` — paired project-arrow/error labels; clipboard failure parameterization preserves rendered wording.
- New `src/composables/useEditorialMotion.js` — scroll-root-aware section enhancement, refresh and teardown.
- New `src/utils/dialogFocus.js` — shared Tab/Shift+Tab wrap for native dialogs.

Verification/documentation:
- `tests/browser/aura-regression.cjs` — media-change synchronization in the existing regression suite.
- `tests/browser/aura-audit.cjs` — wait for visible rendered content/fonts/images before screenshots.
- New `tests/browser/aura-sitewide.cjs` — portfolio inventories/modes/filters, dialog focus, touch, navigation and metadata checks.
- `docs/aura/graphite-editorial-spec.md` and `docs/superpowers/plans/2026-10-19-graphite-editorial.md` — executed design/implementation status and later user overrides.
- This file, `docs/aura/graphite-editorial-validation.md`.
- `docs/aura/review/sitewide/` — 16 final EN/TR desktop/mobile PNGs, `responsive-accessibility.json`, `browser-all.json`, `browser-motion.json`, and `motion-profile.json`.
- Plan-scoped `.superpowers/sdd/2026-10-19-graphite-editorial/` — recovery ledger, pre-change snapshots and diagnostic evidence; not application files.

`src/router/`, localization initialization, `backend-hireme/`, package files/lockfile, Vite configuration, public hosting files and static SEO entrypoint have no diff. Every original tracked EN/TR translation leaf was compared with Git and preserved. The nine original project metadata records were compared with the pre-change snapshot and are identical.

## Verification actually run

| Check | Outcome |
| --- | --- |
| Production `npm run build` after final application fix | PASS; Vite 6.4.3, 414 modules |
| Full browser regression suite against local production preview | 12/12 PASS |
| Responsive geometry/content/error matrix | 32/32 PASS: EN/TR x four routes x 320/390/768/1440px |
| axe WCAG 2/2.1 A/AA scans | 16 scans, zero reported violations at 390/1440px |
| Portfolio expanded scenarios | Both modes, all four filters, exact inventories, details/focus return, removed-trigger fallback PASS |
| Touch/mobile menu | Focus containment, navigation/close and absent cursor follower PASS |
| Route/SEO checks | Eight localized titles/descriptions/hreflang/deep routes PASS |
| Effective 200% desktop zoom viewport | 720px reflow (1440/2) PASS |
| Clipboard denial | Truthful localized feedback PASS |
| CV | Modal semantics/Escape, deep-route download and delayed-request focus PASS |
| Contact | Local interception only: exact payload, duplicate guard, success/reset, failure/retry, 429 persistence/expiry PASS |
| Reduced motion | Initial/static layouts and live cursor preference change PASS |
| `git diff --check` | PASS; standard LF/CRLF conversion notices only |

Existing Node warnings remain: experimental localStorage without --localstorage-file and DEP0205 module.register deprecation. They predate the redesign and do not fail the build.

Tests used already available isolated Playwright/axe tools through `NODE_PATH=C:/Users/erenb/.codex/tmp/aura-browser-tools/node_modules`. Application dependencies were not changed. Commands: `node tests/browser/aura-regression.cjs all`, `node tests/browser/aura-sitewide.cjs`, `node tests/browser/aura-audit.cjs --screenshots`. `AURA_BASE_URL=http://localhost:5175` selected the local production build. No test contacted the real contact backend.

### Defects found and resolved

The pre-change browser baseline demonstrated missing contact label associations, project dialog semantics, route scroll reset and reduced-motion cursor support. Expanded checks exposed native-dialog Tab escaping with a single focusable control, now handled explicitly. Production testing also exposed Vue-i18n parsing a literal @ in the newly introduced clipboard-error message; the address is now a message parameter, leaving displayed wording unchanged. A logo accessible-name mismatch was fixed. The development-only Vue DevTools overlay reports its own ARIA issue; final axe scans ran against the production build, which does not include that tooling.

### Motion sample and practical limits

One headless Chromium desktop sample of a 40-step pointer move over the portrait recorded 1 layout event and 86 style recalculations. After settling, a 500ms idle sample recorded 0 layout events and 0ms script execution. Exact evidence is in `motion-profile.json`; this is not an FPS guarantee or a physical-device benchmark.

Keyboard behavior was exercised through browser automation and screenshots were visually reviewed. Physical iOS/Android devices, Safari/Firefox, assistive-technology screen readers, OS text scaling and manual Ctrl+zoom were not tested. The 200% check is an equivalent reduced viewport, not a claim of those manual tests. External font/image CDNs remain existing dependencies. Zero automated axe violations is not a blanket accessibility certification.

## Preview and screenshots

Development: http://localhost:5174/tr
Local production build: http://localhost:5175/tr
Both are local previews; nothing was deployed to Railway.

| Page | Desktop (TR) | Mobile (TR) |
| --- | --- | --- |
| Home | [Desktop](review/sitewide/tr-home-1440.png) | [Mobile](review/sitewide/tr-home-390.png) |
| About | [Desktop](review/sitewide/tr-about-1440.png) | [Mobile](review/sitewide/tr-about-390.png) |
| Portfolio | [Desktop](review/sitewide/tr-portfolio-1440.png) | [Mobile](review/sitewide/tr-portfolio-390.png) |
| Contact | [Desktop](review/sitewide/tr-hireme-1440.png) | [Mobile](review/sitewide/tr-hireme-390.png) |

Equivalent English screenshots are saved alongside these with the `en-` prefix. No known failing application check remains in the available automated scope. Remaining work is user visual feedback and any additional physical-device/assistive-technology testing before a separately authorized release.
