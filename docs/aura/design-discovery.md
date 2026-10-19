# Project AURA — Design discovery

Status: Concept 1 — Graphite Editorial selected by the user. Component specification and implementation plan are pending review; application implementation is not authorized.
Date: 2026-10-19. This document is a proposal, not an implementation specification or authorization to build.

## Intent and constraints

The first impression should communicate a creative, technically skilled developer who cares deeply about design and user experience. The user wants premium, modern, minimal and memorable work with the polish associated with Codex and Linear, beautiful typography, fluid motion and subtle mouse reaction. Originality, performance, accessibility and attention to detail take priority over effects. These products are quality references, not layouts to copy.

Keep Vue 3, Vite, installed GSAP, existing functionality/content, English/Turkish localization, SEO and Railway. Preserve all four routes, navigation, CV downloads, email copy, social/project links, portfolio filters/list/showcase/details, contact loading/success/reset/cooldown states and API integration. Do not push, deploy or change production without explicit approval. No application code changes belong to discovery.

The user requested browser mockups after written discovery. Those are isolated concept previews, not production pages or approval to implement. The user selected Concept 1 — Graphite Editorial after reviewing the discovery. The recommendation below is the team's judgment.

## Method and evidence

Five independent read-only tasks completed: explorer audited architecture/current design; designer used ui-ux-pro-max for visual directions; motion-engineer evaluated cursor/scroll effects; frontend-engineer assessed implementation; qa-reviewer assessed accessibility/mobile/performance. All findings were compared before drafting this document.

Visual baseline and risks come from source inspection, not a rendered browser audit. No build, automated UI test, backend submission, screen-reader test, contrast measurement or performance profile was run. Suggested colors, durations and movement limits are design starting points, not measured results.

Skills consulted: `.agents/skills/ui-ux-pro-max/SKILL.md`, `design-system`, `brand`, `vue-gsap-motion`, and installed Superpowers brainstorming/parallel-agent workflows. The ui-ux-pro-max Python search launcher failed because Python is unavailable; no packages were installed. The designer instead inspected local CSV entries directly: styles Dark Mode (7), Bento Box Grid (39), Exaggerated Minimalism (47), Swiss Modernism 2.0 (50), Editorial Grid / Magazine (66); typography Classic Elegant (1), Tech Startup (3), Editorial Classic (4), Developer Mono (9), Geometric Modern (11), Luxury Serif (12); Portfolio/Personal color entry (11); UX focus, contrast and motion guidance. These informed proposals rather than dictating them. Drop caps and parallax suggested by generic editorial data were deliberately excluded.

## Existing portfolio

| Surface | Source-backed current design | Preserve |
| --- | --- | --- |
| Shell | `src/App.vue`, `src/components/SideMenu.vue`: black canvas, 224px desktop sidebar, fixed CV/language controls, mobile drawer, purple navigation states | Named navigation, social links, locale controls, CV workflow |
| Home | `src/views/HomeView.vue`: centered portrait/text split, circular portrait, rotating purple ring, large uppercase name, two introduction paragraphs, white hire CTA, copy-email action, blurred orbs | Identity, copy, portrait, hire navigation, clipboard and feedback |
| About | `src/views/AboutView.vue`: portrait, availability/location badges, gradient role, four statistics, career cards and skill groups | Existing biography, statistics, career and skill content, contact/CV actions |
| Portfolio | `src/views/PortfolioView.vue`: nine projects, category counts/filters, list/showcase switch, horizontal showcase arrows/progress, project detail modal | All records, descriptions/highlights, both presentations, modal and external destinations |
| Hire Me | `src/views/HireMeView.vue`: contact column, glass form, white submit CTA, success view and cooldown overlay | Name/email/message request, submission/error/success/reset, persisted cooldown and contact links |

`src/router/index.js` keeps home/about/portfolio/hireme beneath `/:lang(en|tr)?`. Preserve locale guards, saved preference and direct links. `src/localize/langs/en.json` and `tr.json` hold content and localized metadata. All views use Unhead; App provides html language and hreflang, while `index.html` provides canonical/social/schema metadata. Existing robots and sitemap remain outside visual changes.

General Sans is loaded in `index.html`; Poppins is additionally imported in `main.css`. Active styles enter through `main.js`: Tailwind import and `main.css`. Starter `base.css` is not imported and is not an active token system. Current semantic colors are largely `.bg-main` black and `.bg-secondary` near-black. Component utility colors need consistent semantic roles.

Reuse the logo/brand SVGs, Heroicons, portrait and existing project screenshots. Seven local project screenshots exist, but nine project entries currently use CDN URLs; do not assume every entry has a local replacement. English/Turkish CV PDFs exist. No new imagery or fabricated project outcomes are required.

Current inconsistencies: different page widths/padding, small Home controls versus oversized cards elsewhere, repeated portrait treatments, competing gradients/glass/glows and entrance styles. App uses a viewport-height internally scrolling routed view; scroll animation and mobile fixed controls must respect that structure.

## Findings compared

| Perspective | Main conclusion | Consequence for concepts |
| --- | --- | --- |
| Explorer | Content and working interactions are richer than the simple hero suggests; layout and decoration vary across routes | Establish a shared hierarchy across every page, rather than redesign Home alone |
| Designer | Typography, spacing, solid surfaces and one accent can deliver premium character using existing assets/fonts | Three coherent systems below, each with page, mobile and interaction rules |
| Motion | Existing animation is mostly mount-driven; cursor snapshots route controls; no reduced-motion path was found | Scope enhancement to components, retain native pointer, use real scroll root and static fallback |
| Frontend | Vue 3.5/Vite 6/Tailwind 4/GSAP 3.13 already support the proposals | No new dependency required; sequence shared shell, view and motion ownership |
| QA | Keyboard/dialog/form semantics and motion preference need attention before adding interaction | Include accessibility remediation in approved touched surfaces and verify it in browsers |

Consensus: editorial structure, restrained technical detail and at most one local pointer signature best match the brief. The deliberate alternatives are a stronger technical grid or a warmer expressive identity. An effect-heavy atmospheric concept was considered but not carried forward: existing blur/orbs already compete with content and the user prioritizes restraint.

## Concept 1 — Graphite Editorial (recommended)

Feeling: a thoughtful product developer with strong visual judgment. Spacious, precise and quietly expressive. Originality comes from the portrait/name composition, typography and rhythm.

Palette proposal: canvas `#0A0A0C`, surface `#141418`, primary text `#F4F4F5`, secondary text `#A1A1AA`, violet accent `#C4B5FD`. Use accent for selected navigation, a small signature rule and interaction states. Subtle dividers are decorative; essential control boundaries need separately verified contrast.

Typography: existing General Sans, 600–700 display weights, 400 body. Proposed desktop hero 64–88px, mobile 36–44px, body 16–18px with 1.5–1.7 line height and roughly 60–70 character reading measure. Test Turkish characters and wraps. Keep navigation compact but readable.

Page composition:
- Home: an asymmetric editorial spread, text dominant and portrait in a quiet frame. Preserve the name, role and both introduction paragraphs. One strong hire CTA, copy-email secondary. Retire the continuously rotating ring in the proposed redesign.
- About: portrait/bio introduction, divider-separated statistics, readable career sections, orderly skills groups with fewer nested surfaces.
- Portfolio: generous project rows and consistent screenshot/title/description/metadata alignment. Preserve list/showcase switching, filters and details; use the same hierarchy in both presentations.
- Hire Me: conversational existing heading/contact information beside a solid form surface. Labels and states remain legible and stable.

Mouse signature: keep the native pointer; a small local halo or portrait accent follows fine-pointer movement with approximately 180ms easing and 4–6px maximum decorative displacement. Do not move text, controls or hit targets. Hover and focus use equivalent border/underline emphasis.

Scroll: one-time 12–16px reveals over 450–550ms, short stagger, no pinned sections or scrubbed text. Mobile: single column, 24px starting gutter (reduce safely at 320px), roughly 160–208px portrait, wrapping actions/filters and natural reading order. Static decoration on coarse pointer and reduced motion.

Tradeoff: lowest relative structural risk and strongest continuity with the current violet identity. It depends on excellent spacing and typographic execution; excessive neutrality could make it generic. Mitigate with one distinctive composition, not more animation.

## Concept 2 — Precision Studio

Feeling: an engineer who builds clear, reliable, beautifully organized products. Sharper grid rhythm and concise visual metadata emphasize technical capability while retaining the human portrait.

Palette proposal: canvas `#0B1120`, surface `#111C2E`, text `#F1F5F9`, secondary `#94A3B8`, cyan accent `#67E8F9`. Keep cyan sparse. Grid lines are quiet decorative separators, not a full-screen animated mesh.

Typography: existing General Sans for headings/body; system monospace only for indices, categories and existing technology labels. No terminal simulation, tiny body text or invented performance statistics. Display roughly 56–76px desktop, 34–42px mobile.

Page composition:
- Home: clear desktop grid; large name/role and introduction aligned against a rectangular portrait frame, with a disciplined CTA row.
- About: aligned statistic strip, numbered career sections and consistent skill groups; preserve exact content rather than inventing technical claims.
- Portfolio: catalog-like rows with aligned category/technology information and structured showcase cards. All nine entries, controls and detail content remain available.
- Hire Me: ruled contact/form columns, explicit field labels and distinct feedback regions using the same spacing grid.

Mouse signature: a bounded accent line or decorative grid-plane offset up to 8px. Avoid a second persistent crosshair replacing the native cursor. Selected and keyboard-focus states remain obvious without movement.

Scroll: ordered 8–12px card/section reveals over 250–400ms. Optional transform-based scroll progress only if useful; it must track the actual routed scroller. Mobile stacks the same DOM order into one column and wraps metadata; decorative grid disappears where it creates clutter. Both portfolio modes remain accessible without dragging.

Tradeoff: medium responsive/i18n layout effort; strongest engineering signal, but can feel impersonal or dashboard-like. Limit monospace and indices, retain the portrait and existing human introduction, and avoid decorative status indicators.

## Concept 3 — Warm Atelier

Feeling: an inventive developer with a personal design point of view. Warm dark surfaces and expressive display type distinguish it from familiar violet/cyan developer portfolios.

Palette proposal: canvas `#100E0C`, surface `#1C1917`, text `#FAF7F2`, secondary `#B8AEA2`, amber accent `#FCD9A0`. A single low-opacity warm light may sit behind the portrait. Solid surfaces carry text; no text directly over variable bright decoration.

Typography: General Sans body/UI; optionally Georgia/system serif for display name and major headings. The serif is a proposed choice pending glyph/rendering review, not a required dependency. Display roughly 60–84px desktop and 36–44px mobile. Use restrained emphasis and generous line spacing.

Page composition:
- Home: expressive name, warm portrait frame and open editorial composition; existing introduction and two actions remain central.
- About: chapter-like career sections, portrait/bio balance, quiet statistic and skill panels; avoid magazine ornament that delays reading.
- Portfolio: large project spreads with clear engineering metadata and existing imagery. Keep filters, both presentations and modal content rather than making screenshots the only route to details.
- Hire Me: warm invitation using existing copy, calm form surface and clearly separated contact details.

Mouse signature: one bounded gradient plane behind the portrait, maximum 12px travel, low opacity, no continuously drifting orb. It is decorative and off for coarse pointer/reduced motion. No moving controls or rotating portraits.

Scroll: 8–12px opacity/transform entrances over 450–600ms; no continuous background parallax by default. Mobile uses solid warm surfaces, one column and reduced display scale; preserve all copy and project information.

Tradeoff: strongest departure and personal differentiation, with medium typography/contrast validation effort. Serif fallback varies by OS; amber over warm backgrounds can lose contrast. If the serif feels too ornamental, retain General Sans and let composition/color carry the direction. It must still communicate engineering substance.

## Decision matrix

Relative judgments, not measured scores or delivery estimates:

| Criterion | Graphite Editorial | Precision Studio | Warm Atelier |
| --- | --- | --- | --- |
| Match to premium minimal brief | Strongest | Strong | Strong, more expressive |
| Immediate technical signal | Strong through project clarity | Strongest through structure | Requires clear metadata/copy |
| Distinct personal tone | Strong with custom composition | Moderate; avoid dashboard conventions | Strongest |
| Change from current identity | Smallest | Medium | Largest |
| Responsive/bilingual effort | Lowest of the three | Medium: dense alignment | Medium: display typography |
| Main risk | Becoming generic | Becoming busy/impersonal | Becoming ornamental |
| Motion/rendering budget | Lowest proposed | Low; avoid full-screen grid effects | Low to medium if warm light retained |

Recommendation: choose Graphite Editorial as a whole direction, with Precision Studio's metadata discipline inside project rows and just one local portrait response. This is a bounded borrowing, not a fourth concept or permission to combine all effects. The user selected Graphite Editorial; the detailed specification remains pending review.

## Shared implementation guardrails (future work)

Use semantic background/surface/text/accent/focus tokens in the active Tailwind/CSS entry points. Reuse General Sans before adding fonts, existing assets before adding imagery and existing dependencies before adding packages. Use consistent surface radii around 8–16px, spacing and button hierarchy. Preserve actual image aspect ratios and reserve space while loading.

Motion uses component root refs, `gsap.context`, `gsap.matchMedia` and cleanup of contexts/media registrations/listeners/observers/timers/RAF. Bounded pointer updates can use GSAP quickTo rather than creating tweens on every event. Cache geometry on entry/resize, not every pointer frame. Do not combine multiple smoothing mechanisms. Native cursor remains available.

Gate pointer enhancement by `(hover: hover) and (pointer: fine)` and no reduced-motion preference. React to preference changes. Decorative layers are aria-hidden, behind content and pointer-events:none. Base content is visible; initialization failure never strands opacity at zero. Keyboard focus must not await a reveal. Reduced motion means static visible content, immediate horizontal scrolling and no spatial route transition, ring/orb loop or pointer tracking.

Use IntersectionObserver rooted at the routed scroll container for simple one-time entrances. ScrollTrigger from installed GSAP is optional only if the chosen interaction warrants it; configure its scroller explicitly. Keep native scrolling and current navigation; no scroll hijacking, WebGL, animated blur or perpetual ambient travel. Pause offscreen/hidden-document enhancement and avoid a permanent idle loop.

## Risks and acceptance gates

High-priority source findings:
- `SideMenu.vue`: mobile toggle/close icon buttons lack accessible names; the closed drawer is translated away but its links remain in DOM tab order; no explicit Escape/focus management was found. Verify behavior with keyboard and address it in approved navigation work.
- `CvDownloadModal.vue`: no explicit dialog/title semantics, focus containment/return or Escape handling found. Its icon close button lacks a name.
- `HireMeView.vue:288–316`: visible labels lack for/id association or wrapping fields.

Additional integration and motion risks:
- No reduced-motion branch was found under src. Home/About create GSAP timelines without teardown; Hire Me cleans its interval but not all animation/focus listeners; Portfolio removes its key listener but does not revert GSAP work. Cursor does clean its RAF/listeners, but snapshots interactive elements once and hides by width rather than capability.
- Existing large blurred animated orbs are a profiling concern, not proof of poor frame rate. Replace rather than stack more effects on top.
- Home references locale in its hire action but only destructures t from useI18n; verify the action before changing its structure.
- `DownloadCvBtn.vue` uses relative assets/cv fetch paths; localized deep routes can resolve them beneath a language prefix. Test actual PDF responses and downloads. Locale control can restore saved language on mount; test direct localized entries against saved preference.
- About's existing “7+ Projects” copy differs from nine portfolio records. Preserve content unless copy updates are separately agreed.
- Fontshare, Google Fonts and CDN images are external dependencies. Test delayed/failed loads and Turkish fallback glyphs; no availability guarantees were verified.

Before any implementation is called complete:
1. Verify all eight localized route/page combinations, direct entry and refresh, saved language switching, metadata/html language/hreflang and unchanged content.
2. Walk keyboard through menu, language selector, CV/project dialogs, filters/view switches, copy email and form. Check dialog entry/containment/Escape/return, visible unobscured focus, accessible names and associated form labels. Announce feedback appropriately without stealing focus.
3. Test 320/390/768/1440px, touch/coarse pointer, landscape, 200% zoom and expanded Turkish labels. No accidental page horizontal overflow; showcase scrolling has clear keyboard/button alternatives. Target comfortable 44px CSS interaction hit areas where practical.
4. Measure composed contrast: normal text target at least 4.5:1, large text and meaningful controls/focus boundaries at least 3:1. Proposed hex values alone are not a contrast audit. Test at the brightest pointer-light position.
5. Test reduced motion initially and when changed live; all content remains visible, with no continuous or pointer-dependent motion. Test slow/failed image/font loads.
6. Navigate repeatedly during animations, open/close dialogs and filter/switch portfolio modes. Inspect cleanup and profile a representative desktop/mobile device for idle work, layout thrashing and effect cost. No FPS or compliance claim without measurement.
7. Run the actual frontend `npm run build`. Current scripts are dev/build/preview, with no test/lint script. Browser and integration checks supplement the build. Contact success/error/429 verification needs a controlled arrangement; do not send live messages or alter production by default.

Railway remains unchanged. Backend Bun/Hono/Resend, VITE_API_URL request behavior, cooldown handling and server secrets remain outside visual implementation ownership. Existing _redirects/_headers do not prove the Railway server honors their directives; hosting changes are a separate explicit scope.

## Proposed implementation handoff after selection

Primary/integrator owns shared tokens, shell and final verification (`main.css`, `tailwind.css`, `App.vue`). Frontend owns a bounded initial Home/shell batch, then separate view batches. Motion owns Cursor/BackgroundOrbs or a narrowly scoped motion helper; any motion edits in a frontend-owned view follow a sequential handoff. Controls/dialog accessibility is an explicit later batch. One owner manages any paired en/tr label additions. QA reviews the integrated result independently. Do not concurrently write the same component. Avoid extracting every visual block into a new component.

No router/backend/hosting changes are required by these directions. Relative effort excludes repairing every unrelated pre-existing issue; the selected scope must name necessary functional/accessibility corrections. After selection, produce a component-level specification and implementation plan before code work.

## Decision requested

Choose 1 Graphite Editorial, 2 Precision Studio or 3 Warm Atelier, or name one base direction with a specific restrained adjustment. Browser mockups are for comparison and do not constitute production implementation. Choosing a visual concept approves exploration of that direction; code implementation still waits for an agreed specification and plan. No deploy or push is authorized.

## Review and visual artifacts

All five agent reports were received before synthesis. A separate fresh builder reviewer read this document and found no important gaps beyond the intended direction selection. Browser comparison: `docs/aura/design-concepts.html` contains three isolated responsive Home studies using the existing portrait and English introduction. These demonstrate composition, palette and type; they are not complete route mockups, bilingual prototypes or live product interactions. No new marketing claim is implied by layout labels. The companion serves a copy for local viewing. Portrait pointer response is a lightweight prototype illustration; eventual production motion uses the selected Vue/GSAP specification. No browser rendering, contrast or performance pass is claimed.

The Superpowers companion created local session files beneath `.superpowers/brainstorm/`. These contain local viewer state and are not application code. Exclude this directory from commits; no ignore configuration was changed during discovery.

## Selected direction

The user chose 1: Graphite Editorial. See "graphite-editorial-spec.md" for the proposed component specification and "../superpowers/plans/2026-10-19-graphite-editorial.md" for the implementation plan. Historical options above remain as discovery context. No application implementation, push or deployment has been performed.
