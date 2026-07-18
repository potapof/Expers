import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { createPayment } from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import {
  initPayment,
  isPaymentConfigured,
  PUBLICATION_PRICE_KOPECKS,
} from "@/lib/tbank";

export async function POST(request: NextRequest) {
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

  if (!isPaymentConfigured()) {
    return NextResponse.json(
      { error: "Приём платежей не настроен" },
      { status: 503 }
    );
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const baseUrl =
    process.env.APP_BASE_URL || request.nextUrl.origin.replace(/\/$/, "");

  const orderId = `right-${payload.id.slice(-12)}-${Date.now().toString(36)}`;

  const result = await initPayment({
    orderId,
    amount: PUBLICATION_PRICE_KOPECKS,
    description: "Право публикации на Expers",
    notificationUrl: `${baseUrl}/api/payments/webhook`,
    successUrl: `${baseUrl}/payment/done`,
    failUrl: `${baseUrl}/payment/fail`,
    customerEmail: payload.email,
    receiptItemName: "Право публикации на Expers",
  });

  if (!result.ok || !result.paymentUrl) {
    return NextResponse.json(
      { error: result.error || "Ошибка инициализации платежа" },
      { status: 502 }
    );
  }

  try {
    await createPayment({
      orderId,
      paymentId: result.paymentId || "",
      articleId: "publication-right",
      title: "Право публикации на Expers",
      userId: payload.id,
      amount: PUBLICATION_PRICE_KOPECKS,
      status: "NEW",
    });
  } catch {
    return NextResponse.json(
      { error: "Ошибка сохранения платежа" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    paymentUrl: result.paymentUrl,
    paymentId: result.paymentId || "",
    orderId,
    amount: PUBLICATION_PRICE_KOPECKS,
  });
}
