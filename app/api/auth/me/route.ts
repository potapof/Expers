import { NextRequest, NextResponse } from "next/server";
import { getExpertById, hasConfirmedPayment } from "@/lib/models";
import { verifyToken, toSafeExpert } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Недействительный токен" },
      { status: 401 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const expert = await getExpertById(payload.id);
  if (!expert) {
    return NextResponse.json({ error: "Эксперт не найден" }, { status: 404 });
  }

  const hasPaid = await hasConfirmedPayment(payload.id);

  return NextResponse.json({
    expert: { ...toSafeExpert(expert), hasPaid },
  });
}
