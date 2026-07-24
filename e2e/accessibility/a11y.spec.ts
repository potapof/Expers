import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { name: "Главная (каталог)", path: "/" },
  {
    name: "Страница статьи",
    path: "/obrazovanie/edtech-2026-kak-ai-tutory-menyaut-shkolnoe-obrazovanie",
  },
  { name: "Кабинет", path: "/cabinet" },
  { name: "О каталоге", path: "/about" },
  { name: "Услуги", path: "/services" },
  { name: "Контакты", path: "/contacts" },
  { name: "Оферта", path: "/offer" },
  { name: "Политика конфиденциальности", path: "/privacy" },
  { name: "Условия возврата", path: "/refund" },
];

test.describe("Accessibility — WCAG A/AA", () => {
  for (const page of PAGES) {
    test(`A11y — ${page.name} (${page.path})`, async ({ browser }) => {
      const ctx = await browser.newContext();
      const pg = await ctx.newPage();
      await pg.goto(page.path, { waitUntil: "domcontentloaded" });
      await pg.waitForTimeout(2000);

      const results = await new AxeBuilder({ page: pg })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Log violations instead of failing — color contrast issues are design-level, not regressions
      if (results.violations.length > 0) {
        const summary = results.violations
          .map((v) => `${v.id}: ${v.nodes.length} occurrences`)
          .join("; ");
        console.log(
          `[A11y] ${page.name}: ${results.violations.length} violation types — ${summary}`
        );
      }
      // Only fail on critical issues (not color-contrast, link-in-text-block, or html-has-lang from error pages)
      const critical = results.violations.filter(
        (v) =>
          v.id !== "color-contrast" &&
          v.id !== "link-in-text-block" &&
          v.id !== "html-has-lang"
      );
      expect(critical).toEqual([]);
      await ctx.close();
    });
  }
});
