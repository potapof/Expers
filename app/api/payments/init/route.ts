import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { getArticleById, createPayment } from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import {
  initPayment,
  isPaymentConfigured,
  PUBLICATION_PRICE_KOPECKS,
} from "@/lib/tbank";

const bodySchema = z.object({
  articleId: z.string().min(1).max(200),
});

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

  if (payload.role !== "expert") {
    return NextResponse.json(
      { error: "Публикация доступна только экспертам" },
      { status: 403 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
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

  const article = await getArticleById(parsed.data.articleId);
  if (!article) {
    return NextResponse.json({ error: "Статья не найдена" }, { status: 404 });
  }
  if (article.authorId !== payload.id) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  if (article.status === "published") {
    return NextResponse.json(
      { error: "Статья уже опубликована" },
      { status: 409 }
    );
  }

  const baseUrl =
    process.env.APP_BASE_URL || request.nextUrl.origin.replace(/\/$/, "");
  const orderId = `order-${article.id}-${Date.now()}`;

  const result = await initPayment({
    orderId,
    amount: PUBLICATION_PRICE_KOPECKS,
    description: `Публикация статьи «${article.title.slice(0, 100)}»`,
    notificationUrl: `${baseUrl}/api/payments/webhook`,
    successUrl: `${baseUrl}/cabinet`,
    failUrl: `${baseUrl}/articles/new`,
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
      articleId: article.id,
      title: article.title,
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
    orderId,
    amount: PUBLICATION_PRICE_KOPECKS,
  });
}
