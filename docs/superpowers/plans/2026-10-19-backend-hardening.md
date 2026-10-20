# Mail backend hardening implementation plan

User approved implementing the security review findings. Main agent only; preserve all UI work and the `{name,email,message}` / `retryAfterMs` API contract. No real emails, package installation, push or deployment.

1. RED: real Request/Response tests for input/size/CORS/IP/rate limits/error privacy/timeouts; test bounded TTL buckets and config fail-closed.
2. Implement portable TypeScript security/core service, used by a thin existing Bun+Hono adapter. Use actual peer IP locally, Railway X-Real-IP only in explicit/auto-detected trusted Railway mode. Ignore untrusted XFF.
3. Bound per-IP storage, prune expired buckets, validate config, add global send budget and concurrency cap. Clarify single-instance memory-store scope; await user topology information before claiming distributed protection.
4. Stream-read at most 16KiB with deadline; strict trimmed field schema; exact CORS origins and JSON Content-Type; safe status codes, Retry-After, generic errors, redacted logs and provider timeout/abort.
5. Remove unused Nodemailer/@types references from package and existing lockfile without dependency resolution. Harden env ignore and document Railway/env configuration.
6. Verify core tests with available Node runtime; Hono/Bun adapter via available tools only (no dependency install). Preserve and report any unverified native/runtime boundary. Update audit report and list files.

Completed locally: 21 service tests + 3 frontend contract cases passed. User confirmed single instance/no Redis. No dependency installation or live changes. Native Bun/Hono/frozen-install checks remain unverified release gates; see docs/aura/backend-hardening.md.
