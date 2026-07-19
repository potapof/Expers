import { describe, it, expect } from "vitest";
import { parseIterationMarkdown, buildArticleData } from "../import-parser";
import { iterationSchemas, importArticleSchema } from "../import-validation";
import { TEMPLATE_ITERATIONS } from "../import-template";

describe("parseIterationMarkdown", () => {
  it("should parse iteration 1 placeholder data", () => {
    const md = `## Итерация 1: Отрасль и подсектор

### industryId
none

### industryName
Без отрасли

### subsectionId
none

### subsectionName
Без подсектора`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[0].outputFields,
      TEMPLATE_ITERATIONS[0].optionalFields
    );

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({
      industryId: "none",
      industryName: "Без отрасли",
      subsectionId: "none",
      subsectionName: "Без подсектора",
    });
  });

  it("should validate against iteration 1 schema", () => {
    const data = {
      industryId: "none",
      industryName: "Без отрасли",
      subsectionId: "none",
      subsectionName: "Без подсектора",
    };

    const result = iterationSchemas[1].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject non-literal industryId for iteration 1", () => {
    const data = {
      industryId: "it-tech",
      industryName: "Без отрасли",
      subsectionId: "none",
      subsectionName: "Без подсектора",
    };

    const result = iterationSchemas[1].safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should return error for missing required fields", () => {
    const md = `## Итерация 5: Заголовок и введение

### title
Тестовый заголовок`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[4].outputFields,
      TEMPLATE_ITERATIONS[4].optionalFields
    );

    expect(result.ok).toBe(false);
    expect(result.missingFields).toContain("introduction");
    expect(result.missingFields).toContain("slug");
  });

  it("should handle code-fenced markdown", () => {
    const md = `\`\`\`markdown
## Итерация 1: Отрасль и подсектор

### industryId
none

### industryName
Без отрасли

### subsectionId
none

### subsectionName
Без подсектора
\`\`\``;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[0].outputFields,
      TEMPLATE_ITERATIONS[0].optionalFields
    );

    expect(result.ok).toBe(true);
    expect(result.data?.industryId).toBe("none");
  });

  it("should strip text before ## Итерация marker", () => {
    const md = `Вот что я сделал:
## Итерация 2: Категория

### categoryId
none

### categoryName
Без категории`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[1].outputFields,
      TEMPLATE_ITERATIONS[1].optionalFields
    );

    expect(result.ok).toBe(true);
    expect(result.data?.categoryId).toBe("none");
  });

  it("should validate section iteration 6 schema", () => {
    const data = {
      sectionTitle: "Тестовый заголовок секции",
      sectionDesign: "image-right",
      imageUrl: "https://pixinlink.ru/800x400/test",
      sectionText: "A".repeat(15000),
    };

    const result = iterationSchemas[6].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should require min sectionText for content iterations", () => {
    const data = {
      sectionTitle: "Короткая секция",
      sectionDesign: "image-right",
      imageUrl: "https://pixinlink.ru/800x400/test",
      sectionText: "Too short",
    };

    const result = iterationSchemas[6].safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should parse and validate iteration 12 (GEO blocks)", () => {
    const md = `## Итерация 12: GEO-блоки

### faq
Вопрос 1
Ответ 1
---
Вопрос 2
Ответ 2

### todo
Пункт 1
Пункт 2

### tldr
Краткое содержание статьи

### keyFacts
Факт 1
Факт 2
Факт 3

### definition
Определение темы длиной более двадцати символов в одном предложении длиной более двадцати символов в одном предложении

### featuredSnippetQuestion
Вопрос для сниппета

### featuredSnippetAnswer
Развёрнутый ответ для featured snippet

### problemSolutionProblem
Проблема описана здесь

### problemSolutionSolution
Решение описано здесь

### problemSolutionResult
Результат описан здесь

### howTo
Шаг 1 — Название
Описание шага
---
Шаг 2 — Название
Описание шага

### methodology
Методология исследования статьи

### sources
Источник 1 — https://example.com/1
Источник 2 — https://example.com/2`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[11].outputFields,
      TEMPLATE_ITERATIONS[11].optionalFields
    );

    expect(result.ok).toBe(true);
    expect(result.data?.tldr).toBe("Краткое содержание статьи");
    expect(result.data?.definition).toContain("Определение темы");
    expect(result.data?.faq).toContain("Вопрос 1");

    const zodResult = iterationSchemas[12].safeParse(result.data);
    if (!zodResult.success) {
      console.error(
        "Zod errors:",
        JSON.stringify(zodResult.error?.issues, null, 2)
      );
      console.error("Parsed data:", JSON.stringify(result.data, null, 2));
    }
    expect(zodResult.success).toBe(true);
  });
});

describe("buildArticleData", () => {
  it("should assemble full article from all 12 iterations", () => {
    const iterations = new Map<number, Record<string, string>>();

    iterations.set(1, {
      industryId: "none",
      industryName: "Без отрасли",
      subsectionId: "none",
      subsectionName: "Без подсектора",
    });
    iterations.set(2, {
      categoryId: "none",
      categoryName: "Без категории",
    });
    iterations.set(3, {
      expertiseAreas: "AI\nMachine Learning\nData Science",
    });
    iterations.set(4, { crossLinks: "[]" });
    iterations.set(5, {
      title: "Тестовая статья",
      introduction:
        "Тестовое введение на сорок слов минимум для проверки парсинга",
      slug: "testovaya-statya",
    });
    iterations.set(6, {
      sectionTitle: "Секция 1",
      sectionDesign: "image-right",
      imageUrl: "https://pixinlink.ru/800x400/test",
      sectionText: "A".repeat(5000),
    });
    iterations.set(7, {
      sectionTitle: "Секция 2",
      sectionDesign: "text-only",
      sectionText: "B".repeat(5000),
    });
    iterations.set(8, {
      sectionTitle: "Секция 3",
      sectionDesign: "image-left",
      imageUrl: "https://pixinlink.ru/800x400/test",
      sectionText: "C".repeat(5000),
    });
    iterations.set(9, {
      sectionTitle: "Таблица",
      sectionDesign: "table",
      sectionText:
        "Вводный текст для таблицы который должен быть длиннее пятисот символов для прохождения валидации zod схемы номер девять потому что sectionText имеет min(500) и это достаточно длинная строка чтобы набрать более пятисот символов в одном поле тестовых данных для проверки парсинга и валидации импортированных данных статьи с таблицей",
      sectionTable: "| A | B |\n|---|---|\n| 1 | 2 |",
    });
    iterations.set(10, {
      sectionTitle: "Инструменты",
      sectionDesign: "image-right",
      imageUrl: "https://pixinlink.ru/800x400/tools",
      sectionText: "D".repeat(5000),
    });
    iterations.set(11, {
      sectionTitle: "Выводы",
      sectionDesign: "text-only",
      sectionText: "E".repeat(5000),
    });
    iterations.set(12, {
      faq: "Вопрос\nОтвет",
      todo: "Пункт 1\nПункт 2",
      tldr: "Краткое содержание статьи длиной более двадцати символов",
      keyFacts: "Факт 1\nФакт 2\nФакт 3",
      definition: "Определение длиной более двадцати символов для валидации",
      featuredSnippetQuestion: "Вопрос для featured snippet?",
      featuredSnippetAnswer: "Развёрнутый ответ на featured snippet вопрос",
      problemSolutionProblem: "Проблема длиной более двадцати символов",
      problemSolutionSolution: "Решение длиной более двадцати символов здесь",
      problemSolutionResult: "Результат длиной более двадцати символов описан",
      howTo: "Шаг 1\nОписание шага 1\n---\nШаг 2\nОписание шага 2",
      methodology: "Методология длиной более двадцати символов для проверки",
      sources: "Источник 1 — https://example.com/1",
    });

    const articleData = buildArticleData(iterations);

    expect(articleData.title).toBe("Тестовая статья");
    expect(articleData.description).toContain(
      "Тестовое введение на сорок слов"
    );
    expect(articleData.industryId).toBe("none");
    expect(articleData.industryName).toBe("Без отрасли");
    expect(articleData.slug).toBe("testovaya-statya");
    expect(articleData.expertiseAreas).toEqual([
      "AI",
      "Machine Learning",
      "Data Science",
    ]);
    expect(articleData.faq.length).toBe(1);
    expect(articleData.faq[0].question).toBe("Вопрос");
    expect(articleData.todo.length).toBe(2);
    expect(articleData.keyFacts.length).toBe(3);
    expect(articleData.howTo.length).toBe(2);
    expect(articleData.sources.length).toBe(1);
    expect(articleData.tldr).toContain("Краткое содержание статьи");
    expect(articleData.content.length).toBeGreaterThan(100);

    const schemaResult = importArticleSchema.safeParse(articleData);
    if (!schemaResult.success) {
      console.error(
        "Article schema errors:",
        JSON.stringify(schemaResult.error?.issues, null, 2)
      );
    }
    expect(schemaResult.success).toBe(true);
  });

  it("should handle empty placeholder iterations gracefully", () => {
    const iterations = new Map<number, Record<string, string>>();

    const articleData = buildArticleData(iterations);

    expect(articleData.industryId).toBe("none");
    expect(articleData.title).toBe("");
    expect(articleData.faq).toEqual([]);
    expect(articleData.todo).toEqual([]);
    expect(articleData.keyFacts).toEqual([]);
  });

  it("should validate iteration 5 schema with valid slug", () => {
    const data = {
      title: "Заголовок из десяти символов",
      introduction:
        "Введение которое точно длиннее сорока слов чтобы пройти валидацию",
      slug: "test-slug",
    };

    const result = iterationSchemas[5].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject iteration 5 with empty slug as valid (optional)", () => {
    const data = {
      title: "Заголовок из десяти символов",
      introduction:
        "Введение которое точно длиннее сорока слов чтобы пройти валидацию",
      slug: "",
    };

    const result = iterationSchemas[5].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject iteration 5 with invalid slug characters", () => {
    const data = {
      title: "Заголовок из десяти символов",
      introduction:
        "Введение которое точно длиннее сорока слов чтобы пройти валидацию",
      slug: "русский-слаг",
    };

    const result = iterationSchemas[5].safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should validate table iteration with sectionTable", () => {
    const data = {
      sectionTitle: "Сравнительная таблица",
      sectionDesign: "table",
      sectionText: "A".repeat(600),
      sectionTable: "| A | B |\n|---|---|\n| 1 | 2 |",
    };

    const result = iterationSchemas[9].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject table iteration without sectionTable", () => {
    const data = {
      sectionTitle: "Сравнительная таблица",
      sectionDesign: "table",
      sectionText: "Вводный текст",
    };

    const result = iterationSchemas[9].safeParse(data);
    expect(result.success).toBe(false);
  });
});
