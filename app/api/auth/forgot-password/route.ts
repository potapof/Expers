import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getExpertByEmail, createPasswordReset } from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";
import { sendMail } from "@/lib/mail";
import { resetPasswordEmail } from "@/lib/mail-templates";

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

  if (expert) {
    const code = await createPasswordReset(email);
    sendMail({
      to: email,
      subject: "Сброс пароля — Expers",
      html: resetPasswordEmail(code),
    }).catch((err) => console.error("Reset password email failed:", err));
  }

  resetRateLimit(request);

  return NextResponse.json({
    ok: true,
    message: "Если указанный email зарегистрирован, инструкция отправлена",
  });
}
