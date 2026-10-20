# Route loader and progressive images — implementation plan

**Goal:** Real navigation loading feedback plus restrained lazy image placeholders without layout changes.
**User choice:** Thin upper loading line; keep current content visible. Main agent only. Preserve existing work, routes, forms, i18n, Railway. No packages/commit/push/deploy.
**Architecture:** Global router-hook component with delayed display and cleanup; reusable Vue 3 ProgressiveImage with reserved aspect ratio, IntersectionObserver, cached-load/error handling and finite shimmer. Existing image URLs/alt text preserved.

- [x] Add failing browser tests for delayed route chunk and delayed image.
- [x] Implement ProgressiveImage; eager high-priority Home portrait, near-viewport About/project cards, eager modal. Preserve crop and image dimensions.
- [x] Add router loader: 120ms reveal threshold, completion/error/cancel handling, indeterminate accessible status, reduced motion and no input interception.
- [x] Add TR/EN loading/fallback strings. Check responsive geometry, cached images, source changes, failures, lazy network requests, route cancellation and lifecycle cleanup.
- [x] Run build and production browser regressions. Document source files and actual evidence.

Completed: see docs/aura/loading-feedback.md for changed files, tests and limitations.
