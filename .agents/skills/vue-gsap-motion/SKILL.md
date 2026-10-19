---
name: vue-gsap-motion
description: Use when creating, reviewing, or debugging Vue 3 GSAP animations, reactive cursor effects, scroll transitions, and reduced-motion behavior for Project AURA.
---
# Vue GSAP Motion
1. Inspect existing animation architecture and versions first.
2. Use GSAP context and component lifecycle cleanup; remove event listeners and animation frames.
3. Animate opacity and transform where possible; avoid layout thrashing and excessive filters.
4. Provide reduced-motion fallback and keyboard/touch equivalent states.
5. Ensure effects do not obscure text or intercept clicks.
6. Test on desktop and mobile and report measured results rather than inventing FPS.
