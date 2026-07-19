import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { getArticleById, createPayment } from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { resolveBaseUrl } from "@/lib/base-url";
import {
  initPayment,
  isPaymentConfigured,
  ensureProductionConfig,
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

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const rateLimit = checkRateLimit(request);
  if (rateLimit) return rateLimit;

  if (!isPaymentConfigured()) {
    return NextResponse.json(
      { error: "Приём платежей не настроен" },
      { status: 503 }
    );
  }

  if (process.env.TBANK_TEST_MODE !== "true") {
    const warnings = ensureProductionConfig();
    if (warnings.length > 0) {
      console.warn("T-Bank production config warnings:", warnings);
    }
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
  if (article.status === "pending_review") {
    return NextResponse.json(
      { error: "Статья уже на модерации — оплата не требуется" },
      { status: 409 }
    );
  }

  const baseUrl = resolveBaseUrl(request);

  if (
    process.env.TBANK_TEST_MODE !== "true" &&
    !baseUrl.startsWith("https://")
  ) {
    console.warn(
      `T-Bank: APP_BASE_URL (${baseUrl}) не начинается с https://. ` +
        "Webhook Т-Банка не сможет достучаться до сервера."
    );
  }

  const orderId = `ord-${article.id.slice(-12)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const result = await initPayment({
    orderId,
    amount: PUBLICATION_PRICE_KOPECKS,
    description: `Публикация статьи «${article.title.slice(0, 100)}»`,
    notificationUrl: `${baseUrl}/api/payments/webhook`,
    successUrl: `${baseUrl}/payment/done`,
    failUrl: `${baseUrl}/payment/fail`,
    customerEmail: payload.email,
    receiptItemName: "Публикация статьи на Expers",
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
    paymentId: result.paymentId || "",
    orderId,
    amount: PUBLICATION_PRICE_KOPECKS,
  });
}
