import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Expert, SafeExpert } from "./models";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET environment variable is not set. " +
      "Set it in .env.local or .env.docker before starting the application."
  );
}
const JWT_SECRET: string = jwtSecret;
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
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): {
  id: string;
  email: string;
  name: string;
  role: "reader" | "expert";
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
      role?: "reader" | "expert";
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
