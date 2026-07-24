/**
 * Smoke tests — быстрый sanity check (<30s), запускается через --grep '@smoke'.
 * Использование: npm run test:smoke
 */
import { test, expect } from "@playwright/test";
import { TEST_USERS } from "./helpers/auth";

test.describe("@smoke — Sanity Check", () => {
  test("@smoke S01 — Health check returns 200", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.database).toBe("connected");
  });

  test("@smoke S02 — Главная страница загружается", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 10000,
    });
  });

  test("@smoke S03 — Логин выдаёт JWT", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: {
        email: TEST_USERS.reader.email,
        password: TEST_USERS.reader.password,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
  });

  test("@smoke S04 — Каталог возвращает статьи", async ({ request }) => {
    const res = await request.get("/api/articles");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.articles)).toBeTruthy();
  });

  test("@smoke S05 — Статическая страница /about отдаёт 200", async ({
    request,
  }) => {
    const res = await request.get("/about");
    expect(res.status()).toBe(200);
  });

  test("@smoke S06 — Статическая страница /contacts отдаёт 200", async ({
    request,
  }) => {
    const res = await request.get("/contacts");
    expect(res.status()).toBe(200);
  });

  test("@smoke S07 — Админ-дашборд с admin-токеном отдаёт 200", async ({
    request,
  }) => {
    const loginRes = await request.post("/api/auth/login", {
      data: {
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      },
    });
    const { token } = await loginRes.json();
    const res = await request.get("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("@smoke S08 — Страница статьи рендерится", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 10000,
    });
  });
});
