import { test, expect } from "@playwright/test";

const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  mobile: { width: 375, height: 812 },
};

test.describe("Visual Regression — Скриншоты", () => {
  test("VR01 — Главная (каталог) — Desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("catalog-desktop.png", {
      fullPage: false,
    });
  });

  test("VR02 — Главная (каталог) — Mobile", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("catalog-mobile.png", {
      fullPage: false,
    });
  });

  test("VR03 — О каталоге — Desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("about-desktop.png", {
      fullPage: false,
    });
  });

  test("VR04 — Услуги — Desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/services", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("services-desktop.png", {
      fullPage: false,
    });
  });

  test("VR05 — Контакты — Desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/contacts", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("contacts-desktop.png", {
      fullPage: false,
    });
  });

  test("VR06 — Оферта — Desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/offer", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("offer-desktop.png", {
      fullPage: false,
    });
  });

  test("VR07 — Политика конфиденциальности — Desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("privacy-desktop.png", {
      fullPage: false,
    });
  });

  test("VR08 — Условия возврата — Desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/refund", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("refund-desktop.png", {
      fullPage: false,
    });
  });

  test("VR09 — Страница статьи — Desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot("article-desktop.png", {
      fullPage: false,
    });
  });

  test("VR10 — Страница статьи — Mobile", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot("article-mobile.png", {
      fullPage: false,
    });
  });

  test("VR11 — Диалог логина — Desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const loginBtn = page.getByRole("button", { name: "Войти" });
    if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginBtn.click();
      await page.waitForTimeout(1000);
    }
    await expect(page).toHaveScreenshot("login-dialog-desktop.png", {
      fullPage: false,
    });
  });

  test("VR12 — Диалог регистрации — Desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const loginBtn = page.getByRole("button", { name: "Войти" });
    if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginBtn.click();
      await page.waitForTimeout(800);
      const registerTab = page.getByText("Регистрация");
      if (await registerTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await registerTab.click();
        await page.waitForTimeout(500);
      }
    }
    await expect(page).toHaveScreenshot("register-dialog-desktop.png", {
      fullPage: false,
    });
  });
});
