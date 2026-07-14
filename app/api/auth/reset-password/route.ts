import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPasswordReset, updatePassword } from "@/lib/models";
import { hashPassword } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";

const resetSchema = z.object({
  email: z.string().email().max(200),
  code: z.string().length(6),
  password: z.string().min(6).max(100),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const dbAvailable = await isDatabaseAvailable();

  const parsed = resetSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, code, password } = parsed.data;

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const valid = await verifyPasswordReset(email, code);
  if (!valid) {
    return NextResponse.json(
      { error: "Неверный или просроченный код" },
      { status: 400 }
    );
  }

  const newHash = await hashPassword(password);
  await updatePassword(email, newHash);

  resetRateLimit(request);

  return NextResponse.json({ ok: true });
}
