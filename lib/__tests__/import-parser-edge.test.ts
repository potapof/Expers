import { describe, it, expect } from "vitest";
import {
  parseIterationMarkdown,
  parseAllIterations,
  buildArticleData,
} from "../import-parser";
import { TEMPLATE_ITERATIONS } from "../import-template";

describe("parseIterationMarkdown — edge cases", () => {
  it("should return error when no iteration marker found", () => {
    const result = parseIterationMarkdown(
      "Просто текст без маркера",
      ["title"],
      []
    );
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Не найден маркер итерации");
  });

  it("should return error when no ### blocks found", () => {
    const result = parseIterationMarkdown(
      "## Итерация 1: Заголовок\n\nПросто текст",
      ["title"],
      []
    );
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Не найдены блоки");
  });

  it("should report missing required fields", () => {
    const result = parseIterationMarkdown(
      "## Итерация 1: Тест\n\n### other\nvalue",
      ["title"],
      []
    );
    expect(result.ok).toBe(false);
    expect(result.missingFields).toContain("title");
  });

  it("should handle optional fields as empty strings when missing", () => {
    const result = parseIterationMarkdown(
      "## Итерация 1: Тест\n\n### title\nЗаголовок",
      ["title"],
      ["description"]
    );
    expect(result.ok).toBe(true);
    expect(result.data?.description).toBe("");
    expect(result.data?.title).toBe("Заголовок");
  });

  it("should handle code fence with only backtick line", () => {
    const intro =
      "Введение которое точно длиннее ста символов чтобы пройти валидацию схемы заголовка и введения с запасом";
    const md = `\`\`\`
## Итерация 1: Тест

### title
Заголовок
### introduction
${intro}
### slug
test
\`\`\``;
    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[0].outputFields,
      TEMPLATE_ITERATIONS[0].optionalFields
    );
    expect(result.ok).toBe(true);
    expect(result.data?.title).toBe("Заголовок");
  });
});

describe("parseAllIterations — edge cases", () => {
  it("should return empty map for no iterations", () => {
    const result = parseAllIterations("Просто текст без маркеров");
    expect(result.size).toBe(0);
  });

  it("should handle multiple iterations", () => {
    const chat = `## Итерация 1: Title
### title
Тест
## Итерация 2: Content
### text
Контент`;
    const result = parseAllIterations(chat);
    expect(result.size).toBe(2);
    expect(result.get(1)?.["title"]).toBe("Тест");
    expect(result.get(2)?.["text"]).toBe("Контент");
  });

  it("should skip sections with no fields", () => {
    const result = parseAllIterations("## Итерация 99: Empty\nПросто текст");
    expect(result.size).toBe(0);
  });
});

describe("buildArticleData — edge cases", () => {
  it("should handle empty iterations map", () => {
    const iterations = new Map<number, Record<string, string>>();
    const result = buildArticleData(iterations);
    expect(result.title).toBe("");
    expect(result.content).toBe("");
    expect(result.faq).toEqual([]);
    expect(result.todo).toEqual([]);
  });

  it("should handle iteration with sectionCount=0", () => {
    const iterations = new Map<number, Record<string, string>>();
    iterations.set(1, {
      title: "Тест",
      introduction:
        "Введение которое точно длиннее ста символов чтобы пройти валидацию схемы заголовка и введения с запасом",
    });
    iterations.set(2, { sectionCount: "0" });
    const result = buildArticleData(iterations);
    expect(result.content).toBe("");
  });

  it("should handle missing optional iterations gracefully", () => {
    const iterations = new Map<number, Record<string, string>>();
    iterations.set(1, {
      title: "Тест",
      introduction:
        "Введение которое точно длиннее ста символов чтобы пройти валидацию схемы заголовка и введения с запасом",
    });
    const result = buildArticleData(iterations);
    expect(result.keyFacts).toEqual([]);
    expect(result.sources).toEqual([]);
    expect(result.howTo).toEqual([]);
  });
});
