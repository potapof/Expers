import { describe, it, expect } from "vitest";
import { updateProfileSchema, socialLinkSchema } from "../validation/profile";

describe("updateProfileSchema", () => {
  it("should accept valid name", () => {
    const result = updateProfileSchema.safeParse({
      name: "Иван Петров",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = updateProfileSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("should accept bio up to 2000 chars", () => {
    const result = updateProfileSchema.safeParse({
      bio: "A".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it("should reject bio over 2000 chars", () => {
    const result = updateProfileSchema.safeParse({
      bio: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should accept expertise array up to 20 items", () => {
    const result = updateProfileSchema.safeParse({
      expertise: Array(20).fill("тема"),
    });
    expect(result.success).toBe(true);
  });

  it("should reject expertise array over 20 items", () => {
    const result = updateProfileSchema.safeParse({
      expertise: Array(21).fill("тема"),
    });
    expect(result.success).toBe(false);
  });

  it("should accept all fields being optional", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("socialLinkSchema", () => {
  it("should accept valid URL", () => {
    const result = socialLinkSchema.safeParse({
      platform: "telegram",
      url: "https://t.me/username",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid URL", () => {
    const result = socialLinkSchema.safeParse({
      platform: "website",
      url: "not-a-valid-url",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty platform", () => {
    const result = socialLinkSchema.safeParse({
      platform: "",
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("should accept profile with socialLinks", () => {
    const result = updateProfileSchema.safeParse({
      socialLinks: [
        { platform: "telegram", url: "https://t.me/user" },
        { platform: "github", url: "https://github.com/user" },
      ],
    });
    expect(result.success).toBe(true);
  });
});
