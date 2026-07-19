import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Expert, SafeExpert } from "./models";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not set. " +
        "Set it in .env before starting the application."
    );
  }
  return secret;
}
const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(expert: Expert): string {
  return jwt.sign(
    {
      id: expert.id,
      email: expert.email,
      name: expert.name,
      role: expert.role ?? "expert",
    },
    getJwtSecret(),
    { algorithm: "HS256", expiresIn: "7d" }
  );
}

export function verifyToken(token: string): {
  id: string;
  email: string;
  name: string;
  role: "reader" | "expert" | "admin";
} | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as {
      id: string;
      email: string;
      name: string;
      role?: "reader" | "expert" | "admin";
    };
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role ?? "expert",
    };
  } catch {
    return null;
  }
}

export function toSafeExpert(expert: Expert): SafeExpert {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = expert;
  return safe;
}
