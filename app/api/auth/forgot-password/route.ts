import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getExpertByEmail, createPasswordReset } from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";

const forgotSchema = z.object({
  email: z.string().email().max(200),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const dbAvailable = await isDatabaseAvailable();

  const parsed = forgotSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректный email", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const expert = await getExpertByEmail(email);
  if (!expert) {
    return NextResponse.json(
      { error: "Пользователь с таким email не найден" },
      { status: 404 }
    );
  }

  const code = await createPasswordReset(email);

  resetRateLimit(request);

  return NextResponse.json({ code });
}
