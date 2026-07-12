import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getPaymentByOrderId,
  updatePaymentStatus,
  setArticleStatus,
  type PaymentStatus,
} from "@/lib/models";
import { verifyNotificationToken } from "@/lib/tbank";

function ok() {
  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new NextResponse("ERROR", { status: 400 });
  }

  if (!verifyNotificationToken(body)) {
    return new NextResponse("TOKEN_INVALID", { status: 403 });
  }

  if (!(await isDatabaseAvailable())) {
    return new NextResponse("ERROR", { status: 503 });
  }

  const orderId = typeof body.OrderId === "string" ? body.OrderId : "";
  const status = typeof body.Status === "string" ? body.Status : "";
  const success = body.Success === true || body.Success === "true";
  const paymentId =
    body.PaymentId !== undefined ? String(body.PaymentId) : undefined;

  if (!orderId) return ok();

  const payment = await getPaymentByOrderId(orderId);
  if (!payment) return ok();

  try {
    if (success && status === "CONFIRMED") {
      if (payment.status !== "CONFIRMED") {
        await updatePaymentStatus(orderId, "CONFIRMED", paymentId);
        await setArticleStatus(payment.articleId, "published");
      }
    } else if (status === "REJECTED" || status === "CANCELED") {
      await updatePaymentStatus(orderId, status as PaymentStatus, paymentId);
    } else if (status === "REFUNDED") {
      await updatePaymentStatus(orderId, "REFUNDED", paymentId);
      await setArticleStatus(payment.articleId, "archived");
    }
  } catch {
    return new NextResponse("ERROR", { status: 500 });
  }

  return ok();
}
