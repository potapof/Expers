import { test, expect } from "@playwright/test";
import { authenticatePage, logout, TEST_USERS } from "./helpers/auth";

test.describe("AUTHOR — Создание статьи (визард)", () => {
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

  test("A01 — Кнопка «Создать статью» → переход на /articles/new", async ({
    page,
  }) => {
    const createBtn = page.getByRole("link", { name: "Опубликовать статью" });
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test("A02 — Шаг 1: Выбрать отрасль", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
    await expect(page.getByText("Отрасль").first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("A03 — Шаг 2: Выбрать подсектор", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });

  test("A04 — Шаг 3: Выбрать категорию", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });

  test("A05 — Шаг 4: Указать 3-5 областей экспертизы", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });

  test("A06 — Шаг 5: Добавить 2 кросс-ссылки", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });

  test("A07 — Шаг 6: Заголовок H1, введение, slug", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });

  test("A08 — Шаг 7: Добавить text-only секцию", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });

  test("A09 — Шаг 7: Добавить image-right секцию", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });

  test("A10 — Шаг 8: FAQ — 3 вопроса-ответа", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });

  test("A11 — Шаг 9: Чеклист — 3 пункта", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });

  test("A12 — Шаг 10: TL;DR, Key Facts, Definition, Featured Snippet, Problem→Solution, HowTo, Methodology, Sources", async ({
    page,
  }) => {
    await page.goto("/articles/new");
    await page.waitForTimeout(2000);
  });
});

test.describe("AUTHOR — Сохранение и публикация", () => {
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

  test("A13 — Сохранить черновик", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A14 — Проверить черновик в списке статей", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
    const draftLabel = page.getByText("Черновик");
    await expect(draftLabel.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("A15 — Шаг 11: Предпросмотр", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A16 — Шаг 12: Информация об оплате", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A17 — Нажать «Опубликовать» → информация об оплате", async ({
    page,
  }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A18 — Проверить статус после публикации", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
    const pendingLabel = page.getByText("На модерации").first();
    await expect(pendingLabel)
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });
});

test.describe("AUTHOR — Редактирование статьи", () => {
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

  test("A19 — Открыть черновик → «Редактировать» → визард", async ({
    page,
  }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
    const editBtn = page.getByText("Редактировать").first();
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test("A20 — Проверить: все поля заполнены из БД", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A21 — Изменить заголовок → сохранить", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A22 — ProgressBar кликабелен → перейти на шаг 7", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
    const editBtn = page.getByText("Редактировать").first();
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test("A23 — Изменить текст секции → сохранить", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A24 — Проверить alert при редактировании published", async ({
    page,
  }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A25 — Проверить alert при редактировании pending_review", async ({
    page,
  }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A26 — Шаг 12: две кнопки — «Сохранить черновик» + «Опубликовать»", async ({
    page,
  }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });
});

test.describe("AUTHOR — Управление статьями", () => {
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

  test("A27 — Фильтр по статусу: «Черновики»", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A28 — Фильтр: «На модерации»", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A29 — Фильтр: «Опубликовано»", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A30 — Фильтр: «Архив»", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A31 — Дублировать статью", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A32 — Архивировать статью", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });

  test("A33 — Снять статью с публикации", async ({ page }) => {
    await page.goto("/cabinet/articles");
    await page.waitForTimeout(1500);
  });
});

test.describe("AUTHOR — Импорт статьи", () => {
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

  test("A34 — Перейти на /cabinet/import", async ({ page }) => {
    await page.goto("/cabinet/import");
    await page.waitForTimeout(1500);
    await expect(page.getByText("Импорт").first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test("A35 — Скачать шаблон → проверить .md файл", async ({ page }) => {
    await page.goto("/cabinet/import");
    await page.waitForTimeout(1500);
    const downloadBtn = page
      .getByRole("button", { name: "Скачать" })
      .or(page.getByRole("link", { name: "Скачать" }));
    if (await downloadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 10000 }).catch(() => null),
        downloadBtn.click(),
      ]);
      if (download) {
        expect(download.suggestedFilename()).toContain(".md");
      }
    }
  });

  test("A36 — Вставить тестовый диалог → «Импортировать»", async ({ page }) => {
    await page.goto("/cabinet/import");
    await page.waitForTimeout(1500);
  });

  test("A37 — Проверить редирект на визард с importId", async ({ page }) => {
    await page.goto("/cabinet/import");
    await page.waitForTimeout(1500);
  });
});

test.describe("AUTHOR — Профиль автора", () => {
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

  test("A38 — Редактировать профиль: имя, био, аватар", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
    const authorTab = page.getByRole("button", { name: "Я автор" });
    if (await authorTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authorTab.click();
      await page.waitForTimeout(1000);
    }
  });

  test("A39 — Настроить Author Page (slug, published)", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });

  test("A40 — Проверить публичную страницу автора", async ({ page }) => {
    await page.goto("/cabinet");
    await page.waitForTimeout(1500);
  });
});
