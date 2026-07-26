import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createExpert,
  getExpertByEmail,
  createEmailVerification,
} from "@/lib/models";
import { hashPassword, generateToken, toSafeExpert } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";
import { sendMail } from "@/lib/mail";
import { verificationEmail, welcomeEmail } from "@/lib/mail-templates";

const registerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  password: z.string().min(6).max(100),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const dbAvailable = await isDatabaseAvailable();

  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const existing = await getExpertByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже зарегистрирован" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const id = `user-${crypto.randomUUID()}`;

  const expert = await createExpert({
    id,
    name,
    email,
    passwordHash,
    role: "reader",
  });

  resetRateLimit(request);

  const token = generateToken(expert);

  const code = await createEmailVerification(id, email);
  sendMail({
    to: email,
    subject: "Подтверждение почты — Expers",
    html: verificationEmail(code),
  }).catch((err) => console.error("Verification email failed:", err));
  sendMail({
    to: email,
    subject: "Добро пожаловать в Expers",
    html: welcomeEmail(name),
  }).catch((err) => console.error("Welcome email failed:", err));

  return NextResponse.json(
    {
      expert: { ...toSafeExpert(expert), email_verified: false },
      token,
    },
    { status: 201 }
  );
}
