import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getPaymentByOrderId,
  updatePaymentStatus,
  setArticleStatus,
  getArticleById,
} from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import { getPaymentState } from "@/lib/tbank";

const SUCCESS_STATES = new Set(["CONFIRMED", "AUTHORIZED"]);
const REJECTED_STATES = new Set(["REJECTED", "AUTH_FAIL", "DEADLINE_EXPIRED"]);
const CANCELED_STATES = new Set(["CANCELED", "REVERSED", "PARTIAL_REVERSED"]);
const REFUNDED_STATES = new Set(["REFUNDED", "PARTIAL_REFUNDED"]);

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

  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Требуется orderId" }, { status: 400 });
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const payment = await getPaymentByOrderId(orderId);
  if (!payment) {
    return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
  }
  if (payment.userId !== payload.id) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  if (payment.status === "CONFIRMED") {
    const article = await getArticleById(payment.articleId);
    return NextResponse.json({
      status: "CONFIRMED",
      articleStatus: article?.status ?? null,
    });
  }

  if (!payment.paymentId) {
    return NextResponse.json({ status: payment.status, articleStatus: null });
  }

  const state = await getPaymentState(payment.paymentId);
  if (!state.ok || !state.status) {
    return NextResponse.json(
      { error: state.error || "Ошибка получения статуса" },
      { status: 502 }
    );
  }

  try {
    if (SUCCESS_STATES.has(state.status)) {
      await updatePaymentStatus(orderId, "CONFIRMED");
      if (payment.articleId !== "publication-right") {
        await setArticleStatus(payment.articleId, "pending_review");
      }
    } else if (REJECTED_STATES.has(state.status)) {
      await updatePaymentStatus(orderId, "REJECTED");
    } else if (CANCELED_STATES.has(state.status)) {
      await updatePaymentStatus(orderId, "CANCELED");
    } else if (REFUNDED_STATES.has(state.status)) {
      await updatePaymentStatus(orderId, "REFUNDED");
      if (payment.articleId !== "publication-right") {
        await setArticleStatus(payment.articleId, "archived");
      }
    }
  } catch {
    return NextResponse.json(
      { error: "Ошибка обновления статуса" },
      { status: 500 }
    );
  }

  const updated = await getPaymentByOrderId(orderId);
  const article = await getArticleById(payment.articleId);

  return NextResponse.json({
    status: updated?.status ?? payment.status,
    tbankStatus: state.status,
    articleStatus: article?.status ?? null,
  });
}
