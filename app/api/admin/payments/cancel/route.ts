import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getPaymentByOrderId,
  updatePaymentStatus,
  setArticleStatus,
} from "@/lib/models";
import { cancelPayment } from "@/lib/tbank";

const bodySchema = z.object({
  orderId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const admin = verifyAdmin(request);
  if ("error" in admin) return admin.error;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const payment = await getPaymentByOrderId(parsed.data.orderId);
  if (!payment) {
    return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
  }
  if (!payment.paymentId) {
    return NextResponse.json(
      { error: "У платежа нет PaymentId" },
      { status: 400 }
    );
  }

  const result = await cancelPayment(payment.paymentId);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Ошибка отмены" },
      { status: 502 }
    );
  }

  const newStatus = payment.status === "CONFIRMED" ? "REFUNDED" : "CANCELED";
  await updatePaymentStatus(parsed.data.orderId, newStatus);
  if (payment.articleId !== "publication-right" && newStatus === "REFUNDED") {
    await setArticleStatus(payment.articleId, "archived");
  }

  return NextResponse.json({ success: true, tbankStatus: result.status });
}
