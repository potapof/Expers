import { describe, it, expect } from "vitest";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validation/comments";

describe("createCommentSchema", () => {
  it("should accept valid comment with all fields", () => {
    const result = createCommentSchema.safeParse({
      articleId: "article-1",
      text: "Отличная статья!",
    });
    expect(result.success).toBe(true);
  });

  it("should accept comment with parentId", () => {
    const result = createCommentSchema.safeParse({
      articleId: "article-1",
      parentId: "comment-1",
      text: "Ответ на комментарий",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty articleId", () => {
    const result = createCommentSchema.safeParse({
      articleId: "",
      text: "Текст",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty text", () => {
    const result = createCommentSchema.safeParse({
      articleId: "article-1",
      text: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject text over 5000 characters", () => {
    const result = createCommentSchema.safeParse({
      articleId: "article-1",
      text: "A".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing text field", () => {
    const result = createCommentSchema.safeParse({
      articleId: "article-1",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCommentSchema", () => {
  it("should accept valid text update", () => {
    const result = updateCommentSchema.safeParse({
      text: "Обновлённый комментарий",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty text", () => {
    const result = updateCommentSchema.safeParse({
      text: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject text over 5000 characters", () => {
    const result = updateCommentSchema.safeParse({
      text: "A".repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});
