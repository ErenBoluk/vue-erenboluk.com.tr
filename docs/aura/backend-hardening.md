# Mail backend hardening — completion report

Implemented locally in the user's Sandbox checkout. User confirmed one instance and no Redis. No frontend source changes were needed for this task.

## Files

Modified:
- `backend-hireme/index.ts`: thin existing Bun/Hono entry, validated configuration, real socket peer passed separately to the service, generic adapter errors.
- `backend-hireme/package.json`, `bun.lock`: remove unused nodemailer/@types/nodemailer; preserve Hono and remaining locked versions; add native/portable test scripts.
- `backend-hireme/.env.example`: safe defaults and documented limits/proxy/origin options; placeholder only.
- `backend-hireme/.gitignore`: ignore .env variants, allow example.
- `tests/security/hireme-audit.mjs`: now runs fixed-behavior regressions; historical source probes remain archived.
- `docs/aura/backend-security-review.md`: marked historical findings with remediation link.
- `docs/superpowers/plans/2026-10-19-backend-hardening.md`: implementation status.

New:
- `backend-hireme/security.ts`: strict config, origin/IP policy, bounded/deadlined body parsing, input validation.
- `backend-hireme/rate-limit.ts`: bounded TTL/pruning limiter, no live-key eviction.
- `backend-hireme/hire-service.ts`: actual Request/Response endpoint, per-IP/global/concurrency budgets, provider timeout/abort, generic errors, redacted logs.
- `backend-hireme/test/security.test.ts`, `test/hire-service.test.ts`.
- `backend-hireme/README.md`: defaults, limits, testing, Railway trust and release checks.
- `tests/browser/aura-backend-contract.mjs`: real frontend + new service + mocked provider.
- This report and `docs/aura/review/backend-security/hardening-verification.json`.

## Evidence

- RED observed for missing modules before implementation. Further red/green case caught URL delimiters being silently stripped during email-domain normalization; malformed domains are now rejected before normalization.
- **21/21 portable backend tests passed**: field types/length/control characters, exact origins, streamed byte limit, malformed/slow body, proxy identity, header spoof resistance, IPv6 canonicalization, capacity/pruning, global quota, concurrency, timeout/disconnect abort, error/log privacy, missing credentials, health/method handling and manifest/lock consistency.
- **3/3 browser contract scenarios passed** against the new service: valid submission success; invalid schema retained as editable form without provider call; provider failure followed by 429 preserves the existing frontend cooldown behavior.
- TypeScript esbuild bundling/import graph passed with Hono/Bun external. No new generated bundle was saved.
- `git check-ignore` confirms .env.production/.env.local ignored. `git diff --check` passed with CRLF notices only.
- Real provider network requests/emails: zero. Credentials used in tests were fake. Existing frontend preview remains available; no UI rebuild was necessary for this backend-only change.

## Release limitations

Bun/backend dependencies were not installed in the available environment, and installation was intentionally avoided. Therefore native Bun/Hono startup, full typecheck, frozen lock installation, real Railway edge header behavior and real Resend delivery were **not** tested. Do not treat passing portable tests as native production validation.

The limiter is appropriate for the confirmed single instance; restart resets its state. Shared persistence is required before adding replicas. The global budget intentionally bounds abuse but cannot guarantee availability under a distributed attack. Exact trusted proxy behavior must be checked on release; never enable railway trust for arbitrary direct traffic.

No commit, push, deployment, live environment change, Redis provisioning or real mail was performed. The currently deployed backend remains unchanged until an explicitly approved release.
