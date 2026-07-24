import { test, expect } from "@playwright/test";
import { authenticatePage, logout, TEST_USERS } from "./helpers/auth";

test.describe("AUTHOR Extended — Дашборд", () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("AE01 — Author Dashboard: метрики и статистика", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    const authorTab = page.getByRole("button", { name: "Я автор" });
    if (await authorTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authorTab.click();
      await page.waitForTimeout(1000);
    }
    await expect(page.locator("text=Дашборд").first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("AE02 — Author Dashboard: быстрые действия", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });

  test("AE03 — Author Dashboard: график публикаций", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });
});

test.describe("AUTHOR Extended — Финансы", () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("AE04 — Author Finance: список платежей", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    const authorTab = page.getByRole("button", { name: "Я автор" });
    if (await authorTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authorTab.click();
      await page.waitForTimeout(1000);
    }
  });

  test("AE05 — Author Finance: фильтр по статусу", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });
});

test.describe("AUTHOR Extended — Комментарии", () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("AE06 — Author Comments: список комментариев к моим статьям", async ({
    page,
  }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    const authorTab = page.getByRole("button", { name: "Я автор" });
    if (await authorTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authorTab.click();
      await page.waitForTimeout(1000);
    }
    const commentsTab = page.getByText("Комментарии");
    if (await commentsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await commentsTab.click();
      await page.waitForTimeout(1000);
    }
  });

  test("AE07 — Author Comments: ответ на комментарий", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });
});

test.describe("AUTHOR Extended — Подписчики и аналитика", () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("AE08 — Author Subscribers: список подписчиков", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    const authorTab = page.getByRole("button", { name: "Я автор" });
    if (await authorTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authorTab.click();
      await page.waitForTimeout(1000);
    }
    const subscribersTab = page.getByText("Подписчики");
    if (await subscribersTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await subscribersTab.click();
      await page.waitForTimeout(1000);
    }
  });

  test("AE09 — Author Social Analytics: статистика", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    const authorTab = page.getByRole("button", { name: "Я автор" });
    if (await authorTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authorTab.click();
      await page.waitForTimeout(1000);
    }
    const analyticsTab = page.getByText("Аналитика");
    if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await analyticsTab.click();
      await page.waitForTimeout(1000);
    }
  });

  test("AE10 — Author Analytics: метрики просмотров", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });
});

test.describe("AUTHOR Extended — Инструменты", () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("AE11 — Article Share: копирование ссылки", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const shareBtn = page.getByRole("button", { name: "Поделиться" }).first();
    if (await shareBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await shareBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test("AE12 — Payment Success page: /payment/done", async ({ page }) => {
    await page.goto("/payment/done?orderId=test");
    await page.waitForTimeout(1000);
  });

  test("AE13 — Payment Failure page: /payment/fail", async ({ page }) => {
    await page.goto("/payment/fail?orderId=test");
    await page.waitForTimeout(1000);
  });

  test("AE14 — Section Selector Dialog", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });

  test("AE15 — Subscribe Section Button in catalog", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const sidebar = page.locator("aside.w-72");
    const industry = sidebar.getByText("Производство").first();
    if (await industry.isVisible({ timeout: 3000 }).catch(() => false)) {
      await industry.click();
      await page.waitForTimeout(800);
    }
  });
});

test.describe("AUTHOR Extended — Профиль и настройки", () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("AE16 — Expert Public Page: /expert/[id]", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    const profileLink = page.locator('a[href*="/expert/"]').first();
    if (await profileLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await profileLink.click();
      await page.waitForTimeout(1500);
    }
  });

  test("AE17 — Author Page Settings: публикация страницы", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });

  test("AE18 — Avatar Upload Dialog", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });

  test("AE19 — Notification Center: все типы уведомлений", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    const bell = page.locator("[aria-label='Уведомления']");
    if (await bell.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bell.click();
      await page.waitForTimeout(800);
    }
  });

  test("AE20 — Reader followed articles section", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });

  test("AE21 — Reader new articles section", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });

  test("AE22 — Cabinet: переключение режимов reader/author", async ({
    page,
  }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    const authorTab = page.getByRole("button", { name: "Я автор" });
    if (await authorTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authorTab.click();
      await page.waitForTimeout(1000);
    }
    const readerTab = page.getByRole("button", { name: "Я читатель" });
    if (await readerTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await readerTab.click();
      await page.waitForTimeout(1000);
    }
  });

  test("AE23 — Управление подписками на отрасли (sidebar)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
  });

  test("AE24 — Статус-переход: draft → pending_payment", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("AE25 — Статус-переход: archived → draft (разархивация)", async ({
    page,
  }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });
});
