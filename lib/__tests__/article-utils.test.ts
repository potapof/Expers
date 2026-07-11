import { describe, it, expect } from "vitest";
import {
  getIndustryById,
  getSubsection,
  getCategory,
  estimateReadTime,
} from "../article-utils";

describe("getIndustryById", () => {
  it("should return industry for valid id", () => {
    const result = getIndustryById("it-tech");
    expect(result).not.toBeUndefined();
    expect(result?.id).toBe("it-tech");
    expect(result?.name).toBe("IT & Технологии");
  });

  it("should return industry for another valid id", () => {
    const result = getIndustryById("finance");
    expect(result).not.toBeUndefined();
    expect(result?.id).toBe("finance");
    expect(result?.name).toBe("Финансы");
  });

  it("should return undefined for invalid id", () => {
    const result = getIndustryById("non-existent");
    expect(result).toBeUndefined();
  });

  it("should return undefined for empty string", () => {
    const result = getIndustryById("");
    expect(result).toBeUndefined();
  });
});

describe("getSubsection", () => {
  it("should return subsection for valid industry and subsection ids", () => {
    const result = getSubsection("it-tech", "software");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("software");
    expect(result?.name).toBe("Программное обеспечение");
  });

  it("should return null for invalid industry", () => {
    const result = getSubsection("non-existent", "software");
    expect(result).toBeNull();
  });

  it("should return null for invalid subsection", () => {
    const result = getSubsection("it-tech", "non-existent");
    expect(result).toBeNull();
  });
});

describe("getCategory", () => {
  it("should return category for valid industry and category ids", () => {
    const result = getCategory("it-tech", "ai-ml");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("ai-ml");
    expect(result?.name).toBe("ИИ и машинное обучение");
  });

  it("should return category from another subsection in same industry", () => {
    const result = getCategory("it-tech", "devops");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("devops");
    expect(result?.name).toBe("DevOps");
  });

  it("should return null for invalid industry", () => {
    const result = getCategory("non-existent", "ai-ml");
    expect(result).toBeNull();
  });

  it("should return null for invalid category", () => {
    const result = getCategory("it-tech", "non-existent");
    expect(result).toBeNull();
  });
});

describe("estimateReadTime", () => {
  it("should return 1 мин for empty string", () => {
    const result = estimateReadTime("");
    expect(result).toBe("1 мин");
  });

  it("should return 1 мин for very short text", () => {
    const result = estimateReadTime("hello world");
    expect(result).toBe("1 мин");
  });

  it("should calculate correctly for 150 words", () => {
    const words = Array(150).fill("word").join(" ");
    const result = estimateReadTime(words);
    expect(result).toBe("1 мин");
  });

  it("should calculate correctly for 300 words", () => {
    const words = Array(300).fill("word").join(" ");
    const result = estimateReadTime(words);
    expect(result).toBe("2 мин");
  });

  it("should calculate correctly for 450 words", () => {
    const words = Array(450).fill("word").join(" ");
    const result = estimateReadTime(words);
    expect(result).toBe("3 мин");
  });

  it("should handle text with multiple spaces and newlines", () => {
    const result = estimateReadTime("word   word\n\nword\tword");
    expect(result).toBe("1 мин");
  });
});
