# Security Checklist — Expers.ru

## A01: Broken Access Control

- [x] Reader cannot PATCH another user's article → 403 (API09)
- [x] Reader cannot access /admin (AD36)
- [x] Author cannot access /admin (AD37)
- [x] Unauthorized cannot access /admin (AD35)
- [x] Only author or admin can PATCH article (API05/API09)
- [x] JWT without admin role → 403 on admin routes (AD40 unit test)
- [ ] **Verify**: Reader cannot POST /api/articles
- [ ] **Verify**: Author cannot approve/reject articles (admin-only endpoints)

## A02: Cryptographic Failures

- [x] JWT signed with HS256, secret from env (auth.ts)
- [x] bcrypt with 10 salt rounds for passwords (auth.ts)
- [x] HTTPS enforced on production (Caddy reverse proxy)
- [x] passwordHash stripped from API responses (toSafeExpert)
- [ ] **Verify**: JWT_SECRET is not logged anywhere
- [ ] **Verify**: TLS certificate valid and auto-renewing

## A03: Injection

- [x] SQL — drizzle-orm parameterized queries
- [x] XSS — React JSX auto-escapes, Next.js SSR
- [x] Zod validation on all API inputs
- [ ] **Verify**: Comment text is properly sanitized
- [ ] **Verify**: Article content HTML is sanitized

## A04: Insecure Design

- [x] Rate limiting on login, register, forgot-password, avatar upload, payment init (rate-limiter.ts)
- [x] JWT expiry: 7 days
- [x] Password reset code: 6 chars, 15-min expiry
- [ ] **WARN**: Rate limit is in-memory, resets on restart
- [ ] **WARN**: No MFA support

## A05: Security Misconfiguration

- [x] JWT_SECRET required (throws if missing)
- [x] TBANK_TEST_MODE prevents accidental production charges
- [x] CORS headers in API responses (AD39)
- [ ] **Verify**: CSP headers configured
- [ ] **Verify**: Error pages don't leak stack traces
- [ ] **Verify**: .env files in .gitignore

## A06: Vulnerable Components

- [x] npm audit in CI (security-audit job)
- [x] package-lock.json in repo for deterministic builds
- [ ] **Schedule**: Monthly dependency review

## A07: Auth Failures

- [x] Rate limiting prevents brute-force on login (5 req/15 min)
- [x] Rate limiting on forgot-password (prevents enumeration)
- [x] Password reset code: 6-char, 15-min window
- [x] Forgot-password always returns 200 (no user enumeration)
- [ ] **WARN**: No account lockout after N failed attempts
- [ ] **WARN**: No refresh token / token revocation

## A08: Software & Data Integrity

- [x] package-lock.json committed
- [x] CI runs on PR before merge
- [ ] **Verify**: Docker images use specific tags, not `latest`
- [ ] **Verify**: Node.js version pinned

## A09: Logging & Monitoring

- [x] Health check endpoint (/api/health)
- [x] Structured error responses (JSON with error/details)
- [ ] **Missing**: Structured logging (no pino/winston)
- [ ] **Missing**: Audit log for sensitive actions (role changes, article deletions)
- [ ] **Missing**: Alerting on error spikes

## A10: SSRF

- [x] T-Bank API URL hardcoded (securepay.tinkoff.ru)
- [x] No user-controlled URLs in server-side requests
- [ ] **Verify**: No open redirect in article URLs

## A11: Business Logic

- [x] Article status machine: draft → pending_payment → pending_review → published → archived
- [x] Payment required before publication
- [x] Admin approval required after payment
- [x] Articles can be unpublished back to draft
- [ ] **Verify**: Double payment for same article is prevented
- [ ] **Verify**: Payment cancellation after CONFIRMED is prevented
- [ ] **Verify**: Article status transitions are atomic

---

**Key:** [x] = Verified by tests, [ ] = Manual verification needed
