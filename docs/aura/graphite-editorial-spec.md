<!-- Implementation approved by user 2026-10-19. Later user requirement overrides cursor-removal clauses: compare refined global cursor and portrait-only alternatives before deciding; retain native pointer, reduced-motion/coarse-pointer fallbacks. -->
# Graphite Editorial — component specification

Status: approved and implemented sitewide. The corrected mockup composition and later user instructions supersede the earlier rail/cursor-removal proposals. See graphite-editorial-validation.md for actual evidence and remaining manual checks.

## Outcome and scope

Make all four existing pages feel like a coherent premium developer portfolio through typography, spacing, solid graphite surfaces, restrained violet accents and one local portrait interaction. The user selected Concept 1 in `design-discovery.md`; the measurements and decomposition below are proposed implementation decisions, not additional preferences attributed to the user.

Keep Vue 3, Vite, Tailwind 4, installed GSAP, existing content, functionality, en/tr i18n, SEO and Railway. No new dependency, imagery, font service, page route or invented marketing claim. No push, deployment or production environment change without explicit approval. No backend or hosting changes.

## Shared visual system

Active files: `src/assets/main.css` and `src/assets/tailwind.css`; do not build on unimported `base.css`. Reconcile existing `.bg-main`/`.bg-secondary` black `!important` rules with these semantic CSS variables rather than layering competing overrides:

| Variable | Value | Purpose |
| --- | --- | --- |
| --aura-canvas | #0A0A0C | Page background |
| --aura-surface | #141418 | Sidebar/form/dialog surfaces |
| --aura-text | #F4F4F5 | Primary text and solid primary CTA fill |
| --aura-muted | #A1A1AA | Supporting text |
| --aura-accent | #C4B5FD | Selected state and sparse signature detail |
| --aura-border | #71717A | Essential control boundaries |
| --aura-divider | rgba(244,244,245,.12) | Decorative separators only |

Normal text target 4.5:1; large text/meaningful controls and focus boundaries target 3:1. Measure actual composed states before accepting implementation; these are proposed tokens, not an audited palette. Preserve recognizable success/error state text and appropriate semantic colors.

General Sans already loaded through Fontshare stays the primary typeface; system sans fallback supports Turkish characters. Reuse its current loading configuration initially; no additional font. Body 16px mobile and 18px desktop, line height 1.65, prose max 65ch. Home name 36–44px mobile and 64–80px desktop, weight 600–700, line height 1.05–1.1. Route titles 34–40px mobile/48–60px desktop; section headings 24–28px/28–32px. Use responsive clamp ranges, never forced name/Turkish label breaks or ellipsis for required copy. Metadata at least 12px, control labels 15–16px.

The user-approved corrected composition uses a shared top header and a 1440px outer content maximum with up to 64px horizontal gutters. Header navigation uses one row from 1024px, two rows from 768px, and the existing accessible drawer below 768px. Actual wrapped toolbar height and header clearance are reserved in the scroll region; page padding has one owner.

Two-column content starts at the existing lg breakpoint (1024px viewport), only where available width fits the minimum content widths. Retain the sidebar/drawer breakpoint at existing md (768px). Single-column reading order matches DOM order. One primary CTA per route; existing actions remain present.

Controls: 44px minimum target height where practical, 12px action gaps, 16–20px horizontal padding, 8px radius. Primary is light text-token fill with dark canvas-colored label; secondary is solid/dark with essential boundary token. Focus outline 2px accent with 3px offset; no transform on focused hit targets. Surfaces use 12px radius and decorative dividers rather than stacked glass, glowing borders and heavy shadows.

## Component requirements

### App and navigation

Preserve App locale/html language/hreflang behavior and all route-specific Unhead calls. Mark the current routed scrolling root with `data-aura-scroll`; motion observes that real element. Preserve native scroll and the four named routes.

Shared navigation retains all four links, their ordering, social destinations, CV and locale controls. The user-approved top header now applies to every route. Selected states use violet plus a persistent rule. Mobile native dialogs support explicit Tab wrapping, Escape, background isolation and focus return; breakpoint and route changes clean up open state.

### Home

Retain existing name, role, both introduction paragraphs, portrait, hire navigation and copy-email behavior. Text-led asymmetric grid, portrait secondary in a static rectangular frame: 280–320px desktop, 160–208px mobile, 12px radius. Preserve source image aspect ratio unless a crop is later explicitly approved. No clickable visual cue on a noninteractive portrait. Keep 16px between paragraphs and 24px before actions. Actions wrap/stack rather than clip translated labels. Copied feedback is announced without moving focus or resizing the action row. Handle clipboard failure without a false success state. Correct missing locale binding when touching the hire action; destination must retain current language.

### About

Keep portrait/bio, all statistics, career text, skills and CV/contact actions. Use a divider-led statistics strip (two columns small screens/four when space permits), readable career sections and quiet skill groups. Preserve existing copy including project-count wording; do not silently reconcile statistics with portfolio records. Remove repeated spinning portrait decoration and nested glass surfaces.

### Portfolio

Preserve all nine records, translations, categories/counts, current list and showcase modes, arrows/progress, detail content and destinations. Align screenshot/title/description/metadata rhythm across both modes; wrap filters and retain full copy. Showcase remains native horizontal scrolling with existing arrows, keyboard access and useful progress. No page-level horizontal overflow. Selection state must be programmatic and visually distinct. No drag/hover-only actions.

Project dialog has named dialog semantics, initial focus, containment, Escape/close/backdrop dismissal and return to the activating project control. Preserve the existing labeled close action. If filtering removes the invoking control, return focus to the active filter or view heading. Ensure modal scrolling works independently without leaving the background keyboard-accessible.

### CV and language controls

Keep DownloadCvBtn variant contract (`default`/`glass`) even though both receive consistent styling. Keep CvDownloadModal `isVisible` Boolean prop and `close`/`download` emits; download payload remains `en` or `tr`. Modal uses the same focus/dismissal rules as project dialog and has localized names. CV assets resolve from Vite BASE_URL rather than the current localized URL; preserve existing PDF filenames/download names and feedback states. Verify both PDFs on deep routes and failed responses.

Keep language options English/Türkçe, route-preserving change and saved preference. Direct explicit en/tr route selection must win over stale saved preference; limit any correction to the existing locale control and verify router guard behavior. Use a simple disclosure with native buttons and ordinary Tab order, or fully implement the current menu keyboard semantics; prefer the simpler disclosure and remove misleading menu roles. Escape returns focus to trigger.

### Hire Me

Existing contact information left and solid form surface right when space permits; stack on narrow widths. Form padding 24–32px desktop, 20–24px mobile. Associate name/email/message labels with input IDs. Preserve POST payload, endpoint normalization, loading guard, existing cooldown storage/countdown and success/reset behavior. Keep pending/success/error/cooldown feedback accessible and text-based. No input, CTA or form displacement during typing. Network error remains visible and retryable. Test request states with local interception; do not send live messages.

## Motion contract

Home retains its bounded 6px portrait response. The global native-pointer-preserving alternative remains as a restrained 24px outline, hidden during keyboard/text entry/dialog use and disabled for coarse pointers/reduced motion. There are no moving hit targets, rotating rings, continuous orbs or independent perpetual RAF loops.

BackgroundOrbs becomes an optional static, low-opacity decorative gradient plane (preserve component import contract); no animated blur. Pointer movement can be omitted if profiling or contrast fails; static design must remain complete.

One-time section reveals: transform y from 12px to 0 and opacity, 500ms power2.out, stagger no more than 60ms, grouping total under 750ms. No split text, pinned/scrubbed sections, scroll hijacking, ScrollTrigger requirement or WebGL. Route transition opacity only, 180ms; reduced motion immediate. Avoid duplicated route and section delays.

Implemented shared useEditorialMotion(rootRef) in src/composables/useEditorialMotion.js returns { refresh }. About, Portfolio and Contact use scroll-root-aware one-time reveals, media gating, observed-node cleanup and visible base content; Home keeps its approved local GSAP context/portrait implementation. src/utils/dialogFocus.js provides shared native-dialog Tab wrapping.

Motion is enhancement-only: visible base markup, no zero-opacity dependency on script success. Fine-pointer/no-reduced-motion gating; coarse pointer and reduced motion get static visible content. Preference changes immediately clear transforms/opacity and unregister work. Focus entering a reveal makes it visible immediately. Cache pointer geometry on enter/resize; no layout reads per pointer move. Cleanup observers/media contexts/listeners/RAF/timers on unmount; no work while hidden/offscreen. Existing per-view GSAP timelines/listeners are replaced, not layered underneath.

## Acceptance and boundaries

Verify eight locale/page combinations and deep entry/refresh, 320/390/768/1440px, 200% zoom, Turkish wrapping, keyboard and touch, static reduced motion initially/live, failed fonts/images and clipboard. Check all dialogs/menu focus and essential contrast. Verify portfolio filters/modes/project destinations and both CV downloads. Exercise contact responses through local mocks, including error/429/reset, without production requests. Repeat route changes during animation and profile cleanup/idle work on representative devices.

Run repository's actual `npm run build`; there is currently no lint/test script. Record browser outcomes and limitations; never infer accessibility or performance from a build. No new test framework/package is required for this visual task. Verification can use available browser tools or explicit manual checks; unknown results remain pending. The static discovery HTML is a comparison artifact, not the production specification or a production dependency.

Future file ownership is specified in the companion plan. All changes are limited to the frontend files listed there and necessary paired en/tr accessibility labels; router/backend/public hosting configuration stays untouched. No commits, pushes or deployment are included by default. The user approved execution; delivered scope and verification limits are recorded in graphite-editorial-validation.md.
