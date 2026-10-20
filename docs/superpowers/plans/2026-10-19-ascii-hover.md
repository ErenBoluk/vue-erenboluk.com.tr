# Transparent ASCII hover implementation plan

**Goal:** Add only a transparent, interactive ASCII overlay to the approved Home hero.
**Spec:** User request in this conversation; no redesign, no new packages or video dependencies.
**Architecture:** Vue 3 script setup + independent JavaScript typed-array stable-fluid solver, glyph atlas and optional video luma sampler. Preserve existing pointer/GSAP effects.
**Execution:** Main agent only, user-maintained Sandbox checkout. No commits/push/deploy for this feature.

- [x] Write and run failing solver tests (empty/decay/advection/projection/dt/options).
- [x] Implement low-resolution fluid fields, diffusion/projection/advection and exponential decay.
- [x] Implement atlas, transparent render, hover/drag/click ring, safe areas, optional video cover/contain sampling and fallback.
- [x] Integrate only Home; default charset `—>o·:+*`, inherit existing muted text color.
- [x] Browser-test transparent initial/idle states, hover/click/drag, reduced motion, visibility, remount, touch, layout preservation. Build once after changes; document actual evidence.

Source resolved: C:/Users/erenb/Downloads/kod.js was found and inspected. The user supplied newer implementations in C:/Users/erenb/Desktop/Sandbox/vue-erenboluk.com.tr; these were backed up and improved in place. Original Home edits outside the component invocation were preserved. See docs/aura/ascii-hover.md for final tests, differences and usage.
