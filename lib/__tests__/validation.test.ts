import { describe, it, expect } from "vitest";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
  step9Schema,
  step10Schema,
} from "../validation";

describe("step1Schema", () => {
  it("should accept valid industry data", () => {
    const result = step1Schema.safeParse({
      industryId: "it-tech",
      industryName: "IT & Технологии",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty industryId", () => {
    const result = step1Schema.safeParse({
      industryId: "",
      industryName: "IT & Технологии",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing fields", () => {
    const result = step1Schema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("step2Schema", () => {
  it("should accept valid subsection data", () => {
    const result = step2Schema.safeParse({
      subsectionId: "software",
      subsectionName: "Программное обеспечение",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty subsectionId", () => {
    const result = step2Schema.safeParse({
      subsectionId: "",
      subsectionName: "Software",
    });
    expect(result.success).toBe(false);
  });
});

describe("step3Schema", () => {
  it("should accept valid category data", () => {
    const result = step3Schema.safeParse({
      categoryId: "ai-ml",
      categoryName: "ИИ и машинное обучение",
    });
    expect(result.success).toBe(true);
  });

  it("should accept custom category", () => {
    const result = step3Schema.safeParse({
      categoryId: "custom",
      categoryName: "custom",
      customCategory: "Моя категория",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customCategory).toBe("Моя категория");
    }
  });

  it("should default customCategory to empty string", () => {
    const result = step3Schema.safeParse({
      categoryId: "ai-ml",
      categoryName: "ИИ и ML",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customCategory).toBe("");
    }
  });

  it("should reject empty categoryId", () => {
    const result = step3Schema.safeParse({
      categoryId: "",
      categoryName: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("step4Schema", () => {
  it("should accept 3-5 expertise areas", () => {
    const result = step4Schema.safeParse({
      expertiseAreas: ["AI", "ML", "Data Science"],
    });
    expect(result.success).toBe(true);
  });

  it("should accept 5 expertise areas", () => {
    const result = step4Schema.safeParse({
      expertiseAreas: ["A", "B", "C", "D", "E"],
    });
    expect(result.success).toBe(true);
  });

  it("should reject fewer than 3 areas", () => {
    const result = step4Schema.safeParse({
      expertiseAreas: ["AI"],
    });
    expect(result.success).toBe(false);
  });

  it("should reject more than 5 areas", () => {
    const result = step4Schema.safeParse({
      expertiseAreas: ["A", "B", "C", "D", "E", "F"],
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty array", () => {
    const result = step4Schema.safeParse({
      expertiseAreas: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("step5Schema", () => {
  const validLink = {
    articleId: "article-1",
    title: "Test Article",
    industryId: "it-tech",
  };

  it("should accept 5-8 cross-links", () => {
    const result = step5Schema.safeParse({
      crossLinks: Array(5).fill(validLink),
    });
    expect(result.success).toBe(true);
  });

  it("should accept 8 cross-links", () => {
    const result = step5Schema.safeParse({
      crossLinks: Array(8).fill(validLink),
    });
    expect(result.success).toBe(true);
  });

  it("should reject fewer than 2 cross-links", () => {
    const result = step5Schema.safeParse({
      crossLinks: [validLink],
    });
    expect(result.success).toBe(false);
  });

  it("should reject more than 8 cross-links", () => {
    const result = step5Schema.safeParse({
      crossLinks: Array(9).fill(validLink),
    });
    expect(result.success).toBe(false);
  });
});

describe("step6Schema", () => {
  it("should accept valid title and introduction", () => {
    const result = step6Schema.safeParse({
      title: "Заголовок статьи длиной более 10 символов",
      introduction:
        "Это введение длиной более сорока символов точно. " +
        "Ещё немного текста для введения, чтобы точно хватило символов. ",
    });
    expect(result.success).toBe(true);
  });

  it("should reject short title", () => {
    const result = step6Schema.safeParse({
      title: "Коротко",
      introduction:
        "Достаточно длинное введение для проверки минимальной длины текста сорок символов это точно.",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short introduction", () => {
    const result = step6Schema.safeParse({
      title: "Заголовок статьи длиной более 10 символов",
      introduction: "Коротко",
    });
    expect(result.success).toBe(false);
  });

  it("should reject title over 200 characters", () => {
    const result = step6Schema.safeParse({
      title: "X".repeat(201),
      introduction:
        "Достаточно длинное введение для проверки минимальной длины текста сорок символов это точно, да ещё и больше.",
    });
    expect(result.success).toBe(false);
  });
});

describe("step7Schema", () => {
  it("should accept content within limits", () => {
    const result = step7Schema.safeParse({
      content: "X".repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it("should accept content up to 10000 chars", () => {
    const result = step7Schema.safeParse({
      content: "X".repeat(10000),
    });
    expect(result.success).toBe(true);
  });

  it("should reject content under 100 chars", () => {
    const result = step7Schema.safeParse({
      content: "X".repeat(50),
    });
    expect(result.success).toBe(false);
  });

  it("should reject content over 150000 chars", () => {
    const result = step7Schema.safeParse({
      content: "X".repeat(150001),
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty content", () => {
    const result = step7Schema.safeParse({
      content: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("step8Schema", () => {
  const validFaq = {
    question: "Достаточно длинный вопрос?",
    answer: "Достаточно длинный ответ на этот вопрос.",
  };

  it("should accept 3-5 FAQ items", () => {
    const result = step8Schema.safeParse({
      faq: Array(3).fill(validFaq),
    });
    expect(result.success).toBe(true);
  });

  it("should accept 5 FAQ items", () => {
    const result = step8Schema.safeParse({
      faq: Array(5).fill(validFaq),
    });
    expect(result.success).toBe(true);
  });

  it("should reject fewer than 3 items", () => {
    const result = step8Schema.safeParse({
      faq: Array(1).fill(validFaq),
    });
    expect(result.success).toBe(false);
  });

  it("should reject more than 5 items", () => {
    const result = step8Schema.safeParse({
      faq: Array(6).fill(validFaq),
    });
    expect(result.success).toBe(false);
  });

  it("should reject short question", () => {
    const result = step8Schema.safeParse({
      faq: [{ question: "Корот?", answer: "Достаточно длинный ответ." }],
    });
    expect(result.success).toBe(false);
  });
});

describe("step9Schema", () => {
  it("should accept at least 1 todo item", () => {
    const result = step9Schema.safeParse({
      todo: [{ text: "Написать статью", done: false }],
    });
    expect(result.success).toBe(true);
  });

  it("should default done to false", () => {
    const result = step9Schema.safeParse({
      todo: [{ text: "Написать статью" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.todo[0].done).toBe(false);
    }
  });

  it("should reject empty todo list", () => {
    const result = step9Schema.safeParse({
      todo: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject short text", () => {
    const result = step9Schema.safeParse({
      todo: [{ text: "X", done: false }],
    });
    expect(result.success).toBe(false);
  });
});

describe("step10Schema", () => {
  const validData = {
    tldr: "X".repeat(20),
    keyFacts: Array(3).fill({ icon: "chart", text: "Some fact" }),
    definition: "X".repeat(20),
    featuredSnippet: {
      question: "X".repeat(10),
      answer: "X".repeat(20),
    },
    problemSolutionResult: {
      problem: "X".repeat(20),
      solution: "X".repeat(20),
      result: "X".repeat(20),
    },
    howTo: [{ title: "X".repeat(5), description: "X".repeat(10) }],
    methodology: "X".repeat(20),
    sources: [{ title: "Source", url: "https://example.com" }],
  };

  it("should accept valid step10 data", () => {
    const result = step10Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept 7 keyFacts", () => {
    const data = {
      ...validData,
      keyFacts: Array(7).fill({ icon: "chart", text: "Some fact" }),
    };
    const result = step10Schema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject fewer than 3 keyFacts", () => {
    const data = {
      ...validData,
      keyFacts: Array(1).fill({ icon: "chart", text: "Some fact" }),
    };
    const result = step10Schema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject more than 7 keyFacts", () => {
    const data = {
      ...validData,
      keyFacts: Array(8).fill({ icon: "chart", text: "Some fact" }),
    };
    const result = step10Schema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject short tldr", () => {
    const result = step10Schema.safeParse({
      ...validData,
      tldr: "X".repeat(10),
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid source URL", () => {
    const result = step10Schema.safeParse({
      ...validData,
      sources: [{ title: "Source", url: "not-a-url" }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty howTo array", () => {
    const result = step10Schema.safeParse({
      ...validData,
      howTo: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing sources", () => {
    const result = step10Schema.safeParse({
      ...validData,
      sources: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject short methodology", () => {
    const result = step10Schema.safeParse({
      ...validData,
      methodology: "X".repeat(10),
    });
    expect(result.success).toBe(false);
  });
});
