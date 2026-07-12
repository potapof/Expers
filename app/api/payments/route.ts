import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getPaymentsByUser } from "@/lib/models";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }
  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    return NextResponse.json(
      { error: "Недействительный токен" },
      { status: 401 }
    );
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({ payments: [] });
  }

  try {
    const payments = await getPaymentsByUser(payload.id);
    return NextResponse.json({
      payments: payments.map((p) => ({
        orderId: p.orderId,
        articleId: p.articleId,
        title: p.title,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ payments: [] });
  }
}
