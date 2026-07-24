import { APIRequestContext, Page, request } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:8080";

interface TestUser {
  name: string;
  email: string;
  password: string;
  token: string;
}

export async function registerUser(
  api: APIRequestContext,
  name: string,
  email: string,
  password: string
): Promise<{ expert: unknown; token: string }> {
  const res = await api.post(`${BASE}/api/auth/register`, {
    data: { name, email, password },
  });
  if (res.status() === 409) {
    const loginRes = await api.post(`${BASE}/api/auth/login`, {
      data: { email, password },
    });
    return loginRes.json();
  }
  return res.json();
}

export async function loginUser(
  api: APIRequestContext,
  email: string,
  password: string
): Promise<TestUser> {
  const res = await api.post(`${BASE}/api/auth/login`, {
    data: { email, password },
  });
  const body = await res.json();
  return {
    name: body.expert?.name ?? "",
    email,
    password,
    token: body.token as string,
  };
}

export async function setupAuthContext(
  email: string,
  password: string
): Promise<APIRequestContext> {
  const ctx = await request.newContext({
    baseURL: BASE,
    ignoreHTTPSErrors: true,
  });
  const loginRes = await ctx.post("/api/auth/login", {
    data: { email, password },
  });
  const body = await loginRes.json();
  const token = body.token as string;

  return await request.newContext({
    baseURL: BASE,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function authenticatePage(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/");

  // Already logged in?
  const logoutBtn = page.getByRole("button", { name: "Выйти" });
  if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    return;
  }

  // Check if we see the login button (not logged in)
  const loginBtn = page.getByRole("button", { name: "Войти" });
  if (await loginBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await loginBtn.click();
    await page.waitForTimeout(1000);

    const dialog = page.getByRole("dialog");
    // Find email and password fields by role
    const textboxes = dialog.getByRole("textbox");
    const count = await textboxes.count();
    if (count >= 2) {
      await textboxes.nth(count - 2).fill(email);
      await textboxes.nth(count - 1).fill(password);
    } else {
      // Fallback: use placeholders
      await dialog
        .getByPlaceholder("Email")
        .fill(email)
        .catch(() => {});
      await dialog
        .getByPlaceholder("Пароль")
        .fill(password)
        .catch(() => {});
    }
    await dialog.getByRole("button", { name: "Войти" }).click();
    await page.waitForTimeout(2000);
  }
}

export async function logout(page: Page): Promise<void> {
  await page.goto("/");
  const logoutBtn = page.getByRole("button", { name: "Выйти" });
  if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await logoutBtn.click();
    await page.waitForTimeout(1000);
  }
}

export const TEST_USERS = {
  reader: { email: "reader@test.expers.ru", password: "test123456" },
  author: { email: "author@test.expers.ru", password: "test123456" },
  admin: { email: "admin@test.expers.ru", password: "admin123" },
};
