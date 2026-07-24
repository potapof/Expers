import { describe, it, expect, vi, beforeEach } from "vitest";

const mockVerifyToken = vi.fn();

vi.mock("../auth", () => ({
  verifyToken: (token: string) => mockVerifyToken(token),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("verifyAdmin", () => {
  it("should return 401 when no Authorization header", async () => {
    const { verifyAdmin } = await import("../admin");
    const { NextRequest } = await import("next/server");

    const request = new NextRequest("http://localhost/api/admin/test");
    const result = verifyAdmin(request);

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(401);
  });

  it("should return 401 when Authorization header is not Bearer", async () => {
    const { verifyAdmin } = await import("../admin");
    const { NextRequest } = await import("next/server");

    const request = new NextRequest("http://localhost/api/admin/test", {
      headers: { Authorization: "Basic dGVzdDp0ZXN0" },
    });
    const result = verifyAdmin(request);

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(401);
  });

  it("should return 401 when token is invalid", async () => {
    mockVerifyToken.mockReturnValue(null);

    const { verifyAdmin } = await import("../admin");
    const { NextRequest } = await import("next/server");

    const request = new NextRequest("http://localhost/api/admin/test", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    const result = verifyAdmin(request);

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(401);
  });

  it("should return 403 when user is not admin", async () => {
    mockVerifyToken.mockReturnValue({
      id: "user-1",
      email: "reader@test.com",
      name: "Reader",
      role: "expert",
    });

    const { verifyAdmin } = await import("../admin");
    const { NextRequest } = await import("next/server");

    const request = new NextRequest("http://localhost/api/admin/test", {
      headers: { Authorization: "Bearer valid-token" },
    });
    const result = verifyAdmin(request);

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(403);
  });

  it("should return payload when user is admin", async () => {
    mockVerifyToken.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      name: "Admin",
      role: "admin",
    });

    const { verifyAdmin } = await import("../admin");
    const { NextRequest } = await import("next/server");

    const request = new NextRequest("http://localhost/api/admin/test", {
      headers: { Authorization: "Bearer admin-token" },
    });
    const result = verifyAdmin(request);

    expect(result.payload).toBeDefined();
    expect(result.payload!.role).toBe("admin");
    expect(result.payload!.email).toBe("admin@test.com");
    expect(result.error).toBeUndefined();
  });

  it("should return 403 when token is valid but role is reader", async () => {
    mockVerifyToken.mockReturnValue({
      id: "reader-1",
      email: "reader@test.com",
      name: "Reader",
      role: "reader",
    });

    const { verifyAdmin } = await import("../admin");
    const { NextRequest } = await import("next/server");

    const request = new NextRequest("http://localhost/api/admin/test", {
      headers: { Authorization: "Bearer reader-token" },
    });
    const result = verifyAdmin(request);

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(403);
  });
});
