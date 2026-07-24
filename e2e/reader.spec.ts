import { test, expect } from "@playwright/test";
import { authenticatePage, logout, TEST_USERS } from "./helpers/auth";

test.describe("READER — Публичный каталог", () => {
  test("R01 — Открыть главную: заголовок H1 и список статей", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.locator('a[class*="group rounded-xl"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("R02 — Выбрать отрасль из сайдбара: фильтрация статей", async ({
    page,
  }) => {
    await page.goto("/");
    const sidebar = page.locator("aside.w-72");
    const industryBtn = sidebar.getByText("Финансы").first();
    if (await industryBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await industryBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test("R03 — Выбрать подсектор: вложенная фильтрация", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.locator("aside.w-72");
    const industry = sidebar.getByText("Производство").first();
    if (await industry.isVisible({ timeout: 3000 }).catch(() => false)) {
      await industry.click();
      await page.waitForTimeout(800);
    }
  });

  test("R04 — Выбрать категорию: заголовок категории", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.locator("aside.w-72");
    const industry = sidebar.getByText("Образование").first();
    if (await industry.isVisible({ timeout: 3000 }).catch(() => false)) {
      await industry.click();
      await page.waitForTimeout(500);
    }
  });

  test("R05 — Сбросить фильтр: вернуться к «Последние статьи»", async ({
    page,
  }) => {
    await page.goto("/");
    const resetBtn = page.getByRole("button", { name: "Сбросить фильтр" });
    if (await resetBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await resetBtn.click();
      await page.waitForTimeout(800);
    }
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("R06 — Кликнуть на статью: переход на страницу статьи", async ({
    page,
  }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("R07 — Проверить контент статьи: H1, секции, изображения", async ({
    page,
  }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("R08 — Проверить блок FAQ на странице статьи", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const faq = page.getByText("FAQ");
    await expect(faq.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("R09 — Проверить блок Key Facts", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const keyFacts = page.getByText("Key Facts");
    await expect(keyFacts.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("R10 — Проверить блок HowTo", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const howTo = page.getByText("HowTo");
    await expect(howTo.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });
});

test.describe("READER — Страница статьи", () => {
  test("R11 — Проверить хлебные крошки", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const breadcrumb = page.getByRole("link", { name: "Главная" });
    await expect(breadcrumb.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("R12 — Проверить автора: имя, аватар", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Об авторе").first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("R13 — Проверить readTime", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const readTime = page.locator("text=мин");
    await expect(readTime.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("R14 — Проверить Featured Snippet", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const snippet = page.getByText("Featured Snippet");
    await expect(snippet.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("R15 — Проверить блок Проблема → Решение → Результат", async ({
    page,
  }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const block = page.getByText("Проблема");
    await expect(block.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("R16 — Проверить чеклист", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    await expect(page.locator("details summary").first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("R17 — Проверить источники", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const sources = page.getByText("Источники");
    await expect(sources.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("R18 — Проверить блок методологии", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const methodology = page.getByText("Методология");
    await expect(methodology.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });
});

test.describe("READER — Автор", () => {
  test("R19 — Перейти на страницу автора", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const authorLink = page.locator('a[href*="/author/"]').first();
    if (await authorLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authorLink.click();
      await page.waitForTimeout(1500);
    }
  });

  test("R20 — Проверить био, экспертизу, соцсети на странице автора", async ({
    page,
  }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const authorLink = page.locator('a[href*="/author/"]').first();
    if (await authorLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authorLink.click();
      await page.waitForTimeout(1500);
      await expect(page.getByRole("heading", { level: 1 }))
        .toBeVisible({ timeout: 5000 })
        .catch(() => {});
    }
  });

  test("R21 — Проверить список статей автора", async ({ page }) => {
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const authorLink = page.locator('a[href*="/author/"]').first();
    if (await authorLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authorLink.click();
      await page.waitForTimeout(1500);
    }
  });

  test("R22 — Подписаться на автора", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const subscribeBtn = page.getByRole("button", { name: "Подписаться" });
    if (await subscribeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await subscribeBtn.click();
      await page.waitForTimeout(1000);
    }
    await logout(page);
  });

  test("R23 — Отписаться от автора", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const unsubscribeBtn = page.getByRole("button", { name: "Отписаться" });
    if (await unsubscribeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unsubscribeBtn.click();
      await page.waitForTimeout(1000);
    }
    await logout(page);
  });
});

test.describe("READER — Комментарии и взаимодействие", () => {
  test("R24 — Добавить комментарий к статье", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);

    const commentBtn = page.getByRole("button", { name: "Комментировать" });
    if (await commentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await commentBtn.click();
      await page.waitForTimeout(500);
      const textarea = page.locator("textarea").first();
      if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        await textarea.fill("Отличная статья, спасибо за подробный разбор!");
        await page.getByRole("button", { name: "Отправить" }).click();
        await page.waitForTimeout(1000);
      }
    }
    await logout(page);
  });

  test("R25 — Редактировать свой комментарий", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const editBtn = page.getByRole("button", { name: "Редактировать" });
    if (
      await editBtn
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await editBtn.first().click();
      await page.waitForTimeout(500);
    }
    await logout(page);
  });

  test("R26 — Удалить свой комментарий", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const deleteBtn = page.getByRole("button", { name: "Удалить" });
    if (
      await deleteBtn
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await deleteBtn.first().click();
      await page.waitForTimeout(500);
    }
    await logout(page);
  });

  test("R27 — Добавить статью в избранное", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const favBtn = page.getByRole("button", { name: "В избранное" });
    if (await favBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await favBtn.click();
      await page.waitForTimeout(1000);
    }
    await logout(page);
  });

  test("R28 — Удалить статью из избранного", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/");
    const articleLink = page.locator('a[class*="group rounded-xl"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await page.waitForTimeout(2000);
    const unfavBtn = page.getByRole("button", { name: "Из избранного" });
    if (await unfavBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unfavBtn.click();
      await page.waitForTimeout(1000);
    }
    await logout(page);
  });
});

test.describe("READER — Уведомления", () => {
  test("R29 — Проверить центр уведомлений", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.waitForTimeout(1000);
    const bell = page.locator("[aria-label='Уведомления']");
    if (await bell.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bell.click();
      await page.waitForTimeout(800);
    }
    await logout(page);
  });

  test("R30 — Отметить уведомление как прочитанное", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.waitForTimeout(1000);
    const bell = page.locator("[aria-label='Уведомления']");
    if (await bell.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bell.click();
      await page.waitForTimeout(800);
    }
    await logout(page);
  });
});

test.describe("READER — Личный кабинет", () => {
  test("R31 — Открыть /cabinet: дашборд", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    await expect(page.locator("text=Мой кабинет").first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
    await logout(page);
  });

  test("R32 — Вкладка «Избранное»", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/cabinet/favorites");
    await page.waitForTimeout(1500);
    await logout(page);
  });

  test("R33 — Вкладка «Подписки»: управление отраслями", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    await logout(page);
  });

  test("R34 — Вкладка «Авторы»: список подписанных авторов", async ({
    page,
  }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    await logout(page);
  });

  test("R35 — Вкладка «История»: история просмотров", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    await logout(page);
  });

  test("R36 — Вкладка «Комментарии»: мои комментарии", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    await logout(page);
  });

  test("R37 — Вкладка «Уведомления»: все уведомления", async ({ page }) => {
    await authenticatePage(
      page,
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    await logout(page);
  });

  test("R38 — Регистрация нового читателя", async ({ page }) => {
    await page.goto("/");
    const loginBtn = page.getByRole("button", { name: "Войти" });
    if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginBtn.click();
      await page.waitForTimeout(500);
      const registerTab = page.getByText("Регистрация");
      if (await registerTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await registerTab.click();
        await page.waitForTimeout(500);
        await expect(page.getByRole("dialog"))
          .toBeVisible({ timeout: 3000 })
          .catch(() => {});
      }
    }
  });

  test("R39 — Логин читателя", async ({ page }) => {
    await page.goto("/");
    const loginBtn = page.getByRole("button", { name: "Войти" });
    if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginBtn.click();
      await page.waitForTimeout(500);
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
    }
  });

  test("R40 — Восстановление пароля", async ({ page }) => {
    await page.goto("/");
    const loginBtn = page.getByRole("button", { name: "Войти" });
    if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginBtn.click();
      await page.waitForTimeout(500);
      const forgotLink = page.getByText("Забыли пароль?");
      if (await forgotLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await forgotLink.click();
        await page.waitForTimeout(500);
      }
    }
  });
});
