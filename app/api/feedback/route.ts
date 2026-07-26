import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mail";
import { feedbackNotificationEmail } from "@/lib/mail-templates";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";

const feedbackSchema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email().max(200),
  subject: z.string().max(500).optional(),
  message: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const parsed = feedbackSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = parsed.data;

  sendMail({
    to: "info@expers.ru",
    subject: subject || "Сообщение с сайта EXPERS.ru",
    html: feedbackNotificationEmail(name, email, subject, message),
  }).catch((err) => console.error("Feedback email failed:", err));

  resetRateLimit(request);

  return NextResponse.json({ ok: true });
}
