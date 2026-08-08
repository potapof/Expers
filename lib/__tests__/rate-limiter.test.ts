import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("rate-limiter", () => {
  let checkRateLimit: typeof import("../rate-limiter").checkRateLimit;
  let resetRateLimit: typeof import("../rate-limiter").resetRateLimit;
  let NextRequest: typeof import("next/server").NextRequest;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-23T12:00:00Z"));
    vi.resetModules();

    const ns = await import("next/server");
    NextRequest = ns.NextRequest;

    const mod = await import("../rate-limiter");
    checkRateLimit = mod.checkRateLimit;
    resetRateLimit = mod.resetRateLimit;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function makeRequest(ip?: string, extraHeaders?: Record<string, string>) {
    const headers: Record<string, string> = { ...extraHeaders };
    if (ip) {
      headers["x-forwarded-for"] = ip;
    }
    return new NextRequest("http://localhost/api/test", { headers });
  }

  it("should allow first request", () => {
    const result = checkRateLimit(makeRequest("1.2.3.4"));
    expect(result).toBeNull();
  });

  it("should allow 5 requests in window", () => {
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(makeRequest("1.2.3.4"));
      expect(result).toBeNull();
    }
  });

  it("should block 6th request with 429", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(makeRequest("1.2.3.4"));
    }
    const result = checkRateLimit(makeRequest("1.2.3.4"));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
  });

  it("should allow requests after window expires", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(makeRequest("1.2.3.4"));
    }
    // 6th should be blocked
    expect(checkRateLimit(makeRequest("1.2.3.4"))?.status).toBe(429);

    // Advance past the 15-minute window
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    // Now should be allowed again
    expect(checkRateLimit(makeRequest("1.2.3.4"))).toBeNull();
  });

  it("should track different IPs independently", () => {
    // Exhaust IP 1
    for (let i = 0; i < 5; i++) {
      checkRateLimit(makeRequest("10.0.0.1"));
    }
    expect(checkRateLimit(makeRequest("10.0.0.1"))?.status).toBe(429);

    // IP 2 should still work
    expect(checkRateLimit(makeRequest("10.0.0.2"))).toBeNull();
  });

  it("should use 'unknown' IP when no headers set", () => {
    const req = new NextRequest("http://localhost/api/test");
    // 5 from "unknown" IP
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req)).toBeNull();
    }
    expect(checkRateLimit(req)?.status).toBe(429);
  });

  it("should extract IP from x-real-ip header", () => {
    const req = makeRequest(undefined, { "x-real-ip": "5.5.5.5" });
    expect(checkRateLimit(req)).toBeNull();
  });

  it("should reset rate limit for specific IP", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(makeRequest("1.2.3.4"));
    }
    expect(checkRateLimit(makeRequest("1.2.3.4"))?.status).toBe(429);

    resetRateLimit(makeRequest("1.2.3.4"));
    expect(checkRateLimit(makeRequest("1.2.3.4"))).toBeNull();
  });

  it("should clean expired entries on next request", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(makeRequest("1.2.3.4"));
    }

    // Advance past the window
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    // Cleanup runs inside checkRateLimit, should reset the entry
    expect(checkRateLimit(makeRequest("1.2.3.4"))).toBeNull();
  });

  it("should use LAST IP from x-forwarded-for list (proxy-appended)", () => {
    // Trusted proxy appends the real client IP last. Client-supplied
    // headers are prepended and must NOT be trusted for rate limiting.
    const req = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8, 10.0.0.1" },
    });

    // All 5 from last IP (10.0.0.1)
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req)).toBeNull();
    }
    expect(checkRateLimit(req)?.status).toBe(429);

    // A request with a different last IP is tracked independently
    const req2 = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8, 8.8.8.8" },
    });
    expect(checkRateLimit(req2)).toBeNull();
  });
});
