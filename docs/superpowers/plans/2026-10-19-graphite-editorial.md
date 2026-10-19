<!-- Implementation approved by user 2026-10-19. Later user requirement overrides cursor-removal clauses: compare refined global cursor and portrait-only alternatives before deciding; retain native pointer, reduced-motion/coarse-pointer fallbacks. -->
# Graphite Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the selected Graphite Editorial design across the existing portfolio while preserving its functionality and adding accessible restrained motion.

**Architecture:** Keep the routed Vue views, current navigation and internal scrolling. Establish shared semantic styles, then update components and pages in bounded batches, followed by one scoped GSAP motion handoff and independent integrated review. No backend or hosting changes.

**Tech Stack:** Existing Vue 3, Vite, Tailwind 4, GSAP, vue-router, vue-i18n, Unhead and Heroicons; no new dependency.

**Spec:** `docs/aura/graphite-editorial-spec.md` (selected concept in `docs/aura/design-discovery.md`).

## Global Constraints

- Keep Vue 3, Vite, Tailwind 4, installed GSAP, existing content, functionality, en/tr i18n, SEO and Railway.
- No new dependency, imagery, font service, page route or invented marketing claim.
- No push, deployment or production environment change without explicit approval.
- No backend or hosting changes.
- User approved implementation and the corrected mockup; later instructions require the main agent only and extend the top-header visual language sitewide.
- No automatic commit, cleanup of unrelated workspace changes, or editing discovery viewer runtime state. Use worktree skill at execution time if isolation is needed; account for existing untracked project configuration and skills.

## Review Focus

- Explicit `/tr/...` entry with saved English preference must retain the URL-selected locale (Task 2).
- Downloading either CV from any localized deep route must yield the actual PDF (Task 2).
- Route/filter changes while a dialog is open must leave reachable focus and no stale background isolation (Tasks 2/5).
- Live reduced-motion change or route unmount during entrance must leave visible content and no continuing effect work (Task 7).
- Contact failures/429 and clipboard denial must never look like success or erase retryability (Tasks 3/6).

## Verification approach

No test/lint script is installed. Do not invent `npm test` or add a framework for styling assertions. For behavior fixes, record the existing failing browser reproduction, make the minimal correction, and repeat that exact case. For reversible styling, verify responsive/keyboard outcomes directly. Run `npm run build` at the indicated gates and inspect output/exit status; start existing `npm run dev` for browser checks. Mock contact requests locally; never test by sending a production message. Missing browser tools are a reported verification gap, not a pass.

## Task 1: Shared tokens and routed shell

**Owner:** primary/integrator. **Modify:** `src/assets/main.css`, `src/assets/tailwind.css`, `src/App.vue`.
**Interfaces:** Produces the seven --aura-* CSS variables and inherited typography/control styling defined in the spec; preserves existing bg-main/bg-secondary classes mapped to semantic tokens. Routed scroll root carries `data-aura-scroll` for Task 7. Router and App locale/SEO contracts stay intact.

- [ ] Inspect current scripts, Git status and active CSS imports; establish baseline `npm run build` result before changes.
- [ ] Add exact spec tokens, font hierarchy and focus treatment in active CSS; reconcile black !important overrides. Do not introduce a tailwind.config.js or activate starter base.css.
- [ ] Apply 1200px content maximum and single-source gutters/reserved shared-control space; preserve 224px rail and internal scrolling. Mark scroll root and make route fade opacity-only 180ms/immediate under reduced motion.
- [ ] Check all four views in both locales at narrow/wide sizes: page content remains scrollable, fixed controls do not overlap content/focus, no duplicate padding or accidental horizontal overflow. Run `npm run build` and record result.

## Task 2: Shared navigation, locale and CV accessibility

**Owner:** frontend-engineer. **Modify:** `src/components/SideMenu.vue`, `LocalizeBtn.vue`, `DownloadCvBtn.vue`, `CvDownloadModal.vue`; paired `src/localize/langs/en.json` and `tr.json` for necessary control names only, with primary as single dictionary editor.
**Interfaces:** Keep DownloadCvBtn variant default/glass; CvDownloadModal isVisible Boolean and close/download events, download(lang) with en/tr. Keep changeLanguage(langCode), four named-route links and language preference key. No router edits.

- [ ] Record baseline keyboard reproduction for unnamed/offscreen drawer controls and CV dialog; reproduce route-relative CV fetch and explicit-locale entry with opposite saved preference.
- [ ] Apply shared solid surfaces/control styles; name/associate drawer controls, make closed mobile content nonfocusable, and implement open focus containment/Escape/return/background isolation with breakpoint cleanup.
- [ ] Make CV modal named and keyboard-safe while preserving its props/events; use `import.meta.env.BASE_URL` to resolve assets/cv filenames. Preserve download pending/success/error and clean temporary resources/timers.
- [ ] Make locale control a simple accessible disclosure with native button options and Escape/focus return; preserve route name when switching. Avoid overwriting valid explicit route language with stored preference.
- [ ] Repeat keyboard/focus tests and both PDF downloads on every locale/deep route. Open drawer or CV dialog then change route/breakpoint; verify isolation/focus state clears. Check both CV variants and dropdown label wrapping. Build after this behavior batch.

## Task 3: Home editorial composition and preserved actions

**Owner:** frontend-engineer. **Modify:** `src/views/HomeView.vue`; paired status labels only through primary if necessary.
**Interfaces:** Preserve existing useHead keys, both paragraphs, portrait source, hire named route/current locale and copyEmail behavior. Root element ref and optional decorative portrait ref are reserved for Task 7; do not independently create another motion system.

- [ ] Reproduce current hire navigation in en/tr and clipboard failure case; record observed results rather than assuming discovery hypotheses are runtime failures.
- [ ] Build the asymmetric layout using spec type/spacing/frame values, two columns only at sufficient lg width. Retain every existing content/action and image ratio; remove spinning ring/large blur/anonymous hover-listener styling.
- [ ] Bind locale explicitly for hire destination and keep stable action sizes. Copy status is announced on success; clipboard denial remains truthful and retryable. Add paired accessible status copy only if missing.
- [ ] Verify hire from en/tr, copied feedback and denied Clipboard API, action wrapping at 320px and 200% zoom, missing image/font, keyboard focus and no long entrance delay. Root stays visible before Task 7. Build.

## Task 4: About continuity

**Owner:** frontend-engineer. **Modify:** `src/views/AboutView.vue`.
**Interfaces:** Preserve existing statistics/paragraphs/skillCategories, translated keys, metadata, portrait and DownloadCvBtn usage. Expose root ref and data-aura-reveal section markers for Task 7.

- [ ] Record content inventory and current layout at narrow/wide widths.
- [ ] Apply shared hierarchy, restrained portrait, divider-led stats and career sections, quiet skill groups; preserve all current copy including project count. Remove competing mount animation/decoration in preparation for Task 7.
- [ ] Compare en/tr text/data and CV/contact actions with baseline. Check long skills, stat layout, 320px/zoom and below-fold readability. No content is hidden while motion is absent.

## Task 5: Portfolio presentation and details

**Owner:** frontend-engineer. **Modify:** `src/views/PortfolioView.vue`; paired accessibility names through primary only if needed.
**Interfaces:** Keep activeCategory string, viewMode list/showcase, raw project IDs/order, computed projects/categories, setCategory(catKey), scrollHorizontal(direction), openModal(project), closeModal(), scrollProgress and all links/highlights. Task 7 later receives root ref and reveal markers.

- [ ] Capture nine-record/category-count baseline and modal keyboard behavior in both modes/locales.
- [ ] Apply editorial rows/cards/filter styles without dropping modes, horizontal navigation or full descriptions. Selected filters/modes have explicit state; native showcase scroll keeps visible button/keyboard alternatives.
- [ ] Implement named project dialog with initial/contained/returned focus and dismissal. Capture invoking control; use active filter/heading fallback when filtering removes it. Preserve existing project close label and content/actions.
- [ ] Verify every category and both modes, arrows/progress, detail entry/exit and external destinations. Change filter/mode or route with dialog open; verify valid focus and no retained isolation. Verify no page overflow at 320px, Turkish labels, immediate reduced-motion scrolling, image failure. Build.

## Task 6: Contact form and feedback

**Owner:** frontend-engineer. **Modify:** `src/views/HireMeView.vue`; necessary paired feedback strings through primary.
**Interfaces:** Keep formData {name,email,message}, handleSubmit(), resetForm(), isSubmitting/isSuccess, `hireMeTimeoutUntil` localStorage key, POST JSON and VITE_API_URL normalization. Preserve 429 retryAfterMs behavior and cooldown persistence. Backend remains untouched.

- [ ] In a local intercepted-request setup, record baseline label associations, submitting guard, success/reset, failed request and 429 retryAfterMs cases without contacting the real service.
- [ ] Apply shared heading/contact/form composition and labels with matching input IDs; all form states use stable, readable surfaces. Preserve payload, cooldown and success/reset; make failure and status accessible and retryable without focus surprises. Remove animated field movement.
- [ ] Repeat mocked success/failure/429, refresh during cooldown, double submission, reset and retry cases. Check timer cleanup on leaving route, keyboard navigation, mobile keyboard/zoom and translated labels. Build.

## Task 7: Scoped GSAP motion integration

**Owner:** motion-engineer after Tasks 3–6, with exclusive sequential handoff of affected views. **Modify:** `src/components/BackgroundOrbs.vue`, `src/App.vue`, `src/views/HomeView.vue`, `AboutView.vue`, `PortfolioView.vue`, `HireMeView.vue`. **Create if needed:** `src/composables/useEditorialMotion.js`. Cursor.vue stays untouched/unmounted.
**Interfaces:** Consumes --aura-* and `[data-aura-scroll]` from Task 1 and root/data-aura-reveal markers from page tasks. `useEditorialMotion(rootRef, {portraitRef = null} = {})` returns nothing and owns lifecycle work; portrait ref points only to decoration. Preserve BackgroundOrbs import contract as static background enhancement.

- [ ] Record current reduced-motion/route-change behavior and identify old view timelines/listeners; no duplicate timelines remain after integration.
- [ ] Implement scoped context/matchMedia and observer enhancement: 12px/500ms power2.out reveals, <=60ms stagger and <=750ms group budget; root observer at actual routed scroll element. Visible base content and immediate focus reveal are mandatory.
- [ ] Add optional bounded portrait-only movement <=6px per axis with ~180ms quickTo easing, gated to fine hover/no reduced motion. Native cursor stays; remove Cursor mount from App, remove continuous orb/ring motion, avoid layout reads per event and idle RAF loops.
- [ ] Implement cleanup of observers/media/GSAP/listeners/timers; disable/clear immediately on motion-preference change, hidden document and relevant offscreen cases. Account for portfolio filter/mode changes without global selectors or stale markers; re-register after nextTick with cleanup where required.
- [ ] Test live reduced-motion toggles, coarse pointer, keyboard focus into unrevealed sections, rapid routes during entrance, portfolio filtering and tab visibility. Inspect absence of stale effects/resources; profile pointer/scroll on representative devices before any FPS claim. Build.

## Task 8: Independent integrated review and handoff

**Owner:** qa-reviewer read-only; primary owns any fixes and final report. **Files:** review Tasks 1–7; primary may create `docs/aura/graphite-editorial-validation.md` for actual evidence.
**Interfaces:** Consumes completed UI plus preserved-function checklist and build outputs. Produces prioritized findings and an evidence-based validation report, never inferred passes.

- [ ] Run final `npm run build` and `git diff --check`; inspect diffs for accidental content/SEO/router/backend/hosting changes.
- [ ] Complete full spec acceptance matrix: eight localized route/page combinations with refresh, 320/390/768/1440px, 200% zoom, keyboard/touch, all dialogs/dropdown/drawer states, portfolio modes, CV PDFs and locally mocked contact responses.
- [ ] Measure actual normal/large/control/focus contrast, test blocked/slow font/images and reduced motion initially/live, and profile repeated route/motion lifecycle. Mark unavailable device/browser checks as remaining gaps.
- [ ] Fix concrete findings under explicit file ownership, rerun affected checks and final build when fixes change code. Report all changed files, outcomes, risks and unverified work; no deploy/push/automatic commit.

## Self-review and execution handoff

Spec coverage: shared tokens/shell→Task 1; controls/dialogs/deep links→Task 2; all content/pages→Tasks 3–6; motion/fallback/lifecycle→Task 7; acceptance→Task 8. The five review-focus cases are included in their owning tasks. Proposed interfaces have one owner and sequential motion handoff; no duplicate CSS or motion architecture is required.

Recommended execution: existing project delegation workflow with bounded frontend/motion tasks and independent QA; shared files are edited sequentially. This follows AGENTS.md and the requested agent infrastructure. Please review the specification and plan before authorizing execution. No implementation has begun.

## Execution record — 2026-10-19

All eight implementation areas are delivered locally. Later user instructions superseded the original rail layout, automatic cursor removal and delegated workflow: the approved top header is shared sitewide, a restrained global cursor is retained, and remaining work was executed by the main agent only. No commit/push/deployment occurred. See docs/aura/graphite-editorial-validation.md for changed files, 12 regression passes, 32 responsive passes, 16 zero-violation axe scans, screenshots and explicitly untested manual/device checks.
