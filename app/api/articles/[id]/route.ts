import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getArticleById,
  updateArticle,
  hasConfirmedPayment,
} from "@/lib/models";
import { mockArticles } from "@/lib/mock-data";
import { verifyToken } from "@/lib/auth";
import { updateArticleFullSchema } from "@/lib/validation/articles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbAvailable = await isDatabaseAvailable();

  const authHeader = request.headers.get("authorization");
  let userId: string | null = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const payload = verifyToken(authHeader.slice(7));
    userId = payload?.id ?? null;
  }

  if (dbAvailable) {
    try {
      const article = await getArticleById(id);
      if (article) {
        if (
          article.status === "published" ||
          article.status === "pending_review" ||
          (userId && article.expertId === userId)
        ) {
          return NextResponse.json({ article });
        }
        return NextResponse.json(
          { error: "Статья не найдена" },
          { status: 404 }
        );
      }
    } catch {
      // fall through to mock
    }
  }

  const mock = mockArticles.find((a) => a.id === id);
  if (mock) {
    return NextResponse.json({ article: mock });
  }

  return NextResponse.json({ error: "Статья не найдена" }, { status: 404 });
}

function transitionStatus(current: string, requested?: string): string {
  if (
    requested &&
    ["draft", "pending_review", "pending_payment"].includes(requested)
  ) {
    return requested;
  }
  if (["published", "archived", "pending_review"].includes(current)) {
    return "draft";
  }
  return current;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных временно недоступна" },
      { status: 503 }
    );
  }

  const article = await getArticleById(id);
  if (!article) {
    return NextResponse.json({ error: "Статья не найдена" }, { status: 404 });
  }

  if (article.expertId !== payload.id) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректное тело запроса" },
      { status: 400 }
    );
  }

  const parsed = updateArticleFullSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    status: requestedStatus,
    _publishAction,
    ...updateFields
  } = parsed.data as Record<string, unknown>;

  let targetStatus = transitionStatus(
    article.status,
    requestedStatus as string | undefined
  );

  if (targetStatus === "pending_payment") {
    const hasPaid = await hasConfirmedPayment(payload.id);
    if (hasPaid) {
      targetStatus = "pending_review";
    }
  }

  const wordCount = (
    typeof updateFields.content === "string"
      ? updateFields.content
      : article.content
  )
    .split(/\s+/)
    .filter(Boolean).length;
  const readTime = `${Math.max(1, Math.round(wordCount / 150))} мин`;

  const finalUpdate: Record<string, unknown> = {
    ...updateFields,
    status: targetStatus,
    readTime,
  };

  const updated = await updateArticle(
    id,
    finalUpdate as Partial<typeof article>
  );

  return NextResponse.json({ article: updated });
}
