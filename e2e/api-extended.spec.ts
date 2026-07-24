import { test, expect, request } from "@playwright/test";
import { setupAuthContext, TEST_USERS } from "./helpers/auth";

const BASE = process.env.BASE_URL ?? "http://localhost:8080";

test.describe("API Extended — Непокрытые роуты", () => {
  let readerApi: Awaited<ReturnType<typeof setupAuthContext>>;
  let authorApi: Awaited<ReturnType<typeof setupAuthContext>>;
  let adminApi: Awaited<ReturnType<typeof setupAuthContext>>;

  test.beforeAll(async () => {
    readerApi = await setupAuthContext(
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    authorApi = await setupAuthContext(
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
    adminApi = await setupAuthContext(
      TEST_USERS.admin.email,
      TEST_USERS.admin.password
    );
  });

  test("APIE01 — POST /api/auth/reset-password", async () => {
    const ctx = await request.newContext({
      baseURL: BASE,
      ignoreHTTPSErrors: false,
    });
    const res = await ctx.post("/api/auth/reset-password", {
      data: {
        email: TEST_USERS.reader.email,
        code: "000000",
        password: "newpass123",
      },
    });
    expect([200, 400]).toContain(res.status());
  });

  test("APIE02 — GET /api/comments?articleId=", async () => {
    const res = await readerApi.get("/api/comments?articleId=test-id");
    expect(res.status()).toBe(200);
  });

  test("APIE03 — GET /api/comments?authorId=", async () => {
    const res = await readerApi.get("/api/comments?authorId=test-id");
    expect(res.status()).toBe(200);
  });

  test("APIE04 — GET /api/favorites (список избранного)", async () => {
    const res = await readerApi.get("/api/favorites");
    expect(res.status()).toBe(200);
  });

  test("APIE05 — GET /api/subscriptions (мои подписки)", async () => {
    const res = await readerApi.get("/api/subscriptions");
    expect(res.status()).toBe(200);
  });

  test("APIE06 — GET /api/subscriptions?authorId= (подписчики)", async () => {
    const meRes = await authorApi.get("/api/auth/me");
    const me = await meRes.json();
    const authorId = (me.expert as Record<string, unknown>)?.id as string;
    const res = await readerApi.get(`/api/subscriptions?authorId=${authorId}`);
    expect(res.status()).toBe(200);
  });

  test("APIE07 — GET /api/section-subscriptions", async () => {
    const res = await readerApi.get("/api/section-subscriptions");
    expect(res.status()).toBe(200);
  });

  test("APIE08 — POST /api/section-subscriptions", async () => {
    const res = await readerApi.post("/api/section-subscriptions", {
      data: { sectionId: "proizvodstvo" },
    });
    expect(res.status()).toBe(200);
  });

  test("APIE09 — PUT /api/section-subscriptions", async () => {
    const res = await readerApi.put("/api/section-subscriptions", {
      data: { sectionIds: ["proizvodstvo", "finansy"] },
    });
    expect(res.status()).toBe(200);
  });

  test("APIE10 — DELETE /api/section-subscriptions", async () => {
    const res = await readerApi.delete(
      "/api/section-subscriptions?sectionId=proizvodstvo"
    );
    expect(res.status()).toBe(200);
  });

  test("APIE11 — DELETE /api/history (очистка истории)", async () => {
    const res = await readerApi.delete("/api/history");
    expect(res.status()).toBe(200);
  });

  test("APIE12 — GET /api/payments/status", async () => {
    const res = await authorApi.get("/api/payments/status?orderId=test-order");
    expect([200, 404]).toContain(res.status());
  });

  test("APIE13 — GET /api/admin/dashboard (прямой вызов)", async () => {
    const res = await adminApi.get("/api/admin/dashboard");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.totalArticles).toBeDefined();
    expect(body.totalExperts).toBeDefined();
  });

  test("APIE14 — GET /api/admin/articles/stats", async () => {
    const res = await adminApi.get("/api/admin/articles/stats?days=30");
    expect(res.status()).toBe(200);
  });

  test("APIE15 — GET /api/admin/experts/stats", async () => {
    const res = await adminApi.get("/api/admin/experts/stats");
    expect(res.status()).toBe(200);
  });

  test("APIE16 — GET /api/admin/articles (фильтрация)", async () => {
    const res = await adminApi.get(
      "/api/admin/articles?status=published&page=1&pageSize=5"
    );
    expect(res.status()).toBe(200);
  });

  test("APIE17 — GET /api/admin/experts (список)", async () => {
    const res = await adminApi.get("/api/admin/experts");
    expect(res.status()).toBe(200);
  });

  test("APIE18 — GET /api/admin/comments (список)", async () => {
    const res = await adminApi.get("/api/admin/comments?page=1&pageSize=5");
    expect(res.status()).toBe(200);
  });

  test("APIE19 — GET /api/admin/moderation/queue", async () => {
    const res = await adminApi.get("/api/admin/moderation/queue");
    expect(res.status()).toBe(200);
  });

  test("APIE20 — POST /api/admin/moderation/reject", async () => {
    const res = await adminApi.post("/api/admin/moderation/reject", {
      data: { articleId: "nonexistent", reason: "Тестовая причина отклонения" },
    });
    expect([200, 404]).toContain(res.status());
  });
});
