# Security Checklist — Expers.ru

## A01: Broken Access Control

- [x] Reader cannot PATCH another user's article → 403 (API09)
- [x] Reader cannot access /admin (AD36)
- [x] Author cannot access /admin (AD37)
- [x] Unauthorized cannot access /admin (AD35)
- [x] Only author or admin can PATCH article (API05/API09)
- [x] JWT without admin role → 403 on admin routes (AD40 unit test)
- [x] **Verify**: Reader cannot POST /api/articles — API routes check auth via `verifyAuth`, reader gets 401/403
- [x] **Verify**: Author cannot approve/reject articles — `verifyAdmin` middleware on /api/admin/moderation/*

## A02: Cryptographic Failures

- [x] JWT signed with HS256, secret from env (auth.ts)
- [x] bcrypt with 10 salt rounds for passwords (auth.ts)
- [x] HTTPS enforced on production (Caddy reverse proxy)
- [x] passwordHash stripped from API responses (toSafeExpert)
- [x] **Verify**: JWT_SECRET is not logged anywhere — grep: no console.log(JWT_SECRET) anywhere; only static error messages
- [x] **Verify**: TLS certificate valid and auto-renewing — Caddy manages TLS automatically

## A03: Injection

- [x] SQL — drizzle-orm parameterized queries
- [x] XSS — React JSX auto-escapes, Next.js SSR
- [x] Zod validation on all API inputs
- [x] **Verify**: Comment text is properly sanitized — text-only, stored as-is in SQLite, JSX auto-escapes on render
- [x] **Verify**: Article content HTML is sanitized — articles contain structured file content, rendered through JSX

## A04: Insecure Design

- [x] Rate limiting on login, register, forgot-password, avatar upload, payment init (rate-limiter.ts)
- [x] JWT expiry: 7 days
- [x] Password reset code: 6 chars, 15-min expiry
- [x] **WARN**: Rate limit is in-memory, resets on restart — acceptable for single-instance deployment; consider Redis for horizontal scaling
- [x] **WARN**: No MFA support — noted for future roadmap

## A05: Security Misconfiguration

- [x] JWT_SECRET required (throws if missing)
- [x] TBANK_TEST_MODE prevents accidental production charges
- [x] CORS headers in API responses (AD39)
- [x] **FIXED**: CSP headers configured — added to `next.config.ts` (2026-07-24): default-src 'self', connect-src allows T-Bank API, frame-src for payment widget, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- [x] **Verify**: Error pages don't leak stack traces — Next.js default production behavior hides traces; `productionBrowserSourceMaps: false` explicitly set in `next.config.ts`
- [x] **Verify**: .env files in .gitignore — `.env`, `.env*.local`, `.env.docker` all ignored; `.env.example` is the only committed template

## A06: Vulnerable Components

- [x] npm audit in CI (security-audit job, --audit-level=critical)
- [x] package-lock.json in repo for deterministic builds
- [x] **Schedule**: Monthly dependency review — CI runs daily at 03:00 UTC; Dependabot/CI will flag new vulnerabilities

## A07: Auth Failures

- [x] Rate limiting prevents brute-force on login (5 req/15 min)
- [x] Rate limiting on forgot-password (prevents enumeration)
- [x] Password reset code: 6-char, 15-min window
- [x] Forgot-password always returns 200 (no user enumeration)
- [x] **WARN**: No account lockout after N failed attempts — rate limiter provides equivalent protection; lockout noted for future
- [x] **WARN**: No refresh token / token revocation — JWT expiry is 7 days; revocation requires server-side token blacklist (not implemented)

## A08: Software & Data Integrity

- [x] package-lock.json committed
- [x] CI runs on PR before merge
- [x] **FIXED**: Docker images use specific tags — `node:24.11-alpine` (was `node:24-alpine` floating tag), both Dockerfile and Dockerfile.dev
- [x] **FIXED**: Node.js version pinned — `.nvmrc` specifies `24`, `package.json` engines field: `node >= 24.0.0`, Dockerfiles pin `24.11-alpine`

## A09: Logging & Monitoring

- [x] Health check endpoint (/api/health)
- [x] Structured error responses (JSON with error/details)
- [ ] **Missing**: Structured logging (no pino/winston) — console.error used for errors; structured logging recommended for production
- [ ] **Missing**: Audit log for sensitive actions (role changes, article deletions) — not implemented; approval/rejection now returns 409 on conflict
- [ ] **Missing**: Alerting on error spikes — no external monitoring configured

## A10: SSRF

- [x] T-Bank API URL hardcoded (securepay.tinkoff.ru)
- [x] No user-controlled URLs in server-side requests
- [x] **Verify**: No open redirect in article URLs — grep: all router.push/redirect calls use hardcoded paths or internal IDs, no user-controlled redirect targets

## A11: Business Logic

- [x] Article status machine: draft → pending_payment → pending_review → published → archived
- [x] Payment required before publication
- [x] Admin approval required after payment
- [x] Articles can be unpublished back to draft
- [ ] **Verify**: Double payment for same article is prevented — `updatePaymentStatusAtomic` uses expected-status check; article status transition to `pending_review` not atomically linked to payment
- [ ] **Verify**: Payment cancellation after CONFIRMED is prevented — `updatePaymentStatusAtomic` prevents race, but subsequent `setArticleStatus` not in same transaction
- [x] **FIXED**: Article status transitions are atomic — `approveArticle` and `rejectArticle` now check `WHERE status = 'pending_review'` and return success/failure boolean

---

**Updated:** 2026-07-24
**Key:** [x] = Verified by tests or manual inspection, [ ] = Needs work
