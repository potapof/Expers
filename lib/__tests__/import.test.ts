import { describe, it, expect } from "vitest";
import {
  parseIterationMarkdown,
  parseAllIterations,
  buildArticleData,
} from "../import-parser";
import { iterationSchemas, importArticleSchema } from "../import-validation";
import { TEMPLATE_ITERATIONS } from "../import-template";

describe("parseIterationMarkdown", () => {
  it("should parse iteration 1 (title and introduction)", () => {
    const md = `## Итерация 1: Заголовок и введение

### title
Тестовый заголовок статьи

### introduction
Введение длиной более ста символов чтобы пройти валидацию схемы заголовка и введения с запасом

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
        "Введение которое точно длиннее ста символов чтобы пройти валидацию схемы заголовка и введения с запасом",
      slug: "test",
    };

    const result = iterationSchemas[1].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject short introduction", () => {
    const data = {
      title: "Заголовок из десяти символов",
      introduction: "Коротко",
      slug: "test",
    };

    const result = iterationSchemas[1].safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should handle code-fenced markdown", () => {
    const md = `\`\`\`markdown
## Итерация 1: Заголовок и введение

### title
Заголовок
### introduction
Введение которое точно длиннее ста символов чтобы пройти валидацию схемы заголовка и введения с запасом
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

  it("should validate content iteration schema (2) with sectionCount", () => {
    const data = { sectionCount: "5" };
    const result = iterationSchemas[2].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject empty sectionCount", () => {
    const data = { sectionCount: "" };
    const result = iterationSchemas[2].safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should parse and validate iteration 8 (FAQ + Todo)", () => {
    const md = `## Итерация 8: FAQ и Чеклист

### faq
Вопрос 1
Ответ 1
---
Вопрос 2
Ответ 2

### todo
Пункт 1
Пункт 2`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[7].outputFields,
      TEMPLATE_ITERATIONS[7].optionalFields
    );

    expect(result.ok).toBe(true);
    expect(result.data?.faq).toContain("Вопрос 1");
    expect(result.data?.todo).toContain("Пункт 1");

    const zodResult = iterationSchemas[8].safeParse(result.data);
    expect(zodResult.success).toBe(true);
  });

  it("should parse and validate iteration 9 (TL;DR, Key Facts, Definition, Featured Snippet)", () => {
    const md = `## Итерация 9: Сниппеты и ключевые факты

### tldr
Краткое содержание статьи в двух-трёх предложениях

### keyFacts
Факт 1
Факт 2

### definition
Определение темы в одном абзаце

### featuredSnippetQuestion
Вопрос для сниппета

### featuredSnippetAnswer
Развёрнутый ответ для featured snippet`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[8].outputFields,
      TEMPLATE_ITERATIONS[8].optionalFields
    );

    expect(result.ok).toBe(true);
    expect(result.data?.tldr).toBe(
      "Краткое содержание статьи в двух-трёх предложениях"
    );

    const zodResult = iterationSchemas[9].safeParse(result.data);
    expect(zodResult.success).toBe(true);
  });

  it("should parse and validate iteration 10 (Problem→Solution→Result + HowTo)", () => {
    const md = `## Итерация 10: Проблема-решение и HowTo

### problemSolutionProblem
Проблема пользователя описана здесь

### problemSolutionSolution
Решение проблемы описано здесь

### problemSolutionResult
Результат после решения описан здесь

### howTo
Шаг 1 — Название
Описание
---
Шаг 2 — Название
Описание`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[9].outputFields,
      TEMPLATE_ITERATIONS[9].optionalFields
    );

    expect(result.ok).toBe(true);

    const zodResult = iterationSchemas[10].safeParse(result.data);
    expect(zodResult.success).toBe(true);
  });

  it("should parse and validate iteration 11 (Methodology + Sources)", () => {
    const md = `## Итерация 11: Методология, источники и самопроверка

### methodology
Методология исследования в одном абзаце

### sources
Источник 1 — https://example.com/1
Источник 2 — https://example.com/2`;

    const result = parseIterationMarkdown(
      md,
      TEMPLATE_ITERATIONS[10].outputFields,
      TEMPLATE_ITERATIONS[10].optionalFields
    );

    expect(result.ok).toBe(true);

    const zodResult = iterationSchemas[11].safeParse(result.data);
    expect(zodResult.success).toBe(true);
  });
});

describe("parseAllIterations", () => {
  it("should parse full chat with multi-section iterations", () => {
    const chat = `## Итерация 1: Заголовок

### title
Тестовый заголовок
### introduction
Введение которое точно длиннее ста символов чтобы пройти валидацию схемы заголовка и введения с запасом
### slug
test-slug

## Итерация 2: Погружение

### sectionCount
3

### section1Заголовок
Hero
### section1Дизайн
image-only
### section1Картинка
https://pixinlink.ru/1200x600/test
### section1Текст
Подпись

### section2Заголовок
Текст 1
### section2Дизайн
text-only
### section2Текст
${"A".repeat(2500)}

### section3Заголовок
Текст 2
### section3Дизайн
image-right
### section3Картинка
https://pixinlink.ru/800x400/test
### section3Текст
${"B".repeat(1500)}

## Итерация 8: FAQ

### faq
Вопрос\\nОтвет
### todo
Пункт 1\\nПункт 2

## Итерация 9: Сниппеты

### tldr
Краткое содержание статьи длиной более двадцати
### keyFacts
Факт 1\\nФакт 2
### definition
Определение длиной более двадцати символов
### featuredSnippetQuestion
Вопрос
### featuredSnippetAnswer
Развёрнутый ответ для сниппета

## Итерация 10: Решения

### problemSolutionProblem
Проблема длиной более двадцати символов
### problemSolutionSolution
Решение длиной более двадцати символов
### problemSolutionResult
Результат длиной более двадцати символов
### howTo
Шаг 1\\nОписание

## Итерация 11: Методология

### methodology
Методология длиной более двадцати
### sources
Источник — https://example.com`;

    const result = parseAllIterations(chat);
    expect(result.size).toBe(6);
    expect(result.get(1)?.["title"]).toBe("Тестовый заголовок");
    expect(
      result.get(2)?.["sectioncount"] || result.get(2)?.["sectionCount"]
    ).toBe("3");
  });

  it("should return empty map for no iterations", () => {
    const result = parseAllIterations("Просто текст без маркеров");
    expect(result.size).toBe(0);
  });
});

describe("buildArticleData", () => {
  it("should assemble article from multi-section iterations", () => {
    const iterations = new Map<number, Record<string, string>>();

    iterations.set(1, {
      title: "Тестовая статья",
      introduction:
        "Введение которое точно длиннее ста символов чтобы пройти валидацию схемы заголовка и введения с запасом",
      slug: "testovaya-statya",
    });
    iterations.set(2, {
      sectionCount: "3",
      section1Заголовок: "Hero",
      section1Дизайн: "image-only",
      section1Картинка: "https://pixinlink.ru/1200x600/test",
      section1Текст: "Подпись",
      section2Заголовок: "Текст",
      section2Дизайн: "text-only",
      section2Текст: "A".repeat(2500),
      section3Заголовок: "С картинкой",
      section3Дизайн: "image-right",
      section3Картинка: "https://pixinlink.ru/800x400/test",
      section3Текст: "B".repeat(1500),
    });
    iterations.set(3, {
      sectionCount: "1",
      section1Заголовок: "Анализ",
      section1Дизайн: "text-only",
      section1Текст: "C".repeat(2500),
    });
    iterations.set(4, {
      sectionCount: "1",
      section1Заголовок: "Кейс",
      section1Дизайн: "text-only",
      section1Текст: "D".repeat(2500),
    });
    iterations.set(5, {
      sectionCount: "1",
      section1Заголовок: "Сравнение",
      section1Дизайн: "text-only",
      section1Текст: "E".repeat(2500),
    });
    iterations.set(6, {
      sectionCount: "1",
      section1Заголовок: "Инфографика",
      section1Дизайн: "image-only",
      section1Картинка: "https://pixinlink.ru/1200x600/plan",
      section1Текст: "Схема",
    });
    iterations.set(7, {
      sectionCount: "1",
      section1Заголовок: "Выводы",
      section1Дизайн: "text-only",
      section1Текст: "F".repeat(2500),
    });
    iterations.set(8, {
      faq: "Вопрос\nОтвет",
      todo: "Пункт 1\nПункт 2",
    });
    iterations.set(9, {
      tldr: "Краткое содержание статьи длиной более двадцати",
      keyFacts: "Факт 1\nФакт 2",
      definition: "Определение длиной более двадцати символов для валидации",
      featuredSnippetQuestion: "Вопрос для featured snippet?",
      featuredSnippetAnswer: "Развёрнутый ответ на featured snippet вопрос",
    });
    iterations.set(10, {
      problemSolutionProblem: "Проблема длиной более двадцати символов",
      problemSolutionSolution: "Решение длиной более двадцати символов здесь",
      problemSolutionResult: "Результат длиной более двадцати символов описан",
      howTo: "Шаг 1\nОписание шага 1\n---\nШаг 2\nОписание шага 2",
    });
    iterations.set(11, {
      methodology: "Методология длиной более двадцати символов для проверки",
      sources: "Источник 1 — https://example.com/1",
    });

    const articleData = buildArticleData(iterations);

    expect(articleData.title).toBe("Тестовая статья");
    expect(articleData.description).toContain(
      "Введение которое точно длиннее ста"
    );
    expect(articleData.slug).toBe("testovaya-statya");

    expect(articleData.industryId).toBe("none");
    expect(articleData.categoryId).toBe("none");

    expect(articleData.faq.length).toBe(1);
    expect(articleData.todo.length).toBe(2);
    expect(articleData.keyFacts.length).toBe(2);
    expect(articleData.howTo.length).toBe(2);
    expect(articleData.sources.length).toBe(1);
    expect(articleData.content.length).toBeGreaterThan(100);

    const schemaResult = importArticleSchema.safeParse(articleData);
    if (!schemaResult.success) {
      console.error(
        "Schema errors:",
        JSON.stringify(schemaResult.error?.issues, null, 2)
      );
    }
    expect(schemaResult.success).toBe(true);
  });

  it("should handle empty iterations gracefully", () => {
    const iterations = new Map<number, Record<string, string>>();
    const articleData = buildArticleData(iterations);
    expect(articleData.industryId).toBe("none");
    expect(articleData.faq).toEqual([]);
  });
});
