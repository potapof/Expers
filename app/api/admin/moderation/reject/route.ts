import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import { rejectArticle } from "@/lib/models";

const bodySchema = z.object({
  articleId: z.string().min(1),
  reason: z.string().min(1).max(1000),
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
    const ok = await rejectArticle(parsed.data.articleId, parsed.data.reason);
    if (!ok) {
      return NextResponse.json(
        { error: "Статья не в статусе ожидания проверки" },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка отклонения" }, { status: 500 });
  }
}
