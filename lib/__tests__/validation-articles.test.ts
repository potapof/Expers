import { describe, it, expect } from "vitest";
import {
  createArticleSchema,
  updateArticleFullSchema,
  actionSchema,
} from "../validation/articles";

describe("createArticleSchema", () => {
  it("should accept valid article with required title only", () => {
    const result = createArticleSchema.safeParse({
      title: "Тестовый заголовок",
    });
    expect(result.success).toBe(true);
  });

  it("should accept article with all fields", () => {
    const result = createArticleSchema.safeParse({
      title: "Полная статья",
      description: "Описание статьи",
      content: "Содержание",
      industryId: "it",
      industryName: "IT",
      subsectionId: "web",
      subsectionName: "Веб",
      categoryId: "frontend",
      categoryName: "Фронтенд",
    });
    expect(result.success).toBe(true);
  });

  it("should allow title up to 200 characters", () => {
    const result = createArticleSchema.safeParse({
      title: "A".repeat(200),
    });
    expect(result.success).toBe(true);
  });

  it("should reject title over 200 characters", () => {
    const result = createArticleSchema.safeParse({
      title: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty title", () => {
    const result = createArticleSchema.safeParse({
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing title", () => {
    const result = createArticleSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should default description to empty string", () => {
    const result = createArticleSchema.safeParse({
      title: "Тест",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
    }
  });
});

describe("updateArticleFullSchema", () => {
  it("should accept partial update with single field", () => {
    const result = updateArticleFullSchema.safeParse({
      title: "Обновлённый заголовок статьи",
    });
    expect(result.success).toBe(true);
  });

  it("should accept all fields being optional", () => {
    const result = updateArticleFullSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject slug with invalid characters", () => {
    const result = updateArticleFullSchema.safeParse({
      slug: "русский-слаг",
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid slug", () => {
    const result = updateArticleFullSchema.safeParse({
      slug: "valid-slug-2026",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid status value", () => {
    const result = updateArticleFullSchema.safeParse({
      status: "published",
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid status values", () => {
    for (const status of ["draft", "pending_review", "pending_payment"]) {
      const result = updateArticleFullSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it("should enforce title min length of 10", () => {
    const result = updateArticleFullSchema.safeParse({
      title: "Коротко",
    });
    expect(result.success).toBe(false);
  });

  it("should enforce description min length of 40", () => {
    const result = updateArticleFullSchema.safeParse({
      description: "Короткое описание",
    });
    expect(result.success).toBe(false);
  });
});

describe("actionSchema", () => {
  it("should accept valid actions", () => {
    for (const action of ["publish", "unpublish", "archive", "duplicate"]) {
      const result = actionSchema.safeParse({ action });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid action", () => {
    const result = actionSchema.safeParse({ action: "delete" });
    expect(result.success).toBe(false);
  });

  it("should reject missing action", () => {
    const result = actionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
