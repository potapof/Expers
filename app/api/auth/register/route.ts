import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createExpert, getExpertByEmail } from "@/lib/models";
import { hashPassword, generateToken, toSafeExpert } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";

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
      { error: "Эксперт с таким email уже зарегистрирован" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const id = `expert-${crypto.randomUUID()}`;

  const expert = await createExpert({
    id,
    name,
    email,
    passwordHash,
  });

  resetRateLimit(request);

  const token = generateToken(expert);

  return NextResponse.json(
    {
      expert: toSafeExpert(expert),
      token,
    },
    { status: 201 }
  );
}
