import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getExpertByEmail, verifyEmailCode } from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";

const verifySchema = z.object({
  email: z.string().email().max(200),
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  const parsed = verifySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, code } = parsed.data;

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const expert = await getExpertByEmail(email);
  if (!expert) {
    return NextResponse.json({ error: "Email не найден" }, { status: 404 });
  }

  const ok = await verifyEmailCode(expert.id, code);
  if (!ok) {
    return NextResponse.json(
      { error: "Неверный или просроченный код" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
