# HireMe mail backend

Bun + Hono deployment entry remains `index.ts`. The request/response service is separated into `hire-service.ts`; validation/config/IP policy is in `security.ts`; the bounded single-instance limiter is in `rate-limit.ts`.

## Configuration

Use server-side environment variables from `.env.example`. Never copy RESEND_API_KEY or other server credentials into VITE_ variables. The example key is a placeholder. Existing real .env/Railway variables were not changed.

- RATE_LIMIT_MAX=2 / RATE_LIMIT_WINDOW_MS=300000: attempts per canonical IP, including invalid submissions.
- RATE_LIMIT_MAX_ENTRIES=10000: bounded active IP buckets. Expired buckets are pruned; live buckets are never evicted to make room for new identities.
- GLOBAL_RATE_LIMIT_MAX=20 / GLOBAL_RATE_LIMIT_WINDOW_MS=3600000: process-wide provider submission budget.
- MAX_IN_FLIGHT=2: concurrent provider requests.
- BODY_LIMIT_BYTES=16384 / BODY_TIMEOUT_MS=5000: byte limit and upload/parse deadline.
- RESEND_TIMEOUT_MS=10000: provider deadline. No automatic resend/retry.
- ALLOWED_ORIGINS: exact comma-separated origin URLs; defaults to https://erenboluk.com.tr and https://www.erenboluk.com.tr. Production accepts HTTPS configuration only. Loopback development origins are allowed only outside production.
- TRUST_PROXY=none: ignore all IP headers, use Bun server.requestIP socket peer. This is the local/direct default.
- TRUST_PROXY=railway: trust exactly one valid X-Real-IP edge header, ignore X-Forwarded-For. Auto-selected when both RAILWAY_ENVIRONMENT_ID and RAILWAY_SERVICE_ID exist. Explicit TRUST_PROXY overrides auto-detection. Missing/invalid trusted identity returns 503 rather than using a shared unknown_ip bucket.
- PORT remains Railway-compatible; defaults to 3000. Invalid numeric/proxy/origin/recipient config fails startup with the variable name, without its value.

Railway documents X-Real-IP for the client address: [public networking specs](https://docs.railway.com/networking/public-networking/specs-and-limits). Trust this mode only when the request arrives through the trusted edge; direct/untrusted proxy traffic must not be able to supply this header unchecked. Before production release, verify the actual edge/header path on the deployed service.

The user confirmed **one instance, no Redis**. The in-memory budget is intentionally process-local and resets on restart. Keep one replica. Before scaling out, replace it with a shared atomic TTL store; per-process storage is not a distributed anti-abuse guarantee. A distributed attacker may still exhaust the bounded global budget and temporarily block legitimate mail. Bot verification/WAF can be added if measured abuse requires it; no new external service was introduced.

## API contract

POST /api/hire with application/json and exactly `{name,email,message}`.

- name: trimmed string, 1–120 UTF-16 code units, no header/control characters.
- email: one trimmed mailbox, at most 254 input characters; ASCII local part, no display names/groups/control characters, domain normalized to ASCII and validated label-by-label.
- message: trimmed string, 1–5000 UTF-16 code units. Newlines/tabs are allowed; other control characters are rejected.
- Additional fields, arrays/objects used as strings, malformed JSON or UTF-8: 400. Oversized body: 413. Wrong Content-Type/Content-Encoding: 415. Slow upload: 408.
- Disallowed Origin: 403 before mail processing. Missing Origin is permitted for non-browser clients; CORS is not authentication, and all mail submissions still require trusted IP/rate-limit checks.
- Limit exceeded: 429 with existing `retryAfterMs` plus standard Retry-After. Capacity/concurrency/config/identity failure: generic 503.
- Provider rejection/network failure: generic 502; timeout: generic 504. No provider response message/body is sent to the browser or logs.
- Success remains `{success:true,message:...}`. Receiver/from/provider URL remain server-controlled; only text mail is generated. The existing onboarding sender is preserved; provider/domain onboarding requirements were not changed.

GET / and GET /health remain available and never send mail. Responses use no-store and nosniff; API responses include a generated request ID for redacted logs. No request body, email address, message or secret is logged by the service.

## Verification and running

With the project's supported Bun runtime/dependencies already available:

```sh
bun run test
bun run start
```

Portable service tests can also run with a modern Node runtime supporting TypeScript stripping (verified here on Node 26.7.0):

```sh
npm run test:node
```

From repository root:

```sh
node tests/security/hireme-audit.mjs
```

Tests inject a fake provider fetch and fake credentials; they send no real mail. The browser contract test at `tests/browser/aura-backend-contract.mjs` connects the existing local frontend to the actual new service via request interception; provider delivery is mocked. This verifies the frontend API contract, not the Bun/Hono socket adapter.

No package installation was performed. Nodemailer and @types/nodemailer were removed from the existing manifest and lock; remaining versions/integrities were preserved. Manifest/lock agreement was tested. A frozen Bun install, Bun test run and native Bun/Hono HTTP smoke test remain release checks because Bun/backend node_modules were unavailable in this workspace. Static esbuild bundling checked the TypeScript import graph with Hono/Bun external; this is not type checking or native-runtime proof.

Never push, deploy, change Railway variables, provision services or send real test mail without explicit authorization. These local changes do not update the live backend.
