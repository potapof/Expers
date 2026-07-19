import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
  sign: vi.fn(),
  verify: vi.fn(),
}));

const mockExpert = {
  id: "exp-1",
  name: "Иван Петров",
  email: "ivan@example.com",
  passwordHash: "hashed-password",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("hashPassword", () => {
  it("should call bcrypt.hash with password and salt rounds", async () => {
    const { hashPassword } = await import("../auth");
    const mockHash = vi.mocked(bcrypt.hash);
    mockHash.mockResolvedValue("hashed-password" as never);

    const result = await hashPassword("my-password");

    expect(mockHash).toHaveBeenCalledWith("my-password", 10);
    expect(result).toBe("hashed-password");
  });
});

describe("verifyPassword", () => {
  it("should call bcrypt.compare with password and hash", async () => {
    const { verifyPassword } = await import("../auth");
    const mockCompare = vi.mocked(bcrypt.compare);
    mockCompare.mockResolvedValue(true as never);

    const result = await verifyPassword("my-password", "hashed-password");

    expect(mockCompare).toHaveBeenCalledWith("my-password", "hashed-password");
    expect(result).toBe(true);
  });

  it("should return false for wrong password", async () => {
    const { verifyPassword } = await import("../auth");
    const mockCompare = vi.mocked(bcrypt.compare);
    mockCompare.mockResolvedValue(false as never);

    const result = await verifyPassword("wrong-password", "hashed-password");

    expect(result).toBe(false);
  });
});

describe("generateToken", () => {
  it("should call jwt.sign with expert payload and secret", async () => {
    const { generateToken } = await import("../auth");
    const mockSign = vi.mocked(jwt.sign);
    mockSign.mockReturnValue("jwt-token" as never);

    const result = generateToken(mockExpert);

    expect(mockSign).toHaveBeenCalledWith(
      {
        id: "exp-1",
        email: "ivan@example.com",
        name: "Иван Петров",
        role: "expert",
      },
      "test-secret-for-unit-tests",
      { algorithm: "HS256", expiresIn: "7d" }
    );
    expect(result).toBe("jwt-token");
  });
});

describe("verifyToken", () => {
  it("should return decoded payload for valid token", async () => {
    const { verifyToken } = await import("../auth");
    const mockVerify = vi.mocked(jwt.verify);
    const payload = {
      id: "exp-1",
      email: "ivan@example.com",
      name: "Иван Петров",
    };
    mockVerify.mockReturnValue(payload as never);

    const result = verifyToken("valid-token");

    expect(mockVerify).toHaveBeenCalledWith(
      "valid-token",
      "test-secret-for-unit-tests",
      { algorithms: ["HS256"] }
    );
    expect(result).toEqual({ ...payload, role: "expert" });
  });

  it("should return null for invalid token", async () => {
    const { verifyToken } = await import("../auth");
    const mockVerify = vi.mocked(jwt.verify);
    mockVerify.mockImplementation(() => {
      throw new Error("jwt malformed");
    });

    const result = verifyToken("invalid-token");

    expect(result).toBeNull();
  });
});

describe("toSafeExpert", () => {
  it("should remove passwordHash from expert", async () => {
    const { toSafeExpert } = await import("../auth");

    const safe = toSafeExpert(mockExpert);

    expect(safe).not.toHaveProperty("passwordHash");
    expect(safe).toEqual({
      id: "exp-1",
      name: "Иван Петров",
      email: "ivan@example.com",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });
  });
});
