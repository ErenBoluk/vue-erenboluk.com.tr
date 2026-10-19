# Project AURA — Codex rules

## Mission
Modernize the existing Vue portfolio with a premium dark UI and balanced, accessible animation. Preserve current routes, content, i18n, SEO, and working integrations.

## Workflow
1. Inspect repository and scripts before editing; do not assume paths or packages.
2. Brainstorm and propose a short plan for changes spanning multiple components.
3. Delegate independent, bounded work to subagents; avoid simultaneous edits to the same files.
4. Implement minimal changes; favor Vue 3 idioms, existing Tailwind tokens, and installed GSAP.
5. Verify with repository's actual scripts, browser tests where available, and a manual accessibility checklist.
6. Summarize changed files, tests run, risks, and remaining work. Never claim tests passed without running them.

## UI and motion
- Dark, editorial, restrained; avoid gratuitous blur and animation.
- Use transform and opacity for motion; avoid layout thrashing.
- Respect prefers-reduced-motion and keyboard/touch users.
- Clean up GSAP contexts, listeners and requestAnimationFrame on component unmount.
- Prefer progressive enhancement; no WebGL without a performance case.

## Deployment
- Target Railway, not Vercel. Do not add Vercel config.
- Inspect any existing backend and hosting settings before deployment changes.
- Never expose secrets or put server secrets in VITE_ variables.
- Never deploy, push, or modify production environment without explicit approval.

## Agent delegation
- Project agents are standalone TOML files in `.codex/agents/`; see `docs/aura/agent-infrastructure.md`.
- The primary agent owns the plan, integration and final verification. Delegate independent bounded work with an objective, explicit file ownership, constraints, acceptance criteria and required checks.
- Use explorer for architecture, designer for UI specifications, frontend-engineer for Vue implementation, motion-engineer for GSAP, and qa-reviewer for independent review.
- Never assign simultaneous writes to the same file. Sequence frontend and motion work when they touch the same component. Agents share the workspace; preserve others' edits.
- Read-only exploration and review may run alongside implementation. Review must inspect the final changes before completion. Report blockers to the primary agent; avoid recursive delegation unless explicitly requested.
- Consult installed project skills in `.agents/skills/`, including `ui-ux-pro-max`, for relevant tasks. Infrastructure setup does not authorize a UI redesign.
