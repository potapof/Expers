import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  createArticle,
  hasConfirmedPayment,
  getExpertById,
} from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import { importArticleSchema } from "@/lib/import-validation";

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

  const dbAvailable = await isDatabaseAvailable();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const articleData = body.articleData;
  if (!articleData) {
    return NextResponse.json(
      { error: "Отсутствует articleData" },
      { status: 400 }
    );
  }

  const parsed = importArticleSchema.safeParse(articleData);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные статьи", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const id = `article-${crypto.randomUUID()}`;
  const wordCount = parsed.data.content.split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(1, Math.round(wordCount / 150))} мин`;

  let hasPaid = false;
  let authorName = payload.name;
  if (dbAvailable) {
    try {
      hasPaid = await hasConfirmedPayment(payload.id);
    } catch (err) {
      console.error("Ошибка проверки оплаты при импорте:", err);
      hasPaid = false;
    }
    try {
      const expert = await getExpertById(payload.id);
      if (expert) authorName = expert.name;
    } catch {
      // fall back to token name
    }
  }

  const articlePayload = {
    id,
    authorId: payload.id,
    authorName,
    readTime,
    status: hasPaid ? ("pending_review" as const) : ("draft" as const),
    expertId: payload.id,
    sectionsText: parsed.data.sectionsText ?? null,
    ...parsed.data,
    slug: parsed.data.slug || undefined,
  };

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  try {
    const article = await createArticle(articlePayload);
    return NextResponse.json({ article }, { status: 201 });
  } catch (err) {
    console.error("Ошибка сохранения статьи при импорте:", err);
    return NextResponse.json(
      { error: "Ошибка сохранения статьи" },
      { status: 500 }
    );
  }
}
