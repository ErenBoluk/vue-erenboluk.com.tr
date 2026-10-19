# Project AURA agent infrastructure

## Configuration and compatibility

Inspected with `codex-cli 0.163.0`. This version discovers standalone project agents in `.codex/agents/*.toml`. Each file declares `name`, `description` and `developer_instructions`. Do not convert these into legacy `[agents.<role>]` config-file registrations. `.codex/config.toml` enables agents and caps concurrent spawned threads at three; the primary agent is additional. Five available roles do not require five concurrent sessions.

Models, reasoning effort, permissions, providers and connected services inherit from the parent. Read-only role instructions are behavioral constraints, not separate filesystem sandboxes. Project configuration requires a trusted project; the inspected user configuration already trusts this repository. User-level configuration was not changed. Restart Codex from this repository after changes to refresh discovery.

Official reference: https://learn.chatgpt.com/docs/agent-configuration/subagents

## Roles and delegation

| Role | Responsibility | Default editing policy |
| --- | --- | --- |
| explorer | Architecture, scripts, routes, dependencies, backend and deployment evidence | Read-only |
| designer | Premium dark UI specifications, tokens, responsive UX and accessibility | Proposals; edits only when assigned |
| frontend-engineer | Vue components and responsive implementation | Assigned files only |
| motion-engineer | Vue lifecycle and accessible GSAP motion | Assigned files only |
| qa-reviewer | Independent tests, regression and accessibility review | Read-only unless reassigned |

The primary agent inspects the request, makes a short plan and assigns bounded tasks. Every handoff includes goal, owned files or read-only responsibility, constraints, expected output and validation. Agents share the working directory and must preserve each other's changes. Run independent analysis in parallel; serialize component and animation changes touching the same files. The primary integrates results and verifies the final state. Do not recursively delegate by default.

Example request:

> Have explorer map the contact flow and qa-reviewer inspect its regression risks, both read-only. Wait for both and propose a short implementation plan. Do not change application files, push or deploy.

For later approved UI work: designer specifies the change, frontend-engineer implements owned components, motion-engineer implements separately owned motion or follows sequentially, then qa-reviewer checks the final result. No UI redesign is part of this setup.

## Detected project skills

Each directory below contains a `SKILL.md` under `.agents/skills/`:

- banner-design
- brand
- design
- design-system
- railway-deploy
- slides
- ui-styling
- ui-ux-pro-max (includes Vue stack data and local search tooling)
- vue-gsap-motion

Skills are discovered separately from custom agents and inherited by subagents. Read the applicable skill before using it; installing more skills or packages is unnecessary for this setup. The session also exposes global system skills, superpowers workflow skills and plugin skills; those user-specific installations are not vendored or modified here.

## Repository evidence and verification

Frontend: Vue 3, Vite 6, Tailwind 4, GSAP 3, vue-router, vue-i18n and @unhead/vue. Existing scripts: `npm run dev`, `npm run build`, `npm run preview`. No frontend test or lint script is defined. Routes include home, hireme, about and portfolio with en/tr language handling. `backend-hireme` uses Bun, Hono and email delivery, with start/dev scripts. Inspect this backend before hosting changes.

Keep Railway as the deployment platform. This setup changes no hosting configuration. Never push, deploy or modify production without explicit user approval; keep server secrets out of VITE_ variables.

To verify discovery after restarting Codex at the project root, ask it to spawn each role by its exact name for a read-only acknowledgement of its role and constraints. Use batches of at most three. A successful role spawn proves discovery; TOML parsing alone does not. `/subagents` shows spawned sessions rather than a registry of installed definitions. `codex debug prompt-input` does not necessarily list custom roles.

For subsequent implementation, run actual available scripts and browser checks where available. Manually check keyboard access and focus, contrast, touch targets, responsive layout, reduced motion, cleanup, localized routes and SEO. Infrastructure-only edits do not exercise UI behavior.
