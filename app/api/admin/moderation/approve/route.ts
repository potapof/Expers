import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import { approveArticle } from "@/lib/models";

const bodySchema = z.object({
  articleId: z.string().min(1),
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

  try {
    await approveArticle(parsed.data.articleId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Ошибка одобрения", details: String(e) },
      { status: 500 }
    );
  }
}
