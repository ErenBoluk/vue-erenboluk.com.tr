# Contact form atmosphere

Changed files:
- New `src/components/ContactFormAtmosphere.vue`: aria-hidden, pointer-events:none SVG grid and accent-colored light. GSAP animates only transform/opacity for one 4.2s pass on visibility or pointer re-entry. No infinite loop. Stops on form focus, hidden tab or offscreen; honors live reduced-motion and cleans GSAP/observers/listeners on unmount.
- Updated `src/views/HireMeView.vue`: import/mount decorative child; position:relative and isolation:isolate on existing frame. Existing form dimensions, fields, translations, validation, submit handler, payload and backend unchanged.
- New `tests/browser/aura-contact-atmosphere.cjs`: failing-before/passing-after browser regression.
- New this document; review artifacts under `docs/aura/review/contact/` (desktop.png, mobile.png, layout-before.json).

Validation: browser atmosphere test passed (unchanged geometry, decorative semantics, finite motion, focus stop, input usability, live reduced motion, route cleanup, mobile overflow). Existing production `aura-regression.cjs all` 12/12 passed, including mocked form success/failure/cooldown. `npm run build` passed, 420 modules in 1.75s. `git diff --check` passed with existing line-ending notices. Screenshot inspected. Chromium automation only; no physical-device or screen-reader claim. No dependencies added and no commit/push/deploy.

Local production preview: http://127.0.0.1:5177/tr/hireme
