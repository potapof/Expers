import { describe, it, expect } from "vitest";
import { transliterate } from "../translit";

describe("transliterate", () => {
  it("should transliterate Cyrillic to Latin", () => {
    const result = transliterate("привет");
    expect(result).toBe("privet");
  });

  it("should handle special characters as hyphens", () => {
    const result = transliterate("здравствуй, мир!");
    expect(result).toBe("zdravstvuy-mir");
  });

  it("should replace spaces with hyphens", () => {
    const result = transliterate("как дела");
    expect(result).toBe("kak-dela");
  });

  it("should collapse multiple hyphens into one", () => {
    const result = transliterate("привет   мир");
    expect(result).toBe("privet-mir");
  });

  it("should strip leading and trailing hyphens", () => {
    const result = transliterate("  привет  ");
    expect(result).toBe("privet");
  });

  it("should handle empty string", () => {
    const result = transliterate("");
    expect(result).toBe("");
  });

  it("should preserve digits", () => {
    const result = transliterate("статья 2026");
    expect(result).toBe("statya-2026");
  });

  it("should handle mixed Latin and Cyrillic", () => {
    const result = transliterate("AI в производстве");
    expect(result).toBe("ai-v-proizvodstve");
  });

  it("should handle complex slug example", () => {
    const result = transliterate(
      "Как ИИ меняет автоматизацию производства в 2026 году"
    );
    expect(result).toBe(
      "kak-ii-menyaet-avtomatizatsiyu-proizvodstva-v-2026-godu"
    );
  });

  it("should handle ё, й, ъ, ь, ы, э, ю, я", () => {
    const result = transliterate("ёжик йод объект подъезд пыль этаж юг яма");
    expect(result).toBe("yozhik-yod-obekt-podezd-pyl-etazh-yug-yama");
  });
});
