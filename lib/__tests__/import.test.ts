import { describe, it, expect } from "vitest";
import { parseIterationMarkdown, buildArticleData } from "../import-parser";
import { iterationSchemas, importArticleSchema } from "../import-validation";
import { TEMPLATE_ITERATIONS } from "../import-template";

describe("parseIterationMarkdown", () => {
  it("should parse iteration 1 (title and introduction)", () => {
    const md = `## Итерация 1: Заголовок и введение

### title
Тестовый заголовок статьи

### introduction
Введение длиной более сорока слов чтобы пройти валидацию схемы заголовка и введения

### slug
test-slug`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[0].outputFields,
      TEMPLATE_ITERATIONS[0].optionalFields
    );

    expect(result.ok).toBe(true);
    expect(result.data?.title).toBe("Тестовый заголовок статьи");
    expect(result.data?.slug).toBe("test-slug");
  });

  it("should validate iteration 1 schema", () => {
    const data = {
      title: "Заголовок из десяти символов",
      introduction:
        "Введение которое точно длиннее сорока слов чтобы пройти валидацию схемы",
      slug: "test",
    };

    const result = iterationSchemas[1].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject short title in iteration 1", () => {
    const data = {
      title: "Корот",
      introduction:
        "Введение которое точно длиннее сорока слов чтобы пройти валидацию схемы",
      slug: "test",
    };

    const result = iterationSchemas[1].safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject empty slug as valid (optional)", () => {
    const data = {
      title: "Заголовок из десяти символов",
      introduction:
        "Введение которое точно длиннее сорока слов чтобы пройти валидацию схемы",
      slug: "",
    };

    const result = iterationSchemas[1].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject invalid slug characters", () => {
    const data = {
      title: "Заголовок из десяти символов",
      introduction:
        "Введение которое точно длиннее сорока слов чтобы пройти валидацию схемы",
      slug: "русский-слаг",
    };

    const result = iterationSchemas[1].safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should return error for missing required fields", () => {
    const md = `## Итерация 1: Заголовок и введение

### title
Тестовый заголовок`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[0].outputFields,
      TEMPLATE_ITERATIONS[0].optionalFields
    );

    expect(result.ok).toBe(false);
    expect(result.missingFields).toContain("introduction");
    expect(result.missingFields).toContain("slug");
  });

  it("should handle code-fenced markdown", () => {
    const md = `\`\`\`markdown
## Итерация 1: Заголовок и введение

### title
Заголовок
### introduction
Введение которое точно длиннее сорока слов чтобы пройти валидацию
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

  it("should strip text before ## Итерация marker", () => {
    const md = `Вот что я сделал:
## Итерация 1: Заголовок и введение

### title
Заголовок
### introduction
Введение которое точно длиннее сорока слов чтобы пройти валидацию
### slug
test`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[0].outputFields,
      TEMPLATE_ITERATIONS[0].optionalFields
    );

    expect(result.ok).toBe(true);
    expect(result.data?.title).toBe("Заголовок");
  });

  it("should validate section iteration 2 schema", () => {
    const data = {
      sectionTitle: "Тестовый заголовок секции",
      sectionDesign: "image-right",
      imageUrl: "https://pixinlink.ru/800x400/test",
      sectionText: "A".repeat(15000),
    };

    const result = iterationSchemas[2].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should require min sectionText for content iterations", () => {
    const data = {
      sectionTitle: "Короткая секция",
      sectionDesign: "image-right",
      imageUrl: "https://pixinlink.ru/800x400/test",
      sectionText: "Too short",
    };

    const result = iterationSchemas[2].safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should parse and validate iteration 8 (GEO blocks)", () => {
    const md = `## Итерация 8: GEO-блоки

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
Краткое содержание статьи длиной более двадцати

### keyFacts
Факт 1
Факт 2
Факт 3

### definition
Определение темы длиной более двадцати символов в одном предложении

### featuredSnippetQuestion
Вопрос для сниппета

### featuredSnippetAnswer
Развёрнутый ответ для featured snippet

### problemSolutionProblem
Проблема описана здесь длиной более двадцати

### problemSolutionSolution
Решение описано здесь длиной более двадцати символов

### problemSolutionResult
Результат описан здесь длиной более двадцати символов

### howTo
Шаг 1 — Название
Описание шага
---
Шаг 2 — Название
Описание шага

### methodology
Методология исследования статьи подготовлена на основе

### sources
Источник 1 — https://example.com/1
Источник 2 — https://example.com/2`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[7].outputFields,
      TEMPLATE_ITERATIONS[7].optionalFields
    );

    expect(result.ok).toBe(true);
    expect(result.data?.tldr).toBe(
      "Краткое содержание статьи длиной более двадцати"
    );
    expect(result.data?.faq).toContain("Вопрос 1");

    const zodResult = iterationSchemas[8].safeParse(result.data);
    expect(zodResult.success).toBe(true);
  });

  it("should validate table iteration (5) with sectionTable", () => {
    const data = {
      sectionTitle: "Сравнительная таблица",
      sectionDesign: "table",
      sectionText: "A".repeat(600),
      sectionTable: "| A | B |\n|---|---|\n| 1 | 2 |",
    };

    const result = iterationSchemas[5].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject table iteration without sectionTable", () => {
    const data = {
      sectionTitle: "Сравнительная таблица",
      sectionDesign: "table",
      sectionText: "A".repeat(600),
    };

    const result = iterationSchemas[5].safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("buildArticleData", () => {
  it("should assemble full article from all 8 iterations", () => {
    const iterations = new Map<number, Record<string, string>>();

    iterations.set(1, {
      title: "Тестовая статья",
      introduction:
        "Тестовое введение на сорок слов минимум для проверки парсинга",
      slug: "testovaya-statya",
    });
    iterations.set(2, {
      sectionTitle: "Секция 1",
      sectionDesign: "image-right",
      imageUrl: "https://pixinlink.ru/800x400/test",
      sectionText: "A".repeat(5000),
    });
    iterations.set(3, {
      sectionTitle: "Секция 2",
      sectionDesign: "text-only",
      sectionText: "B".repeat(5000),
    });
    iterations.set(4, {
      sectionTitle: "Секция 3",
      sectionDesign: "image-left",
      imageUrl: "https://pixinlink.ru/800x400/test",
      sectionText: "C".repeat(5000),
    });
    iterations.set(5, {
      sectionTitle: "Таблица",
      sectionDesign: "table",
      sectionText: "A".repeat(600),
      sectionTable: "| A | B |\n|---|---|\n| 1 | 2 |",
    });
    iterations.set(6, {
      sectionTitle: "Инструменты",
      sectionDesign: "image-right",
      imageUrl: "https://pixinlink.ru/800x400/tools",
      sectionText: "D".repeat(5000),
    });
    iterations.set(7, {
      sectionTitle: "Выводы",
      sectionDesign: "text-only",
      sectionText: "E".repeat(5000),
    });
    iterations.set(8, {
      faq: "Вопрос\nОтвет",
      todo: "Пункт 1\nПункт 2",
      tldr: "Краткое содержание статьи длиной более двадцати",
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
    expect(articleData.slug).toBe("testovaya-statya");

    // pre-filled metadata defaults
    expect(articleData.industryId).toBe("none");
    expect(articleData.industryName).toBe("Без отрасли");
    expect(articleData.categoryId).toBe("none");
    expect(articleData.categoryName).toBe("Без категории");
    expect(articleData.expertiseAreas).toEqual([
      "Общая экспертиза",
      "Бизнес-консалтинг",
      "Стратегическое планирование",
    ]);
    expect(articleData.crossLinks).toEqual([]);

    expect(articleData.faq.length).toBe(1);
    expect(articleData.faq[0].question).toBe("Вопрос");
    expect(articleData.todo.length).toBe(2);
    expect(articleData.keyFacts.length).toBe(3);
    expect(articleData.howTo.length).toBe(2);
    expect(articleData.sources.length).toBe(1);
    expect(articleData.content.length).toBeGreaterThan(100);

    const schemaResult = importArticleSchema.safeParse(articleData);
    expect(schemaResult.success).toBe(true);
  });

  it("should handle empty iterations gracefully", () => {
    const iterations = new Map<number, Record<string, string>>();

    const articleData = buildArticleData(iterations);

    expect(articleData.title).toBe("");
    expect(articleData.industryId).toBe("none");
    expect(articleData.faq).toEqual([]);
    expect(articleData.todo).toEqual([]);
  });
});
